// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./TeamCore.sol";

/**
 * @title TeamMilestones
 * @dev Milestone management for teams - separated to reduce contract size
 */
contract TeamMilestones is AccessControl {
    TeamCore public immutable teamCore;

    enum MilestoneStatus { Pending, Submitted, Approved, Rejected }

    struct Milestone {
        uint256 milestoneId;
        uint256 teamId;
        bytes32 title;           // Optimized from string
        bytes32 description;     // Optimized from string
        uint256 deadline;
        uint96 stakeAmount;      // Optimized from uint256
        MilestoneStatus status;
        bytes32 proofIpfsHash;   // Optimized from string
        address validator;
        uint256 submittedAt;
        uint256 reviewedAt;
    }

    // State variables
    uint256 private _nextMilestoneId;

    // Mappings
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => uint256[]) public teamMilestones; // teamId => milestoneIds

    // Events
    event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed teamId, bytes32 title);
    event MilestoneSubmitted(uint256 indexed milestoneId, bytes32 proofHash);
    event MilestoneReviewed(uint256 indexed milestoneId, MilestoneStatus status);

    constructor(address _teamCore) {
        teamCore = TeamCore(_teamCore);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyTeamLeader(uint256 _teamId) {
        TeamCore.Team memory team = teamCore.getTeam(_teamId);
        require(team.leader == msg.sender, "Only team leader");
        _;
    }

    function createMilestone(
        uint256 _teamId,
        bytes32 _title,
        bytes32 _description,
        uint256 _deadline,
        uint96 _stakeAmount
    ) external onlyTeamLeader(_teamId) returns (uint256) {
        require(_deadline > block.timestamp, "Invalid deadline");
        
        uint256 milestoneId = _nextMilestoneId++;

        milestones[milestoneId] = Milestone({
            milestoneId: milestoneId,
            teamId: _teamId,
            title: _title,
            description: _description,
            deadline: _deadline,
            stakeAmount: _stakeAmount,
            status: MilestoneStatus.Pending,
            proofIpfsHash: bytes32(0),
            validator: address(0),
            submittedAt: 0,
            reviewedAt: 0
        });

        teamMilestones[_teamId].push(milestoneId);

        emit MilestoneCreated(milestoneId, _teamId, _title);
        return milestoneId;
    }

    function submitMilestone(uint256 _milestoneId, bytes32 _proofHash) external {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.milestoneId != 0, "Milestone not found");
        require(milestone.status == MilestoneStatus.Pending, "Invalid status");
        require(block.timestamp <= milestone.deadline, "Deadline passed");
        require(teamCore.isTeamMember(milestone.teamId, msg.sender), "Not team member");

        milestone.proofIpfsHash = _proofHash;
        milestone.status = MilestoneStatus.Submitted;
        milestone.submittedAt = block.timestamp;

        emit MilestoneSubmitted(_milestoneId, _proofHash);
    }

    function reviewMilestone(
        uint256 _milestoneId,
        MilestoneStatus _status
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_status == MilestoneStatus.Approved || _status == MilestoneStatus.Rejected, "Invalid status");
        
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.status == MilestoneStatus.Submitted, "Not submitted");

        milestone.status = _status;
        milestone.validator = msg.sender;
        milestone.reviewedAt = block.timestamp;

        emit MilestoneReviewed(_milestoneId, _status);
    }

    // View functions
    function getMilestone(uint256 _milestoneId) external view returns (Milestone memory) {
        return milestones[_milestoneId];
    }

    function getTeamMilestones(uint256 _teamId) external view returns (uint256[] memory) {
        return teamMilestones[_teamId];
    }

    function totalMilestones() external view returns (uint256) {
        return _nextMilestoneId;
    }
}