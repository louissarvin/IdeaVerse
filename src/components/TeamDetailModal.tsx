import React, { useState } from 'react';
import { X, Users, Crown, Shield, Sword, Star, Zap, Plus, UserPlus, MessageCircle, Calendar, Target, DollarSign, Lock, Upload, FileText } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

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
  stakeAmount: number;
  contractAddress?: string;
  projectFiles?: string[];
  isFull: boolean;
  progressSubmitted?: boolean;
}

interface TeamDetailModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinTeam: (teamId: number, role: string, stakeAmount: number) => void;
}

const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ team, isOpen, onClose, onJoinTeam }) => {
  const { user } = useApp();
  const [selectedRole, setSelectedRole] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');

  if (!isOpen || !team) return null;

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
          className={`relative w-16 h-16 border-2 flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 ${
            isLeader 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-600 shadow-lg' 
              : 'bg-gradient-to-br from-sunset-coral to-sky-blue border-gray-600'
          }`}
        >
          {member.avatar}
          {isLeader && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 border border-yellow-700 flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 border border-purple-700 flex items-center justify-center">
            <span className="text-white font-pixel text-pixel-xs">{member.level}</span>
          </div>
          
          {/* Stake Amount */}
          {member.stakedTokens && (
            <div className="absolute -top-1 -left-1 w-6 h-4 bg-yellow-400 border border-yellow-600 flex items-center justify-center">
              <span className="text-black font-pixel text-pixel-xs">{member.stakedTokens}</span>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={`empty-${index}`}
          className="w-16 h-16 border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center text-gray-400 hover:border-moss-green hover:bg-moss-green/10 hover:text-moss-green transition-all duration-200 cursor-pointer group"
        >
          <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </div>
      );
    }
  };

  const handleJoinTeam = () => {
    if (!user || !selectedRole) return;
    onJoinTeam(team.id, selectedRole, team.stakeAmount);
    onClose();
  };

  const isUserInTeam = user && (team.leader.name === user.name || team.members.some(member => member.name === user.name));
  const isUserTeamLeader = user && team.leader.name === user.name;

  // CRITICAL: For recruiting teams, show basic info only - NO DETAILED PROJECT INFO
  const isRecruitingTeam = team.isRecruiting && !team.isFull;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r ${team.pixelColor}`}>
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-white" />
            <div>
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                {team.name}
              </h2>
              <p className="font-orbitron text-pixel-sm text-white/80 uppercase tracking-wide">
                {team.project}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {team.isFull && (
              <div className="bg-red-500 text-white px-3 py-1 border-2 border-red-700 font-pixel text-pixel-sm font-bold uppercase tracking-wider">
                TEAM FULL
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isRecruitingTeam ? (
            /* LIMITED VIEW FOR RECRUITING TEAMS - BASIC INFO ONLY */
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - LIMITED */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Description Only */}
                <div>
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                    Team Description
                  </h3>
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="font-orbitron text-pixel-sm text-gray-600 leading-relaxed uppercase tracking-wide">
                      {team.description}
                    </p>
                  </div>
                </div>

                {/* Team Roster - Basic View */}
                <div>
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team Roster ({team.members.length + 1}/{team.maxMembers})
                  </h3>
                  
                  <div className="grid grid-cols-6 gap-3 p-4 bg-gray-100 border-2 border-gray-400">
                    {/* Leader Slot */}
                    <div className="group relative">
                      {renderMemberSlot(team.leader, 0, true)}
                      <div className="text-center mt-2">
                        <div className="font-pixel text-pixel-xs text-gray-700 uppercase tracking-wider">Leader</div>
                        <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">{team.leader.name}</div>
                      </div>
                    </div>
                    
                    {/* Member Slots */}
                    {Array.from({ length: team.maxMembers - 1 }, (_, i) => {
                      const member = team.members[i] || null;
                      return (
                        <div key={i + 1} className="group relative">
                          {renderMemberSlot(member, i + 1)}
                          <div className="text-center mt-2">
                            {member ? (
                              <>
                                <div className="font-pixel text-pixel-xs text-gray-700 uppercase tracking-wider">{member.role}</div>
                                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">{member.name}</div>
                              </>
                            ) : (
                              <div className="font-pixel text-pixel-xs text-gray-500 uppercase tracking-wider">Open Slot</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Basic Requirements */}
                <div>
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                    What We're Looking For
                  </h3>
                  <div className="space-y-2">
                    {team.requirements.slice(0, 3).map((requirement, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-3 bg-blue-100 border border-blue-400"
                      >
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-orbitron text-pixel-sm text-blue-700 uppercase tracking-wide">
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Join Section */}
              <div className="space-y-6">
                {/* Staking Info */}
                <div className="bg-yellow-50 border-2 border-yellow-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-sm text-yellow-800 mb-3 uppercase tracking-wider flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Staking Required
                  </h3>
                  <div className="text-center">
                    <div className="font-pixel font-bold text-pixel-2xl text-yellow-600 mb-2">
                      {team.stakeAmount} IDEA
                    </div>
                    <p className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide">
                      Tokens required to join this team
                    </p>
                  </div>
                </div>

                {/* Team Info */}
                <div className="bg-gray-50 border-2 border-gray-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                    Team Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                        Created {team.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                        {team.members.length + 1}/{team.maxMembers} Members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seeking Roles */}
                {team.requiredRoles.length > 0 && (
                  <div className="bg-gray-50 border-2 border-gray-400 p-4">
                    <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                      Seeking Roles
                    </h3>
                    <div className="space-y-2">
                      {team.requiredRoles.map((role, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 p-2 bg-yellow-100 border border-yellow-400"
                        >
                          {getRoleIcon(role)}
                          <span className="font-pixel text-pixel-sm font-medium text-gray-700 uppercase tracking-wider">
                            {role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="bg-gray-50 border-2 border-gray-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {team.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Section */}
                {user && !isUserInTeam && team.isRecruiting && !team.isFull && (
                  <div className="bg-green-50 border-2 border-green-400 p-4">
                    <h3 className="font-pixel font-bold text-pixel-sm text-green-800 mb-3 uppercase tracking-wider">
                      Join This Team
                    </h3>
                    
                    {/* Role Selection */}
                    <div className="mb-4">
                      <label className="block font-pixel text-pixel-xs text-gray-700 mb-2 uppercase tracking-wider">
                        Select Role:
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-600 font-pixel text-pixel-sm focus:outline-none focus:border-moss-green uppercase tracking-wider"
                      >
                        <option value="">Choose Role...</option>
                        {team.requiredRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    {/* Staking Notice */}
                    <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400">
                      <p className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide text-center">
                        You will stake {team.stakeAmount} IDEA tokens to join
                      </p>
                    </div>

                    {/* Application Message */}
                    <div className="mb-4">
                      <label className="block font-pixel text-pixel-xs text-gray-700 mb-2 uppercase tracking-wider">
                        Message (Optional):
                      </label>
                      <textarea
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green uppercase tracking-wide resize-none"
                        placeholder="WHY DO YOU WANT TO JOIN?"
                        maxLength={200}
                      />
                    </div>

                    <button
                      onClick={handleJoinTeam}
                      disabled={!selectedRole}
                      className="w-full flex items-center justify-center space-x-2 bg-moss-green text-white py-3 border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>STAKE & JOIN</span>
                    </button>
                  </div>
                )}

                {/* Already in team */}
                {isUserInTeam && (
                  <div className="bg-blue-50 border-2 border-blue-400 p-4 text-center">
                    <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 flex items-center justify-center text-white text-xl mx-auto mb-3">
                      ✅
                    </div>
                    <h3 className="font-pixel font-bold text-pixel-sm text-blue-800 mb-2 uppercase tracking-wider">
                      You're in this team!
                    </h3>
                    <button className="w-full bg-blue-500 text-white py-2 border-2 border-blue-700 font-pixel font-bold text-pixel-sm hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider">
                      VIEW TEAM DASHBOARD
                    </button>
                  </div>
                )}

                {/* Contact Leader */}
                <div className="bg-gray-50 border-2 border-gray-400 p-4">
                  <button className="w-full flex items-center justify-center space-x-2 bg-sky-blue text-white py-3 border-2 border-blue-700 font-pixel font-bold text-pixel-sm hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4" />
                    <span>MESSAGE LEADER</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* FULL VIEW FOR TEAM MEMBERS ONLY */
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                    Project Description
                  </h3>
                  <div className="bg-gray-50 border-2 border-gray-300 p-4">
                    <p className="font-orbitron text-pixel-sm text-gray-600 leading-relaxed uppercase tracking-wide">
                      {team.description}
                    </p>
                  </div>
                </div>

                {/* Smart Contract Info */}
                {team.contractAddress && (
                  <div>
                    <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                      Smart Contract
                    </h3>
                    <div className="bg-blue-50 border-2 border-blue-400 p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-pixel text-pixel-sm text-blue-800 uppercase tracking-wider">Contract Address:</span>
                      </div>
                      <code className="font-orbitron text-pixel-sm text-blue-700 bg-blue-100 px-2 py-1 border border-blue-300 uppercase tracking-wide">
                        {team.contractAddress}
                      </code>
                    </div>
                  </div>
                )}

                {/* Project Files */}
                {team.projectFiles && team.projectFiles.length > 0 && (
                  <div>
                    <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Project Files
                    </h3>
                    <div className="space-y-2">
                      {team.projectFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-400 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="font-orbitron text-pixel-sm text-gray-700 uppercase tracking-wide">
                            {file}
                          </span>
                          <div className="ml-auto">
                            <button className="px-2 py-1 bg-sky-blue text-white border border-blue-700 font-pixel text-pixel-xs hover:bg-blue-600 transition-colors uppercase tracking-wider">
                              DOWNLOAD
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Roster */}
                <div>
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team Roster ({team.members.length + 1}/{team.maxMembers})
                  </h3>
                  
                  <div className="grid grid-cols-6 gap-3 p-4 bg-gray-100 border-2 border-gray-400">
                    {/* Leader Slot */}
                    <div className="group relative">
                      {renderMemberSlot(team.leader, 0, true)}
                      <div className="text-center mt-2">
                        <div className="font-pixel text-pixel-xs text-gray-700 uppercase tracking-wider">Leader</div>
                        <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">{team.leader.name}</div>
                        {team.leader.stakedTokens && (
                          <div className="font-pixel text-pixel-xs text-yellow-600 uppercase tracking-wider">
                            {team.leader.stakedTokens} IDEA
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Member Slots */}
                    {Array.from({ length: team.maxMembers - 1 }, (_, i) => {
                      const member = team.members[i] || null;
                      return (
                        <div key={i + 1} className="group relative">
                          {renderMemberSlot(member, i + 1)}
                          <div className="text-center mt-2">
                            {member ? (
                              <>
                                <div className="font-pixel text-pixel-xs text-gray-700 uppercase tracking-wider">{member.role}</div>
                                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">{member.name}</div>
                                {member.stakedTokens && (
                                  <div className="font-pixel text-pixel-xs text-yellow-600 uppercase tracking-wider">
                                    {member.stakedTokens} IDEA
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="font-pixel text-pixel-xs text-gray-500 uppercase tracking-wider">Open Slot</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                    Requirements
                  </h3>
                  <div className="space-y-2">
                    {team.requirements.map((requirement, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-3 bg-blue-100 border border-blue-400"
                      >
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="font-orbitron text-pixel-sm text-blue-700 uppercase tracking-wide">
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Staking Info */}
                <div className="bg-yellow-50 border-2 border-yellow-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-sm text-yellow-800 mb-3 uppercase tracking-wider flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Staking Required
                  </h3>
                  <div className="text-center">
                    <div className="font-pixel font-bold text-pixel-2xl text-yellow-600 mb-2">
                      {team.stakeAmount} IDEA
                    </div>
                    <p className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide">
                      Tokens required to join this team
                    </p>
                  </div>
                </div>

                {/* Team Info */}
                <div className="bg-gray-50 border-2 border-gray-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                    Team Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                        Created {team.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                        {team.members.length + 1}/{team.maxMembers} Members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seeking Roles */}
                {team.requiredRoles.length > 0 && (
                  <div className="bg-gray-50 border-2 border-gray-400 p-4">
                    <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                      Seeking Roles
                    </h3>
                    <div className="space-y-2">
                      {team.requiredRoles.map((role, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 p-2 bg-yellow-100 border border-yellow-400"
                        >
                          {getRoleIcon(role)}
                          <span className="font-pixel text-pixel-sm font-medium text-gray-700 uppercase tracking-wider">
                            {role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="bg-gray-50 border-2 border-gray-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {team.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Already in team */}
                {isUserInTeam && (
                  <div className="bg-blue-50 border-2 border-blue-400 p-4 text-center">
                    <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 flex items-center justify-center text-white text-xl mx-auto mb-3">
                      ✅
                    </div>
                    <h3 className="font-pixel font-bold text-pixel-sm text-blue-800 mb-2 uppercase tracking-wider">
                      You're in this team!
                    </h3>
                    <button className="w-full bg-blue-500 text-white py-2 border-2 border-blue-700 font-pixel font-bold text-pixel-sm hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider">
                      VIEW TEAM DASHBOARD
                    </button>
                  </div>
                )}

                {/* Contact Leader */}
                <div className="bg-gray-50 border-2 border-gray-400 p-4">
                  <button className="w-full flex items-center justify-center space-x-2 bg-sky-blue text-white py-3 border-2 border-blue-700 font-pixel font-bold text-pixel-sm hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4" />
                    <span>MESSAGE LEADER</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetailModal;