// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IdeaNFT.sol";

/**
 * @title TeamCore
 * @dev Core team management functionality - optimized for contract size
 */
contract TeamCore is AccessControl, ReentrancyGuard {
    IdeaNFT public immutable ideaNFT;
    IERC20 public immutable USDC;

    enum TeamStatus { Forming, Full }

    struct Team {
        uint256 teamId;
        uint256 createdAt;
        address leader;          // 20 bytes
        uint96 requiredStake;    // 12 bytes - packed with leader
        uint128 requiredMembers; // 16 bytes
        TeamStatus status;       // 1 byte
        uint120 reserved;        // 15 bytes - packed with status
        address[] members;
        bytes32 teamName;        // Optimized from string
        bytes32 projectName;     // Optimized from string
        bytes32 description;     // Optimized from string
        bytes32[5] roles;        // Fixed array instead of dynamic
        bytes32[3] tags;         // Fixed array instead of dynamic
    }

    struct Stake {
        address staker;
        uint96 amount;
        uint256 timestamp;
        bool withdrawn;
    }

    // State variables
    uint256 private _nextTeamId;
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**6; // 100 USDC

    // Mappings
    mapping(uint256 => Team) public teams;
    mapping(uint256 => mapping(address => Stake)) public teamStakes;
    mapping(address => uint256[]) public userTeams;

    // Events
    event TeamCreated(uint256 indexed teamId, address indexed leader, bytes32 teamName);
    event JoinTeam(uint256 indexed teamId, address indexed member, uint256 amount);
    event TeamActivated(uint256 indexed teamId);
    event StakeWithdrawn(uint256 indexed teamId, address indexed member, uint256 amount);

    constructor(address _ideaNFT, address _mockUSDC) {
        ideaNFT = IdeaNFT(_ideaNFT);
        USDC = IERC20(_mockUSDC);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyTeamLeader(uint256 _teamId) {
        require(teams[_teamId].leader == msg.sender, "Only team leader");
        _;
    }

    modifier onlySuperhero() {
        require(ideaNFT.hasRole(ideaNFT.SUPERHERO_ROLE(), msg.sender), "Not a superhero");
        _;
    }

    function createTeam(
        uint128 _requiredMembers,
        uint96 _requiredStake,
        bytes32 _teamName,
        bytes32 _description,
        bytes32 _projectName,
        bytes32[5] memory _roles,
        bytes32[3] memory _tags
    ) external returns (uint256) {
        require(USDC.balanceOf(msg.sender) >= _requiredStake, "Insufficient balance");
        require(_requiredStake >= MIN_STAKE_AMOUNT, "Stake too low");

        uint256 _teamId = _nextTeamId++;

        teams[_teamId] = Team({
            teamId: _teamId,
            createdAt: block.timestamp,
            leader: msg.sender,
            requiredStake: _requiredStake,
            requiredMembers: _requiredMembers,
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

        teamStakes[_teamId][msg.sender] = Stake({
            staker: msg.sender,
            amount: _requiredStake,
            timestamp: block.timestamp,
            withdrawn: false
        });

        emit TeamCreated(_teamId, msg.sender, _teamName);
        return _teamId;
    }

    function joinTeam(uint256 _teamId) external onlySuperhero {
        Team storage team = teams[_teamId];
        require(team.leader != address(0), "Team does not exist");
        require(team.status == TeamStatus.Forming, "Team not forming");
        require(team.members.length < team.requiredMembers, "Team full");
        require(!isTeamMember(_teamId, msg.sender), "Already member");
        require(USDC.balanceOf(msg.sender) >= team.requiredStake, "Insufficient balance");

        team.members.push(msg.sender);
        userTeams[msg.sender].push(_teamId);
        
        USDC.transferFrom(msg.sender, address(this), team.requiredStake);
        
        teamStakes[_teamId][msg.sender] = Stake({
            staker: msg.sender,
            amount: team.requiredStake,
            timestamp: block.timestamp,
            withdrawn: false
        });

        // Check if team is now full
        if (team.members.length == team.requiredMembers) {
            team.status = TeamStatus.Full;
            emit TeamActivated(_teamId);
        }
        
        emit JoinTeam(_teamId, msg.sender, team.requiredStake);
    }

    function releaseStake(uint256 _teamId) external onlyTeamLeader(_teamId) {
        Team memory team = teams[_teamId];
        require(team.status == TeamStatus.Full, "Team not complete");

        // Release leader's stake
        USDC.transfer(team.leader, team.requiredStake);
        teamStakes[_teamId][team.leader].withdrawn = true;
        
        // Release members' stakes
        for (uint256 i = 0; i < team.members.length; i++) {
            USDC.transfer(team.members[i], team.requiredStake);
            teamStakes[_teamId][team.members[i]].withdrawn = true;
        }

        emit StakeWithdrawn(_teamId, team.leader, team.requiredStake);
    }

    // View functions
    function isTeamMember(uint256 _teamId, address _user) public view returns (bool) {
        if (teams[_teamId].leader == _user) return true;
        
        address[] memory members = teams[_teamId].members;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == _user) return true;
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

    function totalTeams() external view returns (uint256) {
        return _nextTeamId;
    }

    function getTeam(uint256 _teamId) external view returns (Team memory) {
        return teams[_teamId];
    }
}