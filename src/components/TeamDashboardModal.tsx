import React, { useState } from 'react';
import { X, Users, Crown, FileText, Calendar, Target, DollarSign, MessageCircle, Upload, Download, Eye, Lock } from 'lucide-react';

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

interface TeamDashboardModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

const TeamDashboardModal: React.FC<TeamDashboardModalProps> = ({ team, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-6xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r ${team.pixelColor}`}>
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-white" />
            <div>
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                {team.name} Dashboard
              </h2>
              <p className="font-orbitron text-pixel-sm text-white/80 uppercase tracking-wide">
                {team.project} - Team Workspace
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 text-white px-3 py-1 border-2 border-green-700 font-pixel text-pixel-sm font-bold uppercase tracking-wider">
              TEAM MEMBER
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b-4 border-gray-800 bg-gray-100">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'project', label: 'Project Details', icon: FileText },
              { id: 'team', label: 'Team Members', icon: Users },
              { id: 'files', label: 'Project Files', icon: Upload },
              { id: 'progress', label: 'Progress', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-r-2 border-gray-800 font-pixel font-bold text-pixel-sm transition-all duration-200 uppercase tracking-wider ${
                  activeTab === tab.id
                    ? 'bg-moss-green text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Summary */}
                <div className="bg-blue-50 border-2 border-blue-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-lg text-blue-800 mb-3 uppercase tracking-wider flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Project Summary
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-pixel text-pixel-sm text-blue-600 uppercase tracking-wider">Project: </span>
                      <span className="font-orbitron text-pixel-sm text-blue-800 uppercase tracking-wide">{team.project}</span>
                    </div>
                    <div>
                      <span className="font-pixel text-pixel-sm text-blue-600 uppercase tracking-wider">Description: </span>
                      <p className="font-orbitron text-pixel-sm text-blue-700 uppercase tracking-wide mt-1">
                        {team.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {team.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-500 text-white border border-blue-700 font-pixel text-pixel-xs uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Team Status */}
                <div className="bg-green-50 border-2 border-green-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-lg text-green-800 mb-3 uppercase tracking-wider flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Team Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-pixel text-pixel-sm text-green-600 uppercase tracking-wider">Members:</span>
                      <span className="font-orbitron text-pixel-sm text-green-800 uppercase tracking-wide">
                        {team.members.length + 1}/{team.maxMembers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-pixel text-pixel-sm text-green-600 uppercase tracking-wider">Status:</span>
                      <span className={`font-orbitron text-pixel-sm uppercase tracking-wide ${
                        team.isFull ? 'text-red-600' : 'text-green-800'
                      }`}>
                        {team.isFull ? 'Full' : 'Recruiting'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-pixel text-pixel-sm text-green-600 uppercase tracking-wider">Stake:</span>
                      <span className="font-orbitron text-pixel-sm text-green-800 uppercase tracking-wide">
                        {team.stakeAmount} USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-pixel text-pixel-sm text-green-600 uppercase tracking-wider">Created:</span>
                      <span className="font-orbitron text-pixel-sm text-green-800 uppercase tracking-wide">
                        {team.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart Contract Info */}
              {team.contractAddress && (
                <div className="bg-purple-50 border-2 border-purple-400 p-4">
                  <h3 className="font-pixel font-bold text-pixel-lg text-purple-800 mb-3 uppercase tracking-wider">
                    Smart Contract
                  </h3>
                  <div className="bg-purple-100 border border-purple-300 p-3">
                    <code className="font-orbitron text-pixel-sm text-purple-700 uppercase tracking-wide break-all">
                      {team.contractAddress}
                    </code>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Details Tab */}
          {activeTab === 'project' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                  Project Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">
                      Project Name:
                    </h4>
                    <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide bg-white border border-gray-300 p-3">
                      {team.project}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">
                      Description:
                    </h4>
                    <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide bg-white border border-gray-300 p-3 leading-relaxed">
                      {team.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">
                      Requirements:
                    </h4>
                    <div className="space-y-2">
                      {team.requirements.map((requirement, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 p-3 bg-white border border-gray-300"
                        >
                          <Target className="w-4 h-4 text-gray-500" />
                          <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                            {requirement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                  Team Members ({team.members.length + 1}/{team.maxMembers})
                </h3>
                
                {/* Leader */}
                <div className="mb-4">
                  <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">
                    Team Leader:
                  </h4>
                  <div className="bg-yellow-50 border-2 border-yellow-400 p-4 flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-600 flex items-center justify-center text-xl relative">
                      {team.leader.avatar}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 border border-yellow-700 flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-pixel font-bold text-pixel-sm text-yellow-800 uppercase tracking-wider">
                        {team.leader.name}
                      </div>
                      <div className="font-orbitron text-pixel-sm text-yellow-700 uppercase tracking-wide">
                        Level {team.leader.level} • {team.leader.role}
                      </div>
                      {team.leader.stakedTokens && (
                        <div className="font-pixel text-pixel-xs text-yellow-600 uppercase tracking-wider">
                          Staked: {team.leader.stakedTokens} USDC
                        </div>
                      )}
                    </div>
                    <button className="bg-yellow-500 text-white px-3 py-2 border-2 border-yellow-700 font-pixel text-pixel-xs hover:bg-yellow-600 transition-colors uppercase tracking-wider">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">
                    Team Members:
                  </h4>
                  <div className="space-y-2">
                    {team.members.map((member, idx) => (
                      <div key={member.id} className="bg-white border border-gray-300 p-4 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center text-lg">
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">
                            {member.name}
                          </div>
                          <div className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                            Level {member.level} • {member.role}
                          </div>
                          {member.stakedTokens && (
                            <div className="font-pixel text-pixel-xs text-gray-500 uppercase tracking-wider">
                              Staked: {member.stakedTokens} USDC
                            </div>
                          )}
                        </div>
                        <button className="bg-blue-500 text-white px-3 py-2 border-2 border-blue-700 font-pixel text-pixel-xs hover:bg-blue-600 transition-colors uppercase tracking-wider">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Empty Slots */}
                    {Array.from({ length: team.maxMembers - team.members.length - 1 }, (_, i) => (
                      <div key={`empty-${i}`} className="bg-gray-100 border-2 border-dashed border-gray-400 p-4 flex items-center justify-center text-gray-500">
                        <span className="font-pixel text-pixel-sm uppercase tracking-wider">Open Slot</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Project Files
                </h3>
                
                {team.projectFiles && team.projectFiles.length > 0 ? (
                  <div className="space-y-3">
                    {team.projectFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-300 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">
                              {file}
                            </div>
                            <div className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                              Uploaded by team leader
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-blue-500 text-white px-3 py-2 border-2 border-blue-700 font-pixel text-pixel-xs hover:bg-blue-600 transition-colors uppercase tracking-wider flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>VIEW</span>
                          </button>
                          <button className="bg-green-500 text-white px-3 py-2 border-2 border-green-700 font-pixel text-pixel-xs hover:bg-green-600 transition-colors uppercase tracking-wider flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>DOWNLOAD</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-pixel text-pixel-sm text-gray-500 uppercase tracking-wider">
                      No project files uploaded yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Project Progress
                </h3>
                
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-pixel text-pixel-sm text-gray-500 uppercase tracking-wider mb-4">
                    No progress updates yet
                  </p>
                  <p className="font-orbitron text-pixel-xs text-gray-400 uppercase tracking-wide">
                    Team leader can submit progress updates here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboardModal;