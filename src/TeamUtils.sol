// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./TeamManager.sol";

/**
 * @title TeamUtils
 * @dev Utility contract for expensive team view functions to reduce main contract size
 */
contract TeamUtils {
    TeamManager public immutable teamManager;

    constructor(address _teamManager) {
        teamManager = TeamManager(_teamManager);
    }

    /**
     * @dev Get teams by status
     */
    function getTeamsByStatus(TeamManager.TeamStatus _status) external view returns (TeamManager.Team[] memory) {
        uint256 totalTeams = teamManager.totalTeams();
        uint256 statusCount = 0;
        
        // Count teams with specific status
        for (uint256 i = 0; i < totalTeams; i++) {
            try teamManager.getTeam(i) returns (TeamManager.Team memory team) {
                if (team.leader != address(0) && team.status == _status) {
                    statusCount++;
                }
            } catch {
                // Skip non-existent teams
            }
        }
        
        // Create array of teams with specific status
        TeamManager.Team[] memory statusTeams = new TeamManager.Team[](statusCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalTeams; i++) {
            try teamManager.getTeam(i) returns (TeamManager.Team memory team) {
                if (team.leader != address(0) && team.status == _status) {
                    statusTeams[currentIndex] = team;
                    currentIndex++;
                }
            } catch {
                // Skip non-existent teams
            }
        }
        
        return statusTeams;
    }

    /**
     * @dev Get platform team statistics
     */
    function getPlatformTeamStats() external view returns (
        uint256 totalTeams,
        uint256 formingTeams,
        uint256 fullTeams,
        uint256 totalStaked,
        uint256 averageTeamSize,
        uint256 averageStakePerTeam
    ) {
        totalTeams = teamManager.totalTeams();
        
        for (uint256 i = 0; i < totalTeams; i++) {
            try teamManager.getTeam(i) returns (TeamManager.Team memory team) {
                if (team.leader != address(0)) {
                    if (team.status == TeamManager.TeamStatus.Forming) {
                        formingTeams++;
                    } else if (team.status == TeamManager.TeamStatus.Full) {
                        fullTeams++;
                    }
                    
                    // Calculate total staked for this team
                    uint256 teamStaked = uint256(team.requiredStake);
                    totalStaked += teamStaked * (team.members.length + 1); // +1 for leader
                    
                    // Add to average team size calculation
                    averageTeamSize += team.members.length + 1; // +1 for leader
                }
            } catch {
                // Skip non-existent teams
            }
        }
        
        if (totalTeams > 0) {
            averageTeamSize = averageTeamSize / totalTeams;
            averageStakePerTeam = totalStaked / totalTeams;
        }
    }

    /**
     * @dev Get teams looking for specific roles
     */
    function getTeamsLookingForRoles(string memory _role) external view returns (TeamManager.Team[] memory) {
        uint256 totalTeams = teamManager.totalTeams();
        uint256 matchingCount = 0;
        
        // Count teams with the specific role
        for (uint256 i = 0; i < totalTeams; i++) {
            try teamManager.getTeam(i) returns (TeamManager.Team memory team) {
                if (team.leader != address(0) && team.status == TeamManager.TeamStatus.Forming) {
                    for (uint256 j = 0; j < team.roles.length; j++) {
                        if (bytes(team.roles[j]).length > 0 && 
                            keccak256(abi.encodePacked(team.roles[j])) == keccak256(abi.encodePacked(_role))) {
                            matchingCount++;
                            break;
                        }
                    }
                }
            } catch {
                // Skip non-existent teams
            }
        }
        
        // Create array of matching teams
        TeamManager.Team[] memory matchingTeams = new TeamManager.Team[](matchingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalTeams; i++) {
            try teamManager.getTeam(i) returns (TeamManager.Team memory team) {
                if (team.leader != address(0) && team.status == TeamManager.TeamStatus.Forming) {
                    for (uint256 j = 0; j < team.roles.length; j++) {
                        if (bytes(team.roles[j]).length > 0 && 
                            keccak256(abi.encodePacked(team.roles[j])) == keccak256(abi.encodePacked(_role))) {
                            matchingTeams[currentIndex] = team;
                            currentIndex++;
                            break;
                        }
                    }
                }
            } catch {
                // Skip non-existent teams
            }
        }
        
        return matchingTeams;
    }

    /**
     * @dev Get all teams with pagination
     */
    function getAllTeamsPaginated(uint256 _offset, uint256 _limit) external view returns (TeamManager.Team[] memory, uint256 totalCount) {
        totalCount = teamManager.totalTeams();
        
        if (_offset >= totalCount) {
            return (new TeamManager.Team[](0), totalCount);
        }
        
        uint256 actualLimit = _limit;
        if (_offset + _limit > totalCount) {
            actualLimit = totalCount - _offset;
        }
        
        TeamManager.Team[] memory paginatedTeams = new TeamManager.Team[](actualLimit);
        uint256 currentIndex = 0;
        
        for (uint256 i = _offset; i < _offset + actualLimit; i++) {
            try teamManager.getTeam(i) returns (TeamManager.Team memory team) {
                paginatedTeams[currentIndex] = team;
                currentIndex++;
            } catch {
                // Handle non-existent teams
            }
        }
        
        return (paginatedTeams, totalCount);
    }
}