import React, { useState, useRef } from 'react';
import { X, Crown, Plus, Minus, Users, Target, Sparkles, Upload, FileText, DollarSign, Loader, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWallet } from '../contexts/WalletContext';
import { ApiService } from '../services/api';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTeam: (teamData: any, projectFiles?: File[]) => void;
}

const availableRoles = ['Frontend', 'Backend', 'Designer', 'Product', 'Marketing', 'Blockchain'];
const availableTags = ['DeFi', 'Gaming', 'NFTs', 'Sustainability', 'AI', 'Metaverse', 'Social', 'Education'];

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onCreateTeam }) => {
  const { user } = useApp();
  const { isConnected, address, hasSuperheroIdentity, superheroName } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debug logging to understand the state issue
  console.log('🏗️ CreateTeamModal state check:', {
    isConnected,
    address,
    hasSuperheroIdentity,
    superheroName
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    description: '',
    maxMembers: 4,
    requiredRoles: [] as string[],
    tags: [] as string[],
    requirements: [] as string[],
    stakeAmount: 100,
    projectFiles: [] as string[],
  });
  const [newRequirement, setNewRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Check if wallet is connected
  if (!isConnected || !address) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 border-4 border-gray-800 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-red-500 to-orange-500">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-white" />
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                Wallet Required
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 border-4 border-red-400 flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-3 uppercase tracking-wider pixel-text-shadow">
              Connect Wallet First
            </h3>
            <p className="font-orbitron text-pixel-sm text-gray-600 mb-6 uppercase tracking-wide">
              You need to connect your wallet before you can create teams.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-sunset-coral to-sky-blue text-white py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider"
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is a superhero
  if (!hasSuperheroIdentity) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 border-4 border-gray-800 max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-moss-green to-sky-blue">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-white" />
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                Superhero Required
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 border-4 border-green-400 flex items-center justify-center text-3xl mx-auto mb-4">
              🦸‍♂️
            </div>
            <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-3 uppercase tracking-wider pixel-text-shadow">
              Create Superhero First
            </h3>
            <p className="font-orbitron text-pixel-sm text-gray-600 mb-6 uppercase tracking-wide">
              Only superheroes can create teams. Please create your superhero identity first.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-sunset-coral to-sky-blue text-white py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider"
            >
              CREATE SUPERHERO
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newFileNames = newFiles.map(file => file.name);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setFormData(prev => ({
        ...prev,
        projectFiles: [...prev.projectFiles, ...newFileNames]
      }));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      projectFiles: prev.projectFiles.filter((_, i) => i !== index)
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.includes(role)
        ? prev.requiredRoles.filter(r => r !== role)
        : [...prev.requiredRoles, role]
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && formData.requirements.length < 5) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!isConnected || !address || !hasSuperheroIdentity) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const createTeamRequest = {
        teamName: formData.name,
        projectName: formData.project,
        description: formData.description,
        requiredMembers: formData.maxMembers,
        requiredStake: formData.stakeAmount,
        roles: formData.requiredRoles,
        tags: formData.tags,
        projectFiles: formData.projectFiles,
        userAddress: address,
      };

      // Call the parent's create team handler which includes smart contract integration
      await onCreateTeam(createTeamRequest, uploadedFiles.length > 0 ? uploadedFiles : undefined);
      
      // Close modal and reset form only on success
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        project: '',
        description: '',
        maxMembers: 4,
        requiredRoles: [],
        tags: [],
        requirements: [],
        stakeAmount: 100,
        projectFiles: [],
      });
      setUploadedFiles([]);
      setCurrentStep(1);

    } catch (err) {
      console.error('Failed to create team:', err);
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.project.trim() && formData.description.trim();
      case 2:
        return formData.requiredRoles.length > 0 && formData.maxMembers >= 2;
      case 3:
        return formData.tags.length > 0 && formData.stakeAmount >= 100;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-sunset-coral to-moss-green">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-white" />
            <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
              Create Team
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-4 border-b-4 border-gray-800 bg-gray-100">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 border-2 flex items-center justify-center font-pixel text-pixel-sm transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-moss-green text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-600'
                  }`}>
                    {step}
                  </div>
                  <span className={`font-pixel text-pixel-xs mt-1 uppercase tracking-wider ${
                    currentStep >= step ? 'text-moss-green font-bold' : 'text-gray-600'
                  }`}>
                    {step === 1 && 'Basic'}
                    {step === 2 && 'Team'}
                    {step === 3 && 'Config'}
                    {step === 4 && 'Review'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step ? 'bg-moss-green' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-orbitron text-pixel-sm uppercase tracking-wide">
                  {error}
                </span>
              </div>
            </div>
          )}
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-2 uppercase tracking-wider">
                  Basic Information
                </h3>
                <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                  Tell us about your team and project
                </p>
              </div>

              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide"
                  placeholder="ENTER TEAM NAME..."
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide"
                  placeholder="ENTER PROJECT NAME..."
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide resize-none"
                  placeholder="DESCRIBE YOUR PROJECT..."
                  maxLength={500}
                />
                <div className="text-right mt-1">
                  <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                    {formData.description.length}/500
                  </span>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                  Project Files (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-400 p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md,.zip"
                  />
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-moss-green text-white px-4 py-2 border-2 border-green-700 font-pixel text-pixel-sm hover:bg-green-600 transition-colors uppercase tracking-wider"
                  >
                    UPLOAD FILES
                  </button>
                  <p className="font-orbitron text-pixel-xs text-gray-500 mt-2 uppercase tracking-wide">
                    PDF, DOC, TXT, MD, ZIP files supported
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
                            {file.name}
                          </span>
                          <span className="font-orbitron text-pixel-xs text-blue-500 uppercase tracking-wide">
                            ({(file.size / 1024).toFixed(1)} KB)
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
            </div>
          )}

          {/* Step 2: Team Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-2 uppercase tracking-wider">
                  Team Setup
                </h3>
                <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                  Configure your team size and required roles
                </p>
              </div>

              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                  Team Size (Including You)
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, maxMembers: Math.max(2, prev.maxMembers - 1) }))}
                    className="w-10 h-10 bg-red-500 text-white border-2 border-red-700 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="font-pixel font-bold text-pixel-2xl text-gray-800">{formData.maxMembers}</div>
                    <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Members</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, maxMembers: Math.min(8, prev.maxMembers + 1) }))}
                    className="w-10 h-10 bg-green-500 text-white border-2 border-green-700 flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                  Required Roles (Select 1-5)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      disabled={!formData.requiredRoles.includes(role) && formData.requiredRoles.length >= 5}
                      className={`p-3 border-2 font-pixel text-pixel-sm transition-all duration-200 pixel-button uppercase tracking-wider ${
                        formData.requiredRoles.includes(role)
                          ? 'bg-moss-green text-white border-green-700 shadow-lg'
                          : formData.requiredRoles.length >= 5
                          ? 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed'
                          : 'bg-white/50 text-gray-700 border-gray-600 hover:bg-white/70'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                  Requirements
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide"
                      placeholder="ADD REQUIREMENT..."
                      maxLength={100}
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      disabled={!newRequirement.trim() || formData.requirements.length >= 5}
                      className="px-4 py-2 bg-moss-green text-white border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      ADD
                    </button>
                  </div>
                  
                  {formData.requirements.map((requirement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-blue-100 border border-blue-400"
                    >
                      <span className="font-orbitron text-pixel-sm text-blue-700 uppercase tracking-wide">
                        {requirement}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-2 uppercase tracking-wider">
                  Team Configuration
                </h3>
                <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                  Set staking requirements and project tags
                </p>
              </div>

              {/* Staking Amount */}
              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                  Staking Amount (USDC Tokens)
                </label>
                <div className="bg-yellow-50 border-2 border-yellow-400 p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                    <span className="font-pixel text-pixel-sm text-yellow-800 uppercase tracking-wider">
                      Members must stake tokens to join
                    </span>
                  </div>
                  <p className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide">
                    Higher stakes attract more committed team members (Minimum: 100 USDC)
                  </p>
                </div>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={formData.stakeAmount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      stakeAmount: Math.max(100, parseInt(e.target.value) || 100)
                    }))}
                    min="100"
                    max="10000"
                    step="100"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide text-center"
                    placeholder="ENTER STAKE AMOUNT..."
                  />
                  <div className="text-center">
                    <span className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">
                      USDC Tokens (Min: 100, Max: 10000)
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                    As leader, you'll stake {formData.stakeAmount} USDC tokens
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                  Project Tags (Select 1-5)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                      className={`p-3 border-2 font-pixel text-pixel-sm transition-all duration-200 pixel-button uppercase tracking-wider ${
                        formData.tags.includes(tag)
                          ? 'bg-sky-blue text-white border-blue-700 shadow-lg'
                          : formData.tags.length >= 5
                          ? 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed'
                          : 'bg-white/50 text-gray-700 border-gray-600 hover:bg-white/70'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {formData.tags.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-400 p-4 mt-4">
                    <h4 className="font-pixel font-bold text-pixel-sm text-blue-800 mb-2 uppercase tracking-wider">
                      Selected Tags ({formData.tags.length}/5):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white border border-blue-700 font-pixel text-pixel-xs uppercase tracking-wider"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className="hover:bg-blue-600 p-1 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-2 uppercase tracking-wider">
                  Review & Create
                </h3>
                <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                  Review your team details before creating
                </p>
              </div>

              <div className="bg-white/90 border-4 border-gray-800 p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                      Team Details
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="font-pixel text-pixel-sm text-gray-600 uppercase tracking-wider">Name: </span>
                        <span className="font-orbitron text-pixel-sm text-gray-800 uppercase tracking-wide">{formData.name}</span>
                      </div>
                      <div>
                        <span className="font-pixel text-pixel-sm text-gray-600 uppercase tracking-wider">Project: </span>
                        <span className="font-orbitron text-pixel-sm text-gray-800 uppercase tracking-wide">{formData.project}</span>
                      </div>
                      <div>
                        <span className="font-pixel text-pixel-sm text-gray-600 uppercase tracking-wider">Size: </span>
                        <span className="font-orbitron text-pixel-sm text-gray-800 uppercase tracking-wide">{formData.maxMembers} Members</span>
                      </div>
                      <div>
                        <span className="font-pixel text-pixel-sm text-gray-600 uppercase tracking-wider">Stake: </span>
                        <span className="font-orbitron text-pixel-sm text-gray-800 uppercase tracking-wide">{formData.stakeAmount} USDC</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                      Required Roles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-moss-green/20 border border-moss-green font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                    Description
                  </h4>
                  <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                    {formData.description}
                  </p>
                </div>

                {formData.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.projectFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                      Project Files
                    </h4>
                    <div className="space-y-1">
                      {formData.projectFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <FileText className="w-3 h-3 text-gray-600" />
                          <span className="font-orbitron text-pixel-xs text-gray-700 uppercase tracking-wide">
                            {file}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Smart Contract Notice */}
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-400">
                  <h4 className="font-pixel font-bold text-pixel-sm text-blue-800 mb-2 uppercase tracking-wider">
                    Smart Contract Integration
                  </h4>
                  <p className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide">
                    A smart contract will be deployed to manage team staking, progress tracking, and token distribution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t-4 border-gray-800 mt-8">
            <button
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-3 border-2 border-gray-600 font-pixel font-bold text-pixel-sm hover:bg-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              <span>PREVIOUS</span>
            </button>

            <div className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
              Step {currentStep} of 4
            </div>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="flex items-center space-x-2 bg-moss-green text-white px-6 py-3 border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                <span>NEXT</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-sunset-coral to-sky-blue text-white px-8 py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'CREATING...' : 'CREATE TEAM'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;