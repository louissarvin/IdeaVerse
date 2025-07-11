// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IdeaNFT.sol";

contract TeamManager is AccessControl, ReentrancyGuard {
    IdeaNFT public immutable ideaNFT;
    IERC20 public immutable USDC;

    enum TeamStatus { Forming, Full}
    enum MilestoneStatus { Pending, InProgress, Submitted, Approved, Rejected }

    struct Team {
        uint256 teamId;
        uint256 createdAt;
        address leader;          // 20 bytes
        uint96 requiredStake;    // Packed with leader (12 bytes)
        uint128 requiredMembers; // 16 bytes
        TeamStatus status;       // 1 byte
        uint120 reserved;        // Packed with status (15 bytes) - for future use
        address[] members;
        string teamName;
        string projectName;
        string description;
        string[] roles;
        string[] tags;
    }

    struct Milestone {
        uint256 milestoneId;
        uint256 teamId;
        string title;
        string description;
        uint256 deadline;
        uint256 stakeAmount;
        MilestoneStatus status;
        string proofIpfsHash;
        address validator;
        uint256 submittedAt;
        uint256 reviewedAt;
    }

    struct Stake {
        address staker;          // 20 bytes
        uint96 amount;           // Packed with staker (12 bytes)
        uint256 timestamp;
        bool withdrawn;
    }

    // State variables
    uint256 private _nextTeamId;
    uint256 private _nextMilestoneId;
    uint256 private _nextInvitationId;

    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**6; // 100 USDC
    

    // Mappings
    mapping(uint256 => Team) public teams;
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => mapping(address => Stake)) public teamStakes; // teamId => member => stake
    mapping(address => uint256[]) public userTeams;
    mapping(uint256 => uint256[]) public teamMilestones; // teamId => milestoneIds

    // Events
    event TeamCreated(uint256 indexed teamId, address indexed leader, string teamName);
    event JoinTeam(uint256 indexed teamId, address indexed member, uint256 amount);
    event TeamActivated(uint256 indexed teamId);
    event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed teamId, string title, uint256 deadline);
    event MilestoneProofSubmitted(uint256 indexed milestoneId, string proofIpfsHash, uint256 timestamp);
    event MilestoneApproved(uint256 indexed milestoneId, address indexed validator, uint256 timestamp);
    event MilestoneRejected(uint256 indexed milestoneId, address indexed validator, string reason, uint256 timestamp);
    event StakeWithdrawn(uint256 indexed teamId, address indexed member, uint256 amount);

    constructor(address _ideaNFT, address _mockUSDC) {
        ideaNFT = IdeaNFT(_ideaNFT);
        USDC = IERC20(_mockUSDC);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyTeamLeader(uint256 _teamId) {
        if (teams[_teamId].leader != msg.sender) {
            revert("Only team leader can perform this action");
        }
        _;
    }

    modifier onlyTeamMember(uint256 _teamId) {
        if (!isTeamMember(_teamId, msg.sender)) {
            revert("Only team members can perform this action");
        }
        _;
    }

    modifier teamExists(uint256 _teamId) {
        if (teams[_teamId].leader == address(0)) {
            revert("Team does not exist");
        }
        _;
    }

    // =============================================================
    //                      TEAM FORMATION
    // =============================================================

    function createTeam(
        uint256 _requiredMembers,
        uint256 _requiredStake,
        string memory _teamName,
        string memory _description,
        string memory _projectName,
        string[] memory _roles,
        string[] memory _tags
    ) external returns (uint256) {
        if(USDC.balanceOf(msg.sender) < _requiredStake) {
            revert("Balance not exceed");
        }

        if (!ideaNFT.hasRole(ideaNFT.SUPERHERO_ROLE(), msg.sender)) {
            revert("To create team must be a superhero");
        }

        uint256 _teamId = _nextTeamId++;

        teams[_teamId] = Team({
            teamId: _teamId,
            createdAt: block.timestamp,
            leader: msg.sender,
            requiredStake: uint96(_requiredStake),
            requiredMembers: uint128(_requiredMembers),
            status: TeamStatus.Forming,
            reserved: 0,
            members: new address[](0),
            teamName: _teamName,
            projectName: _projectName,
            description: _description,
            roles: _roles,
            tags: _tags
        });

        userTeams[msg.sender].push(_teamId);
        USDC.transferFrom(msg.sender, address(this), _requiredStake);

        // Record leader's stake
        teamStakes[_teamId][msg.sender] = Stake({
            staker: msg.sender,
            amount: uint96(_requiredStake),
            timestamp: block.timestamp,
            withdrawn: false
        });

        emit TeamCreated(_teamId, msg.sender, _teamName);
        return _teamId;
    }

    function joinTeam(
        uint256 _teamId,
        string memory _role
        ) external teamExists(_teamId) {
        Team storage team = teams[_teamId];

        if(USDC.balanceOf(msg.sender) < team.requiredStake) {
            revert("Balance not exceed");
        }
        
        if (team.status != TeamStatus.Forming) {
            revert("Team is not in forming stage");
        }
        
        if (team.members.length >= team.requiredMembers) {
            revert("Team is already at maximum capacity");
        }

        if (isTeamMember(_teamId, msg.sender)) {
            revert("User is already a team member");
        }

        if (!ideaNFT.hasRole(ideaNFT.SUPERHERO_ROLE(), msg.sender)) {
            revert("Join must be a superhero");
        }

        team.members.push(msg.sender);
        userTeams[msg.sender].push(_teamId);
        USDC.transferFrom(msg.sender, address(this), team.requiredStake);
        
        teamStakes[_teamId][msg.sender] = Stake({
            staker: msg.sender,
            amount: uint96(team.requiredStake),
            timestamp: block.timestamp,
            withdrawn: false
        });

        // Check if team is now full after adding the member
        if (team.members.length == team.requiredMembers) {
            team.status = TeamStatus.Full;
            emit TeamActivated(_teamId);
        }

        for(uint256 i = 0; i < team.roles.length; i++) {
            if(bytes(team.roles[i]).length == bytes(_role).length) {
                team.roles[i] = ""; // Reset role to empty string (for security reasons -> will be removed later by superhero function below)
                break;
            } 
        }
        
        emit JoinTeam(_teamId, msg.sender, team.requiredStake);
    }

    function releaseStake(uint256 _teamId) external onlyTeamLeader(_teamId) {
        Team memory team = teams[_teamId];

        if(team.status != TeamStatus.Full) {
            revert("Team is not reached the required");
        }

        // Release leader's stake
        USDC.transferFrom(address(this), team.leader, team.requiredStake);
        teamStakes[_teamId][team.leader] = Stake({
            staker: team.leader,
            amount: 0,
            timestamp: block.timestamp,
            withdrawn: true
        });

        // Release members' stakes
        for(uint256 i = 0; i < team.members.length; i++) {
            USDC.transferFrom(address(this), team.members[i], team.requiredStake);
            teamStakes[_teamId][team.members[i]] = Stake({
                staker: team.members[i],
                amount: 0,
                timestamp: block.timestamp,
                withdrawn: true
            });
        }

        delete team;
    }

    // =============================================================
    //                      HELPER FUNCTIONS
    // =============================================================

    function isTeamMember(uint256 _teamId, address _user) public view returns (bool) {
        Team storage team = teams[_teamId];
        for (uint256 i = 0; i < team.members.length; i++) {
            if (team.members[i] == _user) {
                return true;
            }
        }
        return false;
    }

    function getTeamMembers(uint256 _teamId) external view returns (address[] memory) {
        return teams[_teamId].members;
    }

    function getUserTeams(address _user) external view returns (uint256[] memory) {
        return userTeams[_user];
    }

    function getTeamStake(uint256 _teamId, address _member) external view returns (Stake memory) {
        return teamStakes[_teamId][_member];
    }

    /**
     * @dev Get total number of teams
     */
    function totalTeams() external view returns (uint256) {
        return _nextTeamId;
    }

    /**
     * @dev Get team by ID
     */
    function getTeam(uint256 _teamId) external view returns (Team memory) {
        return teams[_teamId];
    }

    // =============================================================
    //                    BASIC HELPER FUNCTIONS
    // =============================================================

    /**
     * @dev Get team details with member stakes
     */
    function getTeamWithStakes(uint256 _teamId) external view returns (
        Team memory team,
        Stake[] memory memberStakes,
        uint256 totalStaked
    ) {
        team = teams[_teamId];
        
        // Include leader + members
        uint256 totalMembers = team.members.length + 1;
        memberStakes = new Stake[](totalMembers);
        
        // Leader's stake
        memberStakes[0] = teamStakes[_teamId][team.leader];
        totalStaked += uint256(memberStakes[0].amount);
        
        // Members' stakes
        for (uint256 i = 0; i < team.members.length; i++) {
            memberStakes[i + 1] = teamStakes[_teamId][team.members[i]];
            totalStaked += uint256(memberStakes[i + 1].amount);
        }
    }

    /**
     * @dev Get user's team participation history
     */
    function getUserTeamHistory(address _user) external view returns (
        uint256[] memory teamIds,
        string[] memory teamNames,
        TeamStatus[] memory statuses,
        bool[] memory isLeader,
        uint256[] memory stakeAmounts
    ) {
        uint256[] memory userTeamIds = userTeams[_user];
        uint256 teamCount = userTeamIds.length;
        
        teamIds = new uint256[](teamCount);
        teamNames = new string[](teamCount);
        statuses = new TeamStatus[](teamCount);
        isLeader = new bool[](teamCount);
        stakeAmounts = new uint256[](teamCount);
        
        for (uint256 i = 0; i < teamCount; i++) {
            uint256 teamId = userTeamIds[i];
            Team memory team = teams[teamId];
            
            teamIds[i] = teamId;
            teamNames[i] = team.teamName;
            statuses[i] = team.status;
            isLeader[i] = (team.leader == _user);
            stakeAmounts[i] = uint256(teamStakes[teamId][_user].amount);
        }
    }

    /**
     * @dev Get team statistics
     */
    function getTeamStats(uint256 _teamId) external view returns (
        uint256 currentMembers,
        uint256 requiredMembers,
        uint256 totalStaked,
        uint256 averageStake,
        uint256 teamAge,
        bool isComplete
    ) {
        Team memory team = teams[_teamId];
        
        currentMembers = team.members.length;
        requiredMembers = uint256(team.requiredMembers);
        teamAge = block.timestamp - team.createdAt;
        isComplete = (team.status == TeamStatus.Full);
        
        // Calculate total staked (leader + members)
        totalStaked = uint256(teamStakes[_teamId][team.leader].amount);
        for (uint256 i = 0; i < team.members.length; i++) {
            totalStaked += uint256(teamStakes[_teamId][team.members[i]].amount);
        }
        
        // Calculate average stake
        if (currentMembers > 0) {
            averageStake = totalStaked / (currentMembers + 1); // +1 for leader
        }
    }

    /**
     * @dev Check if user can join a team
     */
    function canUserJoinTeam(address _user, uint256 _teamId) external view returns (bool canJoin, string memory reason) {
        if (teams[_teamId].leader == address(0)) {
            return (false, "Team does not exist");
        }
        
        Team memory team = teams[_teamId];
        
        if (team.status != TeamStatus.Forming) {
            return (false, "Team is not in forming stage");
        }
        
        if (team.members.length >= team.requiredMembers) {
            return (false, "Team is already at maximum capacity");
        }
        
        if (isTeamMember(_teamId, _user)) {
            return (false, "User is already a team member");
        }
        
        if (!ideaNFT.hasRole(ideaNFT.SUPERHERO_ROLE(), _user)) {
            return (false, "User must be a superhero to join team");
        }
        
        if (USDC.balanceOf(_user) < team.requiredStake) {
            return (false, "Insufficient USDC balance");
        }
        
        return (true, "");
    }
}