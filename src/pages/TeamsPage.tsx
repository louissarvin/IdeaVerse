import React, { useState } from 'react';
import { Users, Plus, Star, Shield, Sword, Zap, Crown, Search, MapPin, Calendar, Target, MessageCircle, UserPlus, Upload, Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import TeamDetailModal from '../components/TeamDetailModal';
import CreateTeamModal from '../components/CreateTeamModal';
import TeamProgressModal from '../components/TeamProgressModal';

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

const initialTeams: Team[] = [
  {
    id: 1,
    name: 'DeFi Dragons',
    description: 'Building the next generation of decentralized finance protocols with advanced yield farming mechanisms.',
    leader: {
      id: 1,
      name: 'Alex Chen',
      avatar: '👨‍💻',
      role: 'Tech Lead',
      level: 42,
      isLeader: true,
      stakedTokens: 1000,
    },
    members: [
      { id: 2, name: 'Sarah Kim', avatar: '👩‍🎨', role: 'Designer', level: 38, stakedTokens: 500 },
      { id: 3, name: 'Marcus Johnson', avatar: '🚀', role: 'Backend', level: 55, stakedTokens: 750 },
    ],
    maxMembers: 5,
    requiredRoles: ['Frontend', 'Product'],
    project: 'DeFi Yield Protocol',
    tags: ['DeFi', 'Smart Contracts', 'Yield Farming'],
    createdAt: '2 days ago',
    pixelColor: 'from-blue-400 to-purple-500',
    isRecruiting: true,
    requirements: ['3+ years DeFi experience', 'Solidity proficiency', 'Team player'],
    stakeAmount: 500,
    contractAddress: '0x1234...5678',
    projectFiles: ['whitepaper.pdf', 'technical-spec.md'],
    isFull: false,
  },
  {
    id: 2,
    name: 'NFT Guardians',
    description: 'Creating an immersive NFT gaming experience with play-to-earn mechanics and community governance.',
    leader: {
      id: 4,
      name: 'Luna Rodriguez',
      avatar: '🌙',
      role: 'Game Director',
      level: 33,
      isLeader: true,
      stakedTokens: 800,
    },
    members: [
      { id: 5, name: 'David Park', avatar: '⚡', role: 'Mobile Dev', level: 29, stakedTokens: 300 },
      { id: 6, name: 'Code Ninja', avatar: '🥷', role: 'Frontend', level: 34, stakedTokens: 400 },
      { id: 7, name: 'Art Master', avatar: '🎨', role: 'Designer', level: 31, stakedTokens: 350 },
      { id: 8, name: 'Growth Guru', avatar: '📈', role: 'Marketing', level: 28, stakedTokens: 250 },
    ],
    maxMembers: 6,
    requiredRoles: ['Backend'],
    project: 'NFT Adventure Game',
    tags: ['Gaming', 'NFTs', 'Play-to-Earn'],
    createdAt: '1 week ago',
    pixelColor: 'from-green-400 to-emerald-500',
    isRecruiting: true,
    requirements: ['Gaming industry experience', 'Unity/Unreal skills', 'Creative mindset'],
    stakeAmount: 300,
    contractAddress: '0x2345...6789',
    projectFiles: ['game-design.pdf', 'art-assets.zip'],
    isFull: false,
  },
  {
    id: 3,
    name: 'Carbon Crusaders',
    description: 'Developing blockchain solutions for carbon credit trading and environmental impact tracking.',
    leader: {
      id: 6,
      name: 'Emma Wilson',
      avatar: '🎯',
      role: 'Product Lead',
      level: 46,
      isLeader: true,
      stakedTokens: 1200,
    },
    members: [
      { id: 7, name: 'Tech Wizard', avatar: '🧙‍♂️', role: 'Blockchain', level: 51, stakedTokens: 600 },
      { id: 8, name: 'Design Ninja', avatar: '🥷', role: 'Designer', level: 34, stakedTokens: 400 },
      { id: 9, name: 'Code Samurai', avatar: '⚔️', role: 'Frontend', level: 41, stakedTokens: 500 },
      { id: 10, name: 'Market Master', avatar: '📊', role: 'Marketing', level: 37, stakedTokens: 450 },
    ],
    maxMembers: 5,
    requiredRoles: [],
    project: 'Carbon Credit Platform',
    tags: ['Sustainability', 'Carbon Credits', 'Impact'],
    createdAt: '3 days ago',
    pixelColor: 'from-orange-400 to-red-500',
    isRecruiting: false,
    requirements: ['Sustainability focus', 'Enterprise experience', 'Leadership skills'],
    stakeAmount: 600,
    contractAddress: '0x3456...7890',
    projectFiles: ['carbon-model.pdf', 'impact-metrics.xlsx'],
    isFull: true,
    progressSubmitted: false,
  },
];

const TeamsPage = () => {
  const { user } = useApp();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [progressTeam, setProgressTeam] = useState<Team | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

  const handleJoinTeam = (teamId: number, role: string, stakeAmount: number) => {
    if (!user) return;

    setTeams(prev => prev.map(team => {
      if (team.id === teamId) {
        const newMember: TeamMember = {
          id: Date.now(),
          name: user.name,
          avatar: user.avatar,
          role: role,
          level: user.level,
          stakedTokens: stakeAmount,
        };

        const updatedMembers = [...team.members, newMember];
        const updatedRequiredRoles = team.requiredRoles.filter(r => r !== role);
        const isFull = updatedMembers.length >= team.maxMembers - 1;

        return {
          ...team,
          members: updatedMembers,
          requiredRoles: updatedRequiredRoles,
          isRecruiting: !isFull && updatedRequiredRoles.length > 0,
          isFull: isFull,
        };
      }
      return team;
    }));

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCreateTeam = (teamData: any) => {
    const newTeam: Team = {
      ...teamData,
      id: Date.now(),
      members: [],
      createdAt: 'Just now',
      pixelColor: 'from-green-400 to-emerald-500',
      isRecruiting: true,
      isFull: false,
    };

    setTeams(prev => [newTeam, ...prev]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const isUserInTeam = (team: Team) => {
    return user && (team.leader.name === user.name || team.members.some(member => member.name === user.name));
  };

  const isUserTeamLeader = (team: Team) => {
    return user && team.leader.name === user.name;
  };

  return (
    <>
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-8xl px-4">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="fixed top-24 right-4 bg-green-500 text-white p-4 border-4 border-green-700 shadow-2xl z-50 animate-slide-up">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white text-green-500 border-2 border-green-700 flex items-center justify-center">
                  ✓
                </div>
                <span className="font-pixel text-pixel-sm uppercase tracking-wider">
                  Success! Action completed.
                </span>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-pixel-4xl md:text-pixel-6xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
              <span className="inline-block bg-white/20 border-4 border-gray-800 px-4 py-2 mb-2 shadow-lg">Team</span>{' '}
              <span className="inline-block bg-moss-green/20 border-4 border-green-600 px-4 py-2 shadow-lg text-moss-green">Recruitment</span>
            </h1>
            <p className="text-pixel-lg font-orbitron text-gray-600 max-w-2xl mx-auto uppercase tracking-wide">
              Join legendary teams and embark on epic Web3 adventures
            </p>
          </div>

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

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={!user}
                  className="flex items-center space-x-2 bg-gradient-to-r from-sunset-coral to-moss-green text-white px-6 py-2 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  <Crown className="w-4 h-4" />
                  <span>{user ? 'CREATE TEAM' : 'LOGIN TO CREATE'}</span>
                </button>
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
                            {team.stakeAmount} IDEA
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
                          disabled={!user}
                          className="flex items-center justify-center space-x-1 bg-moss-green text-white py-2 border-2 border-green-700 font-pixel font-bold text-pixel-xs hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>{user ? 'JOIN' : 'LOGIN'}</span>
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
        </div>
      </div>

      {/* Modals */}
      <TeamDetailModal 
        team={selectedTeam} 
        isOpen={!!selectedTeam} 
        onClose={() => setSelectedTeam(null)}
        onJoinTeam={handleJoinTeam}
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
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }}
      />
    </>
  );
};

export default TeamsPage;