// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./SuperheroNFT.sol";

/**
 * @title SuperheroTeamRegistry
 * @dev Separate contract for superhero team functionality to reduce main contract size
 */
contract SuperheroTeamRegistry is AccessControl {
    SuperheroNFT public immutable superheroNFT;

    // Team-related mappings moved from main contract
    mapping(address => uint256[]) public teamSuperhero;
    mapping(address => uint256[]) public joinedAvengers;

    // Events
    event SuperheroJoinedTeam(address indexed superhero, uint256 indexed teamId);
    event SuperheroLeftTeam(address indexed superhero, uint256 indexed teamId);

    constructor(address _superheroNFT) {
        superheroNFT = SuperheroNFT(_superheroNFT);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlySuperhero() {
        require(superheroNFT.hasRole(superheroNFT.SUPERHERO_ROLE(), msg.sender), "Not a superhero");
        _;
    }

    /**
     * @dev Add superhero to team
     */
    function addSuperheroToTeam(address _superhero, uint256 _teamId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        teamSuperhero[_superhero].push(_teamId);
        emit SuperheroJoinedTeam(_superhero, _teamId);
    }

    /**
     * @dev Add superhero to avengers
     */
    function addToAvengers(address _superhero, uint256 _avengerId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        joinedAvengers[_superhero].push(_avengerId);
    }

    /**
     * @dev Get superhero teams
     */
    function getSuperheroTeams(address _superhero) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return teamSuperhero[_superhero];
    }

    /**
     * @dev Get superhero avengers
     */
    function getSuperheroAvengers(address _superhero) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return joinedAvengers[_superhero];
    }

    /**
     * @dev Check if superhero is in specific team
     */
    function isSuperheroInTeam(address _superhero, uint256 _teamId) 
        external 
        view 
        returns (bool) 
    {
        uint256[] memory teams = teamSuperhero[_superhero];
        for (uint256 i = 0; i < teams.length; i++) {
            if (teams[i] == _teamId) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Remove superhero from team
     */
    function removeSuperheroFromTeam(address _superhero, uint256 _teamId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        uint256[] storage teams = teamSuperhero[_superhero];
        for (uint256 i = 0; i < teams.length; i++) {
            if (teams[i] == _teamId) {
                teams[i] = teams[teams.length - 1];
                teams.pop();
                emit SuperheroLeftTeam(_superhero, _teamId);
                break;
            }
        }
    }
}