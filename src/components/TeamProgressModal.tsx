import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Target, CheckCircle, AlertCircle, DollarSign, Users } from 'lucide-react';
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

interface TeamProgressModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProgress: (teamId: number, progressData: any) => void;
}

const milestones = [
  'Project Planning Complete',
  'MVP Development Started',
  'Core Features Implemented',
  'Testing & QA Complete',
  'Beta Version Released',
  'Final Product Delivered',
];

const TeamProgressModal: React.FC<TeamProgressModalProps> = ({ team, isOpen, onClose, onSubmitProgress }) => {
  const { user } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progressData, setProgressData] = useState({
    completedMilestones: [] as string[],
    progressDescription: '',
    evidenceFiles: [] as string[],
    nextSteps: '',
    challenges: '',
    teamContributions: {} as Record<string, string>,
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  if (!isOpen || !team) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setProgressData(prev => ({
        ...prev,
        evidenceFiles: [...prev.evidenceFiles, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setProgressData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index)
    }));
  };

  const handleMilestoneToggle = (milestone: string) => {
    setProgressData(prev => ({
      ...prev,
      completedMilestones: prev.completedMilestones.includes(milestone)
        ? prev.completedMilestones.filter(m => m !== milestone)
        : [...prev.completedMilestones, milestone]
    }));
  };

  const handleContributionChange = (memberId: number, contribution: string) => {
    setProgressData(prev => ({
      ...prev,
      teamContributions: {
        ...prev.teamContributions,
        [memberId]: contribution
      }
    }));
  };

  const handleSubmit = () => {
    if (!user || progressData.completedMilestones.length === 0) return;

    const submissionData = {
      ...progressData,
      submittedBy: user.name,
      submittedAt: new Date().toISOString(),
      contractVerification: true, // This would trigger smart contract verification
    };

    onSubmitProgress(team.id, submissionData);
    
    // Reset form
    setProgressData({
      completedMilestones: [],
      progressDescription: '',
      evidenceFiles: [],
      nextSteps: '',
      challenges: '',
      teamContributions: {},
    });
    setUploadedFiles([]);
  };

  const allMembers = [team.leader, ...team.members];
  const progressPercentage = Math.round((progressData.completedMilestones.length / milestones.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r ${team.pixelColor}`}>
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-white" />
            <div>
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                Submit Progress
              </h2>
              <p className="font-orbitron text-pixel-sm text-white/80 uppercase tracking-wide">
                {team.name} - {team.project}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Smart Contract Notice */}
              <div className="bg-blue-50 border-2 border-blue-400 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-pixel font-bold text-pixel-sm text-blue-800 uppercase tracking-wider">
                    Smart Contract Verification
                  </h3>
                </div>
                <p className="font-orbitron text-pixel-sm text-blue-700 uppercase tracking-wide">
                  Your progress will be verified on-chain and tokens will be distributed based on milestone completion.
                </p>
                <div className="mt-2 p-2 bg-blue-100 border border-blue-300">
                  <code className="font-orbitron text-pixel-xs text-blue-800 uppercase tracking-wide">
                    Contract: {team.contractAddress}
                  </code>
                </div>
              </div>

              {/* Milestone Progress */}
              <div>
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-4 uppercase tracking-wider">
                  Project Milestones ({progressData.completedMilestones.length}/{milestones.length})
                </h3>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-pixel-sm text-gray-700 uppercase tracking-wider">Progress</span>
                    <span className="font-pixel text-pixel-sm text-gray-700 uppercase tracking-wider">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 border-2 border-gray-400 h-4">
                    <div 
                      className="h-full bg-gradient-to-r from-moss-green to-sky-blue border-r-2 border-gray-600 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-3 border-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                        progressData.completedMilestones.includes(milestone)
                          ? 'bg-green-100 border-green-400'
                          : 'bg-white border-gray-400'
                      }`}
                      onClick={() => handleMilestoneToggle(milestone)}
                    >
                      <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all duration-200 ${
                        progressData.completedMilestones.includes(milestone)
                          ? 'bg-green-500 border-green-700 text-white'
                          : 'bg-white border-gray-600'
                      }`}>
                        {progressData.completedMilestones.includes(milestone) && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`font-orbitron text-pixel-sm uppercase tracking-wide ${
                        progressData.completedMilestones.includes(milestone)
                          ? 'text-green-700 font-bold'
                          : 'text-gray-700'
                      }`}>
                        {milestone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Description */}
              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Progress Description *
                </label>
                <textarea
                  value={progressData.progressDescription}
                  onChange={(e) => setProgressData(prev => ({ ...prev, progressDescription: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide resize-none"
                  placeholder="DESCRIBE YOUR TEAM'S PROGRESS AND ACHIEVEMENTS..."
                  maxLength={1000}
                />
                <div className="text-right mt-1">
                  <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                    {progressData.progressDescription.length}/1000
                  </span>
                </div>
              </div>

              {/* Evidence Files */}
              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Evidence Files *
                </label>
                <div className="border-2 border-dashed border-gray-400 p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md,.zip,.png,.jpg,.jpeg"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-moss-green text-white px-4 py-2 border-2 border-green-700 font-pixel text-pixel-sm hover:bg-green-600 transition-colors uppercase tracking-wider"
                  >
                    UPLOAD EVIDENCE
                  </button>
                  <p className="font-orbitron text-pixel-xs text-gray-500 mt-2 uppercase tracking-wide">
                    Screenshots, documents, code samples, demos
                  </p>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-blue-100 border border-blue-400"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-orbitron text-pixel-sm text-blue-700 uppercase tracking-wide">
                            {file}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Next Steps
                </label>
                <textarea
                  value={progressData.nextSteps}
                  onChange={(e) => setProgressData(prev => ({ ...prev, nextSteps: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide resize-none"
                  placeholder="WHAT ARE YOUR NEXT PLANNED ACTIONS..."
                  maxLength={500}
                />
              </div>

              {/* Challenges */}
              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Challenges & Blockers
                </label>
                <textarea
                  value={progressData.challenges}
                  onChange={(e) => setProgressData(prev => ({ ...prev, challenges: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide resize-none"
                  placeholder="ANY CHALLENGES OR BLOCKERS FACED..."
                  maxLength={500}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Contributions */}
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Team Contributions
                </h3>
                <div className="space-y-3">
                  {allMembers.map((member) => (
                    <div key={member.id}>
                      <label className="block font-pixel text-pixel-xs text-gray-700 mb-1 uppercase tracking-wider">
                        {member.name} ({member.role}):
                      </label>
                      <textarea
                        value={progressData.teamContributions[member.id] || ''}
                        onChange={(e) => handleContributionChange(member.id, e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 bg-white border border-gray-600 font-orbitron text-pixel-xs focus:outline-none focus:border-moss-green uppercase tracking-wide resize-none"
                        placeholder="MEMBER'S CONTRIBUTION..."
                        maxLength={200}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Distribution Preview */}
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-sm text-yellow-800 mb-3 uppercase tracking-wider flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Token Distribution
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide">Progress Bonus:</span>
                    <span className="font-pixel text-pixel-xs text-yellow-800 uppercase tracking-wider">
                      {progressPercentage * 10} IDEA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide">Per Member:</span>
                    <span className="font-pixel text-pixel-xs text-yellow-800 uppercase tracking-wider">
                      {Math.round((progressPercentage * 10) / allMembers.length)} IDEA
                    </span>
                  </div>
                  <div className="border-t border-yellow-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="font-pixel text-pixel-xs text-yellow-800 uppercase tracking-wider">Total Reward:</span>
                      <span className="font-pixel text-pixel-xs text-yellow-800 uppercase tracking-wider">
                        {progressPercentage * 10} IDEA
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Requirements */}
              <div className="bg-red-50 border-2 border-red-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-sm text-red-800 mb-3 uppercase tracking-wider flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Requirements
                </h3>
                <div className="space-y-2">
                  <div className={`flex items-center space-x-2 ${
                    progressData.completedMilestones.length > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <div className={`w-3 h-3 border ${
                      progressData.completedMilestones.length > 0 ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
                    }`}></div>
                    <span className="font-orbitron text-pixel-xs uppercase tracking-wide">
                      At least 1 milestone
                    </span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    progressData.progressDescription.length >= 50 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <div className={`w-3 h-3 border ${
                      progressData.progressDescription.length >= 50 ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
                    }`}></div>
                    <span className="font-orbitron text-pixel-xs uppercase tracking-wide">
                      Progress description
                    </span>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    progressData.evidenceFiles.length > 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    <div className={`w-3 h-3 border ${
                      progressData.evidenceFiles.length > 0 ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
                    }`}></div>
                    <span className="font-orbitron text-pixel-xs uppercase tracking-wide">
                      Evidence files
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  progressData.completedMilestones.length === 0 ||
                  progressData.progressDescription.length < 50 ||
                  progressData.evidenceFiles.length === 0
                }
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-moss-green to-sky-blue text-white py-4 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider"
              >
                <Target className="w-4 h-4" />
                <span>SUBMIT TO BLOCKCHAIN</span>
              </button>

              {/* Warning */}
              <div className="bg-orange-50 border-2 border-orange-400 p-3">
                <p className="font-orbitron text-pixel-xs text-orange-700 uppercase tracking-wide text-center">
                  Submission is permanent and will be verified on-chain
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProgressModal;