// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./TeamCore.sol";
import "./TeamMilestones.sol";

/**
 * @title TeamViewLibrary
 * @dev Library for complex team view functions - reduces main contract sizes
 */
library TeamViewLibrary {
    
    /**
     * @dev Get user's team participation history
     */
    function getUserTeamHistory(
        TeamCore teamCore,
        address _user
    ) external view returns (
        uint256[] memory teamIds,
        bytes32[] memory teamNames,
        TeamCore.TeamStatus[] memory statuses,
        bool[] memory isLeader,
        uint256[] memory stakeAmounts
    ) {
        uint256[] memory userTeamIds = teamCore.getUserTeams(_user);
        uint256 teamCount = userTeamIds.length;
        
        teamIds = new uint256[](teamCount);
        teamNames = new bytes32[](teamCount);
        statuses = new TeamCore.TeamStatus[](teamCount);
        isLeader = new bool[](teamCount);
        stakeAmounts = new uint256[](teamCount);
        
        for (uint256 i = 0; i < teamCount; i++) {
            TeamCore.Team memory team = teamCore.getTeam(userTeamIds[i]);
            TeamCore.Stake memory stake = teamCore.getTeamStake(userTeamIds[i], _user);
            
            teamIds[i] = userTeamIds[i];
            teamNames[i] = team.teamName;
            statuses[i] = team.status;
            isLeader[i] = (team.leader == _user);
            stakeAmounts[i] = stake.amount;
        }
    }

    /**
     * @dev Get team with all stakes
     */
    function getTeamWithStakes(
        TeamCore teamCore,
        uint256 _teamId
    ) external view returns (
        TeamCore.Team memory team,
        address[] memory allMembers,
        uint256[] memory stakeAmounts,
        bool[] memory stakeStatuses
    ) {
        team = teamCore.getTeam(_teamId);
        
        // Include leader + members
        uint256 totalMembers = team.members.length + 1;
        allMembers = new address[](totalMembers);
        stakeAmounts = new uint256[](totalMembers);
        stakeStatuses = new bool[](totalMembers);
        
        // Add leader first
        allMembers[0] = team.leader;
        TeamCore.Stake memory leaderStake = teamCore.getTeamStake(_teamId, team.leader);
        stakeAmounts[0] = leaderStake.amount;
        stakeStatuses[0] = !leaderStake.withdrawn;
        
        // Add members
        for (uint256 i = 0; i < team.members.length; i++) {
            allMembers[i + 1] = team.members[i];
            TeamCore.Stake memory memberStake = teamCore.getTeamStake(_teamId, team.members[i]);
            stakeAmounts[i + 1] = memberStake.amount;
            stakeStatuses[i + 1] = !memberStake.withdrawn;
        }
    }

    /**
     * @dev Get team statistics
     */
    function getTeamStats(
        TeamCore teamCore,
        uint256 _teamId
    ) external view returns (
        uint256 totalStaked,
        uint256 memberCount,
        uint256 daysActive,
        bool isActive
    ) {
        TeamCore.Team memory team = teamCore.getTeam(_teamId);
        
        totalStaked = uint256(team.requiredStake) * (team.members.length + 1);
        memberCount = team.members.length + 1; // Include leader
        daysActive = (block.timestamp - team.createdAt) / 86400;
        isActive = (team.status == TeamCore.TeamStatus.Full);
    }

    /**
     * @dev Check if user can join team
     */
    function canUserJoinTeam(
        TeamCore teamCore,
        address _user,
        uint256 _teamId
    ) external view returns (bool canJoin, bytes32 reason) {
        TeamCore.Team memory team = teamCore.getTeam(_teamId);
        
        if (team.leader == address(0)) {
            return (false, bytes32("TEAM_NOT_FOUND"));
        }
        if (team.status != TeamCore.TeamStatus.Forming) {
            return (false, bytes32("TEAM_NOT_FORMING"));
        }
        if (team.members.length >= team.requiredMembers) {
            return (false, bytes32("TEAM_FULL"));
        }
        if (teamCore.isTeamMember(_teamId, _user)) {
            return (false, bytes32("ALREADY_MEMBER"));
        }
        
        return (true, bytes32("CAN_JOIN"));
    }
}