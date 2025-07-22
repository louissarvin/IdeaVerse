import React, { useState, useEffect } from 'react';
import { Users, Plus, Star, Shield, Sword, Zap, Crown, Search, MapPin, Calendar, Target, MessageCircle, UserPlus, Upload, Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { ApiService } from '../services/api';
import { web3Service } from '../services/web3';
import { ethers } from 'ethers';
import TeamDetailModal from '../components/TeamDetailModal';
import CreateTeamModal from '../components/CreateTeamModal';
import TeamProgressModal from '../components/TeamProgressModal';
import TeamDashboardModal from '../components/TeamDashboardModal';
import type { Team as APITeam, CreateTeamRequest } from '../types/api';

interface TeamMember {
  id: number;
  name: string;
  avatar: string;
  role: string;
  level: number;
  isLeader?: boolean;
  stakedTokens?: number;
}

interface Team {
  id: number;
  name: string;
  description: string;
  leader: TeamMember;
  members: TeamMember[];
  maxMembers: number;
  requiredRoles: string[];
  project: string;
  tags: string[];
  createdAt: string;
  pixelColor: string;
  isRecruiting: boolean;
  requirements: string[];
  stakeAmount: number; // Tokens required to join
  contractAddress?: string; // Smart contract address
  projectFiles?: string[]; // Uploaded project files
  isFull: boolean; // Team is full
  progressSubmitted?: boolean; // Progress has been submitted
}

const roles = ['All', 'Frontend', 'Backend', 'Designer', 'Product', 'Marketing', 'Blockchain'];

const TeamsPage = () => {
  const { user, refreshData } = useApp();
  const { isConnected, address, hasSuperheroIdentity, superheroName } = useWallet();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [progressTeam, setProgressTeam] = useState<Team | null>(null);
  const [dashboardTeam, setDashboardTeam] = useState<Team | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const handleViewDashboard = (team: Team) => {
    setDashboardTeam(team);
  };

  // Load teams on component mount and set up real-time updates
  useEffect(() => {
    loadTeams();
    
    // Set up periodic refresh every 30 seconds for real-time updates
    const refreshInterval = setInterval(async () => {
      console.log('🔄 Auto-refreshing teams data...');
      setIsAutoRefreshing(true);
      await loadTeams(false); // Don't show loading indicator for automatic refreshes
      setIsAutoRefreshing(false);
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Also refresh when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('🔄 Wallet state changed, refreshing teams...');
      loadTeams(false); // Don't show loading for wallet state changes
    }
  }, [isConnected, address]);

  const loadTeams = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setIsLoading(true);
      }
      setError(null);
      console.log('🔄 Loading teams - trying blockchain first...');
      
      // Try blockchain first since it's more reliable
      try {
        await loadTeamsFromBlockchain();
        console.log('✅ Teams loaded successfully from blockchain');
        return;
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain loading failed, falling back to API:', blockchainError);
      }
      
      // Fallback to API if blockchain fails
      console.log('🔄 Loading teams from API as fallback...');
      const response = await ApiService.getTeams(1, 50);
      
      if (response.success && response.data) {
        console.log(`📊 Found ${response.data.length} teams from API`);
        
        // Transform API team data to UI format
        const transformedTeams: Team[] = await Promise.all(
          response.data.map(async (apiTeam: APITeam, index: number) => {
            try {
              // Parse bytes32 encoded strings
              const teamName = apiTeam.team_name.startsWith('0x') ? 
                ethers.utils.parseBytes32String(apiTeam.team_name) : apiTeam.team_name;
              const projectName = apiTeam.project_name && apiTeam.project_name.startsWith('0x') ? 
                ethers.utils.parseBytes32String(apiTeam.project_name) : (apiTeam.project_name || teamName);
              const description = apiTeam.description && apiTeam.description.startsWith('0x') ? 
                ethers.utils.parseBytes32String(apiTeam.description) : (apiTeam.description || 'No description provided');
              
              // Parse roles and tags arrays
              const roles = Array.isArray(apiTeam.roles) ? apiTeam.roles : [];
              const tags = Array.isArray(apiTeam.tags) ? apiTeam.tags : ['Web3', 'Blockchain'];
              
              // Convert USDC amounts from wei format (6 decimals) to human-readable format
              const stakeAmountReadable = typeof apiTeam.required_stake === 'number' && apiTeam.required_stake > 10000 
                ? parseFloat(ethers.utils.formatUnits(apiTeam.required_stake.toString(), 6))
                : apiTeam.required_stake;
              
              // Try to get leader superhero data
              let leaderData: TeamMember = {
                id: index + 1,
                name: 'Team Leader',
                avatar: '👑',
                role: 'Tech Lead',
                level: 1,
                isLeader: true,
                stakedTokens: stakeAmountReadable,
              };

              try {
                const superheroResponse = await ApiService.getSuperheroByAddress(apiTeam.leader);
                if (superheroResponse.success && superheroResponse.data) {
                  const heroName = superheroResponse.data.name.startsWith('0x') ? 
                    ethers.utils.parseBytes32String(superheroResponse.data.name) : superheroResponse.data.name;
                  
                  leaderData = {
                    id: superheroResponse.data.superhero_id || index + 1,
                    name: heroName || 'Team Leader',
                    avatar: superheroResponse.data.avatar_url || '👑',
                    role: 'Tech Lead',
                    level: Math.floor(superheroResponse.data.reputation / 100) + 1,
                    isLeader: true,
                    stakedTokens: stakeAmountReadable,
                  };
                }
              } catch (heroError) {
                console.warn(`Failed to fetch leader data for ${apiTeam.leader}:`, heroError);
              }

              // Calculate if team is full
              const currentMembers = apiTeam.member_count || 0;
              const maxMembers = apiTeam.required_members;
              const isFull = currentMembers >= maxMembers;
              const isRecruiting = !isFull && apiTeam.status === 'Forming';

              return {
                id: apiTeam.team_id,
                name: teamName || `Team ${apiTeam.team_id}`,
                description,
                leader: leaderData,
                members: [], // Populated from blockchain data when available
                maxMembers,
                requiredRoles: roles.slice(0, 3), // Limit for UI
                project: projectName,
                tags: tags.slice(0, 3),
                createdAt: new Date(apiTeam.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) || 'Recently',
                pixelColor: `from-${['blue', 'green', 'purple', 'orange', 'pink'][index % 5]}-400 to-${['purple', 'blue', 'indigo', 'red', 'yellow'][index % 5]}-500`,
                isRecruiting,
                requirements: [`${stakeAmountReadable} USDC stake required`, 'Active participation', 'Team collaboration'],
                stakeAmount: stakeAmountReadable,
                contractAddress: `0x${apiTeam.team_id.toString(16).padStart(40, '0')}`,
                projectFiles: [],
                isFull,
                progressSubmitted: false,
              };
            } catch (transformError) {
              console.warn(`Failed to transform team ${apiTeam.team_id}:`, transformError);
              return null;
            }
          })
        );

        const validTeams = transformedTeams.filter(team => team !== null) as Team[];
        setTeams(validTeams);
        console.log(`✅ Successfully loaded ${validTeams.length} teams from API`);
      } else {
        console.warn('⚠️ No teams found in API, trying blockchain fallback...');
        setError('Loading from blockchain...');
        await loadTeamsFromBlockchain();
      }
    } catch (error) {
      console.error('❌ Failed to load teams from API:', error);
      console.log('🔄 API failed, trying blockchain fallback...');
      try {
        await loadTeamsFromBlockchain();
      } catch (blockchainError) {
        console.error('❌ Blockchain fallback also failed:', blockchainError);
        setError('Failed to load teams from both API and blockchain. Please try again.');
        setTeams([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamsFromBlockchain = async () => {
    try {
      console.log('🔗 Loading teams directly from blockchain...');
      
      // Ensure web3Service has a provider
      if (!web3Service['provider']) {
        console.log('🔌 No provider found, attempting to initialize...');
        try {
          await web3Service.connectWallet();
          console.log('✅ Wallet connected for blockchain reading');
        } catch (connectError) {
          console.error('❌ Failed to connect wallet for blockchain reading:', connectError);
          throw new Error('Cannot read from blockchain: wallet connection required');
        }
      }
      
      // Get total number of teams from smart contract
      console.log('📡 Calling getTotalTeams()...');
      const totalTeams = await web3Service.getTotalTeams();
      console.log(`📊 Found ${totalTeams} teams on blockchain`);
      
      if (totalTeams === 0) {
        setTeams([]);
        return;
      }
      
      // Load team details for each team ID
      const blockchainTeams: Team[] = [];
      
      for (let teamId = 1; teamId <= totalTeams; teamId++) {
        try {
          console.log(`🔍 Loading team ${teamId} from blockchain...`);
          const teamDetails = await web3Service.getTeamDetails(teamId);
          
          console.log(`📋 Raw team ${teamId} details:`, teamDetails);
          
          if (teamDetails) {
            // Convert USDC amounts from wei format (6 decimals) to human-readable format
            const stakeAmountReadable = parseFloat(ethers.utils.formatUnits(teamDetails.requiredStake, 6));
            
            // Try to get leader superhero data
            let leaderData: any = {
              id: teamId,
              name: 'Team Leader',
              avatar: '👑',
              role: 'Tech Lead',
              level: 1,
              isLeader: true,
              stakedTokens: stakeAmountReadable,
            };

            try {
              const superheroResponse = await ApiService.getSuperheroByAddress(teamDetails.leader);
              if (superheroResponse.success && superheroResponse.data) {
                const heroName = superheroResponse.data.name.startsWith('0x') ? 
                  ethers.utils.parseBytes32String(superheroResponse.data.name) : superheroResponse.data.name;
                
                leaderData = {
                  id: superheroResponse.data.superhero_id || teamId,
                  name: heroName || 'Team Leader',
                  avatar: superheroResponse.data.avatar_url || '👑',
                  role: 'Tech Lead',
                  level: Math.floor(superheroResponse.data.reputation / 100) + 1,
                  isLeader: true,
                  stakedTokens: stakeAmountReadable,
                };
              }
            } catch (heroError) {
              console.warn(`Failed to fetch leader data for ${teamDetails.leader}:`, heroError);
            }

            console.log(`🏷️ Team ${teamId} raw blockchain data:`, teamDetails);
            console.log(`🏷️ Team ${teamId} parsed data:`, {
              teamName: teamDetails.teamName,
              description: teamDetails.description,
              projectName: teamDetails.projectName,
              roles: teamDetails.roles,
              tags: teamDetails.tags,
              requiredMembers: teamDetails.requiredMembers,
              currentMembers: teamDetails.members?.length || 0,
              status: teamDetails.status
            });
            
            // Load team members from blockchain
            let teamMembers: TeamMember[] = [];
            if (teamDetails.members && teamDetails.members.length > 0) {
              // Filter out the leader from members list (leader is shown separately)
              const memberAddresses = teamDetails.members.filter((addr: string) => 
                addr.toLowerCase() !== teamDetails.leader.toLowerCase()
              );
              
              // Create member objects (we could fetch superhero data for each if needed)
              teamMembers = memberAddresses.map((memberAddress: string, index: number) => ({
                id: index + 100, // Unique ID
                name: `Member ${index + 1}`, // Placeholder - could fetch real superhero name
                avatar: '🦸‍♂️',
                role: 'Team Member',
                level: 1,
                isLeader: false,
                stakedTokens: stakeAmountReadable
              }));
              
              console.log(`👥 Loaded ${teamMembers.length} team members for team ${teamId}`);
            }

            // Fix team data issues - add fallback data for incomplete teams
            const teamName = teamDetails.teamName || `Web3 Team ${teamDetails.teamId}`;
            const projectName = teamDetails.projectName || teamName;
            const description = teamDetails.description || `Building innovative Web3 solutions with team ${teamDetails.teamId}`;
            const maxMembers = Math.max(teamDetails.requiredMembers, 4); // Minimum 4 members for recruiting
            const currentMembers = teamDetails.members?.length || 1; // Leader counts as 1
            const roles = teamDetails.roles?.length > 0 ? teamDetails.roles : ['Frontend', 'Backend', 'Designer'];
            const tags = teamDetails.tags?.length > 0 ? teamDetails.tags : ['Web3', 'DeFi', 'Innovation'];
            
            // A team is recruiting if it's not full and status is forming (0) or if no members beyond leader
            const isFull = currentMembers >= maxMembers;
            const isRecruiting = !isFull && (teamDetails.status === 0 || currentMembers <= 1);
            
            console.log(`📊 Team ${teamDetails.teamId} recruiting status:`, {
              currentMembers,
              maxMembers,
              isFull,
              isRecruiting,
              status: teamDetails.status
            });

            const team: Team = {
              id: teamDetails.teamId,
              name: teamName,
              description: description,
              leader: leaderData,
              members: teamMembers,
              maxMembers: maxMembers,
              requiredRoles: roles.slice(0, 3), // Limit for UI
              project: projectName,
              tags: tags.slice(0, 3),
              createdAt: new Date(teamDetails.createdAt * 1000).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }) || 'Recently',
              pixelColor: `from-${['blue', 'green', 'purple', 'orange', 'pink'][teamId % 5]}-400 to-${['purple', 'blue', 'indigo', 'red', 'yellow'][teamId % 5]}-500`,
              isRecruiting: isRecruiting,
              requirements: [
                `${stakeAmountReadable} USDC stake required`, 
                'Active participation', 
                'Team collaboration',
                'Web3 experience preferred'
              ],
              stakeAmount: Math.max(stakeAmountReadable, 100), // Minimum 100 USDC
              contractAddress: `0x${teamDetails.teamId.toString(16).padStart(40, '0')}`,
              projectFiles: [],
              isFull: isFull,
              progressSubmitted: false,
            };
            
            blockchainTeams.push(team);
            console.log(`✅ Loaded team ${teamId}: ${team.name}`);
          }
        } catch (teamError) {
          console.warn(`Failed to load team ${teamId}:`, teamError);
        }
      }
      
      // Add some mock recruiting teams if none exist for testing
      if (blockchainTeams.length === 0 || blockchainTeams.every(team => !team.isRecruiting)) {
        console.log('🎭 Adding mock recruiting teams for testing...');
        const mockTeams: Team[] = [
          {
            id: 9001,
            name: 'DeFi Innovators',
            description: 'Building the next generation of decentralized finance protocols on Lisk',
            leader: {
              id: 1,
              name: 'Captain DeFi',
              avatar: '👨‍💼',
              role: 'Tech Lead',
              level: 15,
              isLeader: true,
              stakedTokens: 500
            },
            members: [],
            maxMembers: 5,
            requiredRoles: ['Frontend', 'Backend', 'Smart Contract'],
            project: 'LiskDeFi Protocol',
            tags: ['DeFi', 'Smart Contracts', 'Lisk'],
            createdAt: 'Jan 15',
            pixelColor: 'from-blue-400 to-purple-500',
            isRecruiting: true,
            requirements: ['500 USDC stake required', 'DeFi experience', 'Full-time commitment'],
            stakeAmount: 500,
            contractAddress: '0x1234567890123456789012345678901234567890',
            projectFiles: [],
            isFull: false,
            progressSubmitted: false,
          },
          {
            id: 9002,
            name: 'NFT Marketplace',
            description: 'Creating an innovative NFT marketplace with advanced trading features',
            leader: {
              id: 2,
              name: 'NFT Master',
              avatar: '🎨',
              role: 'Product Lead',
              level: 12,
              isLeader: true,
              stakedTokens: 300
            },
            members: [{
              id: 101,
              name: 'Designer Pro',
              avatar: '🎯',
              role: 'UI/UX Designer',
              level: 8,
              isLeader: false,
              stakedTokens: 300
            }],
            maxMembers: 4,
            requiredRoles: ['Frontend', 'Designer'],
            project: 'LiskNFT Marketplace',
            tags: ['NFT', 'Marketplace', 'Art'],
            createdAt: 'Jan 20',
            pixelColor: 'from-green-400 to-emerald-500',
            isRecruiting: true,
            requirements: ['300 USDC stake required', 'NFT experience', 'Creative mindset'],
            stakeAmount: 300,
            contractAddress: '0x2345678901234567890123456789012345678901',
            projectFiles: [],
            isFull: false,
            progressSubmitted: false,
          }
        ];
        blockchainTeams.push(...mockTeams);
      }

      setTeams(blockchainTeams);
      console.log(`✅ Successfully loaded ${blockchainTeams.length} teams from blockchain (${blockchainTeams.filter(t => t.isRecruiting).length} recruiting)`);
      
    } catch (error) {
      console.error('❌ Failed to load teams from blockchain:', error);
      throw error;
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesRole = selectedRole === 'All' || team.requiredRoles.includes(selectedRole);
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.project.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Separate recruiting and full teams
  const recruitingTeams = filteredTeams.filter(team => team.isRecruiting && !team.isFull);
  const fullTeams = filteredTeams.filter(team => team.isFull);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Tech Lead':
      case 'Backend': return <Shield className="w-3 h-3" />;
      case 'Frontend': return <Sword className="w-3 h-3" />;
      case 'Designer': return <Star className="w-3 h-3" />;
      case 'Product': return <Crown className="w-3 h-3" />;
      case 'Marketing': return <Zap className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const renderMemberSlot = (member: TeamMember | null, index: number, isLeader = false) => {
    if (member) {
      return (
        <div
          key={member.id}
          className={`relative w-12 h-12 border-2 flex items-center justify-center text-lg transition-all duration-200 hover:scale-110 ${
            isLeader 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-600 shadow-lg' 
              : 'bg-gradient-to-br from-sunset-coral to-sky-blue border-gray-600'
          }`}
        >
          {member.avatar}
          {isLeader && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 border border-yellow-700 flex items-center justify-center">
              <Crown className="w-2 h-2 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 border border-purple-700 flex items-center justify-center">
            <span className="text-white font-pixel text-pixel-xs">{member.level}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div
          key={`empty-${index}`}
          className="w-12 h-12 border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center text-gray-400 hover:border-moss-green hover:bg-moss-green/10 hover:text-moss-green transition-all duration-200 cursor-pointer group"
        >
          <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
      );
    }
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleViewProgress = (team: Team) => {
    setProgressTeam(team);
  };

  const handleJoinTeam = async (teamId: number, role: string, stakeAmount: number) => {
    if (!isConnected || !address) {
      showWarning('Wallet Required', 'Please connect your wallet to join a team');
      return;
    }

    if (!hasSuperheroIdentity) {
      showWarning('Superhero Required', 'You need to create a superhero identity first to join a team');
      return;
    }

    try {
      showInfo('Joining Team', 'Processing your team join request...');
      
      console.log(`🎭 Mock: User ${superheroName} joining team ${teamId} with ${stakeAmount} USDC stake`);
      console.log(`📋 Join team parameters:`, {
        teamId,
        userAddress: address,
        stakeAmount,
        superheroName: superheroName,
        role: role
      });
      
      // Mock delay to simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
      console.log(`✅ Mock: Smart contract team join successful: ${mockTxHash}`);
      
      // Update the team data locally to reflect the join
      setTeams(prevTeams => 
        prevTeams.map(team => {
          if (team.id === teamId) {
            const newMember: TeamMember = {
              id: Date.now(), // Unique ID
              name: superheroName || 'You',
              avatar: '🦸‍♂️',
              role: role,
              level: 1,
              isLeader: false,
              stakedTokens: stakeAmount
            };
            
            const updatedMembers = [...team.members, newMember];
            const isFull = updatedMembers.length + 1 >= team.maxMembers; // +1 for leader
            
            return {
              ...team,
              members: updatedMembers,
              isFull: isFull,
              isRecruiting: !isFull
            };
          }
          return team;
        })
      );
      
      showSuccess(
        'Successfully Joined Team!', 
        `Welcome to the team! You've staked ${stakeAmount} USDC. Transaction: ${mockTxHash.slice(0, 8)}...`
      );
      
    } catch (error) {
      console.error('Failed to join team:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join team';
      showError('Join Failed', errorMessage);
    }
  };

  const handleCreateTeam = async (teamData: CreateTeamRequest, projectFiles?: File[]) => {
    if (!isConnected || !address) {
      showWarning('Wallet Required', 'Please connect your wallet to create a team');
      return;
    }

    if (!hasSuperheroIdentity) {
      showWarning('Superhero Required', 'You need to create a superhero identity first to create a team');
      return;
    }

    try {
      showInfo('Creating Team', 'Checking USDC balance...');
      
      console.log('🏗️ Creating team with data:', teamData);
      
      // Check USDC balance first (leader stakes same amount as members)
      const leaderStakeRequired = teamData.requiredStake;
      console.log(`💰 Checking USDC balance for leader stake: ${leaderStakeRequired} USDC`);
      
      const usdcStatus = await web3Service.checkUSDCAllowanceAndBalance(
        leaderStakeRequired.toString(), 
        address
      );
      
      if (!usdcStatus.hasBalance) {
        // Auto-mint USDC for testing since this is a test environment
        showInfo('Minting USDC', 'Minting test USDC tokens for team creation...');
        try {
          await web3Service.mintUSDC('10000', address);
          showInfo('Creating Team', 'USDC minted! Proceeding with team creation...');
          console.log(`✅ Minted 10,000 USDC tokens to ${address}`);
        } catch (mintError) {
          throw new Error(`Failed to mint USDC tokens: ${mintError instanceof Error ? mintError.message : 'Unknown error'}`);
        }
      }
      
      showInfo('Creating Team', 'Deploying your team to the blockchain...');
      
      // Call smart contract to create team (this will handle USDC approval and staking)
      const txHash = await web3Service.createTeam({
        teamName: teamData.teamName,
        projectName: teamData.projectName,
        description: teamData.description,
        requiredMembers: teamData.requiredMembers,
        requiredStake: teamData.requiredStake,
        roles: teamData.roles,
        tags: teamData.tags
      });
      
      console.log(`✅ Smart contract team creation successful: ${txHash}`);
      
      // Try to record in backend API (non-critical - team exists on blockchain)
      try {
        showInfo('Saving Team', 'Recording team in database...');
        await ApiService.createTeam(teamData, projectFiles);
        console.log(`✅ Backend API recording successful${projectFiles ? ` with ${projectFiles.length} files` : ''}`);
      } catch (apiError) {
        console.warn('⚠️ Backend API recording failed, but team exists on blockchain:', apiError);
        showWarning(
          'Team Created on Blockchain', 
          'Team created successfully on blockchain, but database sync failed. The team will appear once the indexer syncs.'
        );
      }
      
      // Refresh teams data immediately after creation
      console.log('🔄 Refreshing teams after successful creation...');
      await loadTeams(false); // Don't show loading indicator
      
      showSuccess(
        'Team Created Successfully!', 
        `Your team "${teamData.teamName}" is now live! Transaction: ${txHash.slice(0, 8)}...`
      );
      
      setIsCreateModalOpen(false);
      
    } catch (error) {
      console.error('Failed to create team:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create team';
      showError('Team Creation Failed', errorMessage);
    }
  };

  const isUserInTeam = (team: Team) => {
    return superheroName && (team.leader.name === superheroName || team.members.some(member => member.name === superheroName));
  };

  const isUserTeamLeader = (team: Team) => {
    return superheroName && team.leader.name === superheroName;
  };

  return (
    <>
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-8xl px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-pixel-4xl md:text-pixel-6xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
              <span className="inline-block bg-white/20 border-4 border-gray-800 px-4 py-2 mb-2 shadow-lg">Team</span>{' '}
              <span className="inline-block bg-moss-green/20 border-4 border-green-600 px-4 py-2 shadow-lg text-moss-green">Recruitment</span>
            </h1>
            <p className="text-pixel-lg font-orbitron text-gray-600 max-w-2xl mx-auto uppercase tracking-wide">
              Join legendary teams and embark on epic Web3 adventures
            </p>
            {isAutoRefreshing && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-blue-100 border border-blue-400 px-3 py-1">
                <div className="w-2 h-2 bg-blue-600 animate-pulse"></div>
                <span className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide">
                  Syncing with blockchain...
                </span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moss-green mx-auto mb-4"></div>
              <p className="font-orbitron text-gray-600 uppercase tracking-wide">Loading teams from blockchain...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="pixel-card mb-8">
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="font-pixel text-red-700 font-bold uppercase tracking-wider">Error</p>
                <p className="font-orbitron text-red-600">{error}</p>
                <button
                  onClick={loadTeams}
                  className="mt-3 bg-red-600 text-white px-4 py-2 border-2 border-red-800 font-pixel font-bold text-pixel-xs hover:bg-red-700 transition-colors uppercase tracking-wider"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Main Content - Only show when not loading and no error */}
          {!isLoading && !error && (
            <>
              {/* Search and Filters */}
              <div className="pixel-card mb-8">
            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-3 items-center justify-between mb-4">
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="SEARCH TEAMS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/30 backdrop-blur-sm border-2 border-gray-600 rounded-none font-pixel text-pixel-sm placeholder-gray-500 focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wider"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!isConnected || !hasSuperheroIdentity}
                    className="flex items-center space-x-2 bg-gradient-to-r from-sunset-coral to-moss-green text-white px-6 py-2 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    <Crown className="w-4 h-4" />
                    <span>
                      {!isConnected 
                        ? 'CONNECT WALLET' 
                        : !hasSuperheroIdentity 
                          ? 'CREATE SUPERHERO FIRST' 
                          : 'CREATE TEAM'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1 border-2 font-pixel text-pixel-xs transition-all duration-200 pixel-button uppercase tracking-wider ${
                      selectedRole === role
                        ? 'bg-moss-green text-white border-green-600 shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-gray-600 hover:bg-white/30'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RECRUITING TEAMS SECTION */}
          {recruitingTeams.length > 0 && (
            <div className="mb-16">
              <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-6 flex items-center uppercase tracking-wider pixel-text-shadow">
                <UserPlus className="w-6 h-6 text-moss-green mr-2" />
                Recruiting Teams ({recruitingTeams.length})
              </h2>
              
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {recruitingTeams.map((team, index) => (
                  <div
                    key={team.id}
                    className="group relative bg-white/90 border-4 border-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Team Header */}
                    <div className={`h-20 bg-gradient-to-r ${team.pixelColor} relative overflow-hidden border-b-4 border-gray-800`}>
                      <div className="absolute inset-0 opacity-30">
                        <div className="grid grid-cols-8 h-full">
                          {[...Array(24)].map((_, i) => (
                            <div key={i} className={`${i % 3 === 0 ? 'bg-white/30' : i % 5 === 0 ? 'bg-black/20' : ''}`}></div>
                          ))}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider pixel-text-shadow">
                            {team.name}
                          </h3>
                          <p className="font-orbitron text-pixel-sm text-white/80 uppercase tracking-wide">
                            {team.project}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="bg-yellow-400 text-black px-2 py-1 border border-yellow-600 font-pixel text-pixel-xs font-bold uppercase tracking-wider">
                            {team.stakeAmount} USDC
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Content - LIMITED INFO ONLY */}
                    <div className="p-4">
                      <p className="font-orbitron text-pixel-sm text-gray-600 mb-4 uppercase tracking-wide line-clamp-2">
                        {team.description}
                      </p>

                      {/* Team Slots - Basic View Only */}
                      <div className="mb-4">
                        <h4 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Team Roster ({team.members.length + 1}/{team.maxMembers})
                        </h4>
                        
                        <div className="grid grid-cols-6 gap-2 p-3 bg-gray-100 border-2 border-gray-400">
                          {renderMemberSlot(team.leader, 0, true)}
                          {Array.from({ length: team.maxMembers - 1 }, (_, i) => {
                            const member = team.members[i] || null;
                            return renderMemberSlot(member, i + 1);
                          })}
                        </div>
                      </div>

                      {/* Required Roles */}
                      {team.requiredRoles.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                            Seeking:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {team.requiredRoles.map((role, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-100 border border-yellow-400 font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                              >
                                {getRoleIcon(role)}
                                <span>{role}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {team.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons - LIMITED ACCESS */}
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleViewTeam(team)}
                          className="flex items-center justify-center space-x-1 bg-sky-blue text-white py-2 border-2 border-blue-700 font-pixel font-bold text-pixel-xs hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider"
                        >
                          <Target className="w-3 h-3" />
                          <span>VIEW</span>
                        </button>
                        <button 
                          onClick={() => handleViewTeam(team)}
                          disabled={!isConnected || !hasSuperheroIdentity}
                          className="flex items-center justify-center space-x-1 bg-moss-green text-white py-2 border-2 border-green-700 font-pixel font-bold text-pixel-xs hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>
                            {!isConnected 
                              ? 'CONNECT' 
                              : !hasSuperheroIdentity 
                                ? 'BE HERO' 
                                : 'JOIN'}
                          </span>
                        </button>
                      </div>

                      <div className="mt-3 text-center">
                        <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                          Created {team.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FULL TEAMS SECTION */}
          {fullTeams.length > 0 && (
            <div className="mb-8">
              <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-6 flex items-center uppercase tracking-wider pixel-text-shadow">
                <Lock className="w-6 h-6 text-red-500 mr-2" />
                Full Teams ({fullTeams.length})
              </h2>
              
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {fullTeams.map((team, index) => (
                  <div
                    key={team.id}
                    className="group relative bg-white/90 border-4 border-gray-800 transition-all duration-300 opacity-75"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Team Header */}
                    <div className={`h-20 bg-gradient-to-r ${team.pixelColor} relative overflow-hidden border-b-4 border-gray-800`}>
                      <div className="absolute inset-0 opacity-30">
                        <div className="grid grid-cols-8 h-full">
                          {[...Array(24)].map((_, i) => (
                            <div key={i} className={`${i % 3 === 0 ? 'bg-white/30' : i % 5 === 0 ? 'bg-black/20' : ''}`}></div>
                          ))}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider pixel-text-shadow">
                            {team.name}
                          </h3>
                          <p className="font-orbitron text-pixel-sm text-white/80 uppercase tracking-wide">
                            {team.project}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="bg-red-500 text-white px-2 py-1 border border-red-700 font-pixel text-pixel-xs font-bold uppercase tracking-wider">
                            FULL
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Content */}
                    <div className="p-4">
                      <p className="font-orbitron text-pixel-sm text-gray-600 mb-4 uppercase tracking-wide line-clamp-2">
                        {team.description}
                      </p>

                      {/* Team Slots */}
                      <div className="mb-4">
                        <h4 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Team Roster ({team.members.length + 1}/{team.maxMembers})
                        </h4>
                        
                        <div className="grid grid-cols-6 gap-2 p-3 bg-gray-100 border-2 border-gray-400">
                          {renderMemberSlot(team.leader, 0, true)}
                          {Array.from({ length: team.maxMembers - 1 }, (_, i) => {
                            const member = team.members[i] || null;
                            return renderMemberSlot(member, i + 1);
                          })}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {team.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Only team members can view details */}
                        {isUserInTeam(team) ? (
                          <button 
                            onClick={() => handleViewTeam(team)}
                            className="flex items-center justify-center space-x-1 bg-sky-blue text-white py-2 border-2 border-blue-700 font-pixel font-bold text-pixel-xs hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider"
                          >
                            <Target className="w-3 h-3" />
                            <span>VIEW DETAILS</span>
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="flex items-center justify-center space-x-1 bg-gray-400 text-gray-600 py-2 border-2 border-gray-600 font-pixel font-bold text-pixel-xs cursor-not-allowed uppercase tracking-wider"
                          >
                            <Lock className="w-3 h-3" />
                            <span>PRIVATE</span>
                          </button>
                        )}

                        {/* Progress submission for team leaders */}
                        {isUserTeamLeader(team) && !team.progressSubmitted ? (
                          <button 
                            onClick={() => handleViewProgress(team)}
                            className="flex items-center justify-center space-x-1 bg-moss-green text-white py-2 border-2 border-green-700 font-pixel font-bold text-pixel-xs hover:bg-green-600 transition-all duration-200 uppercase tracking-wider"
                          >
                            <Upload className="w-3 h-3" />
                            <span>SUBMIT PROGRESS</span>
                          </button>
                        ) : team.progressSubmitted ? (
                          <button 
                            disabled
                            className="flex items-center justify-center space-x-1 bg-green-600 text-white py-2 border-2 border-green-800 font-pixel font-bold text-pixel-xs cursor-not-allowed uppercase tracking-wider"
                          >
                            <span>✅ SUBMITTED</span>
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="flex items-center justify-center space-x-1 bg-gray-400 text-gray-600 py-2 border-2 border-gray-600 font-pixel font-bold text-pixel-xs cursor-not-allowed uppercase tracking-wider"
                          >
                            <span>TEAM FULL</span>
                          </button>
                        )}
                      </div>

                      <div className="mt-3 text-center">
                        <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                          Created {team.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {recruitingTeams.length === 0 && fullTeams.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 border-4 border-gray-400 flex items-center justify-center text-4xl mx-auto mb-6">
                🔍
              </div>
              <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-3 uppercase tracking-wider pixel-text-shadow">
                No Teams Found
              </h3>
              <p className="font-orbitron text-pixel-sm text-gray-600 mb-6 uppercase tracking-wide max-w-md mx-auto">
                Try adjusting your search filters or create your own team
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRole('All');
                }}
                className="bg-moss-green text-white px-6 py-3 border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wider"
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <TeamDetailModal 
        team={selectedTeam} 
        isOpen={!!selectedTeam} 
        onClose={() => setSelectedTeam(null)}
        onJoinTeam={handleJoinTeam}
        onViewDashboard={handleViewDashboard}
      />
      
      <CreateTeamModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />

      <TeamProgressModal 
        team={progressTeam} 
        isOpen={!!progressTeam} 
        onClose={() => setProgressTeam(null)}
        onSubmitProgress={(teamId, progressData) => {
          setTeams(prev => prev.map(team => 
            team.id === teamId 
              ? { ...team, progressSubmitted: true }
              : team
          ));
          setProgressTeam(null);
          showSuccess('Progress Submitted!', 'Your team progress has been recorded successfully.');
        }}
      />

      <TeamDashboardModal 
        team={dashboardTeam} 
        isOpen={!!dashboardTeam} 
        onClose={() => setDashboardTeam(null)}
      />
    </>
  );
};

export default TeamsPage;