import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, X, Plus, Minus, User, FileText, Zap, Award, Camera, Loader, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useSuperhero } from '../hooks/useSuperhero';

const availableSpecialties = [
  'DeFi', 'UI/UX', 'Blockchain', 'GameFi', 'Mobile', 'Product', 
  'Smart Contracts', 'Frontend', 'Backend', 'Design Systems',
  'Architecture', 'Community', 'NFTs', 'Strategy', 'Growth'
];

const availableSkills = [
  'Solidity', 'React', 'Node.js', 'Web3.js', 'Figma', 'Tailwind',
  'Framer', 'Rust', 'Go', 'Docker', 'Kubernetes', 'Unity', 'C#',
  'Blender', 'React Native', 'Flutter', 'Swift', 'Kotlin',
  'Product Management', 'Analytics', 'Python', 'JavaScript',
  'TypeScript', 'GraphQL', 'MongoDB', 'PostgreSQL'
];

const avatarOptions = [
  '🦸‍♂️', '🦸‍♀️', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '🚀', '⚡', '🌟', '💎',
  '🔥', '🌙', '⭐', '🎯', '🏆', '💪', '🧠', '🎮', '🎨', '🔧'
];

const CreateSuperheroPage = () => {
  const navigate = useNavigate();
  const { isConnected, address, hasSuperheroIdentity, superheroName, isCheckingSuperhero } = useWallet();
  const { createSuperhero, isLoading: superheroLoading, error: superheroError } = useSuperhero();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '🦸‍♂️',
    specialties: [] as string[],
    skills: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if wallet is connected and if user already has superhero identity
  React.useEffect(() => {
    if (!isConnected) {
      navigate('/');
    } else if (!isCheckingSuperhero && hasSuperheroIdentity) {
      // User already has a superhero identity, redirect to builders page
      navigate('/builders');
    }
  }, [isConnected, isCheckingSuperhero, hasSuperheroIdentity, superheroName, navigate]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dreamy-gradient">
        <div className="pixel-card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider">
            Wallet Not Connected
          </h2>
          <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
            Please connect your wallet to create a superhero profile
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while checking superhero identity
  if (isCheckingSuperhero) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dreamy-gradient">
        <div className="pixel-card p-8 text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent animate-spin rounded-full mx-auto mb-6"></div>
          <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider">
            Checking Identity...
          </h2>
          <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
            Verifying your superhero status on the blockchain
          </p>
        </div>
      </div>
    );
  }

  // Show message if user already has superhero identity
  if (hasSuperheroIdentity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dreamy-gradient">
        <div className="pixel-card p-8 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-moss-green to-sky-blue border-4 border-gray-800 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            🦸‍♂️
          </div>
          <h2 className="text-pixel-xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider">
            Superhero Identity Exists
          </h2>
          <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide mb-4">
            You already have a superhero identity: <strong>{superheroName}</strong>
          </p>
          <p className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide mb-6">
            Each wallet can only have one superhero identity.
          </p>
          <button
            onClick={() => navigate('/builders')}
            className="bg-gradient-to-r from-moss-green to-sky-blue text-white px-6 py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider"
          >
            View Builders
          </button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        setUploadedFile(file);
        setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
        setErrors(prev => ({ ...prev, avatar: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, avatarUrl: '🦸‍♂️' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
      if (formData.name.length > 31) newErrors.name = 'Name must be 31 characters or less (bytes32 limit)';
      if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
      if (formData.bio.length < 5) newErrors.bio = 'Bio must be at least 5 characters';
      if (formData.bio.length > 31) newErrors.bio = 'Bio must be 31 characters or less (bytes32 limit)';
    }

    if (step === 2) {
      if (formData.specialties.length === 0) newErrors.specialties = 'Select at least one specialty';
      if (formData.specialties.length > 5) newErrors.specialties = 'Maximum 5 specialties allowed';
      
      // Check each specialty length for bytes32 compatibility
      const invalidSpecialties = formData.specialties.filter(specialty => specialty.length > 31);
      if (invalidSpecialties.length > 0) {
        newErrors.specialties = `Specialties must be 31 characters or less: ${invalidSpecialties.join(', ')}`;
      }
    }

    if (step === 3) {
      if (formData.skills.length === 0) newErrors.skills = 'Select at least one skill';
      if (formData.skills.length > 10) newErrors.skills = 'Maximum 10 skills allowed';
      
      // Check each skill length for bytes32 compatibility
      const invalidSkills = formData.skills.filter(skill => skill.length > 31);
      if (invalidSkills.length > 0) {
        newErrors.skills = `Skills must be 31 characters or less: ${invalidSkills.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!address) {
      setErrors({ submit: 'Wallet not connected' });
      return;
    }

    const superheroData = {
      name: formData.name,
      bio: formData.bio,
      skills: formData.skills,
      specialities: formData.specialties, // Note: using specialities to match contract
      avatarFile: uploadedFile || undefined,
    };

    setIsSubmitting(true);
    setErrors({});

    try {
      await createSuperhero(superheroData);

      // Navigate to builders page - the new superhero should appear immediately
      navigate('/builders');
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create superhero' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Specialties', icon: Award },
    { number: 3, title: 'Skills', icon: Zap },
    { number: 4, title: 'Review', icon: FileText },
  ];

  return (
    <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-pixel-4xl md:text-pixel-6xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
            <span className="inline-block bg-white/20 border-4 border-gray-800 px-4 py-2 mb-2 shadow-lg">Create</span>{' '}
            <span className="inline-block bg-sunset-coral/20 border-4 border-red-600 px-4 py-2 shadow-lg text-sunset-coral">Superhero</span>
          </h1>
          <p className="text-pixel-lg font-orbitron text-gray-600 max-w-2xl mx-auto uppercase tracking-wide">
            Join the ultimate Web3 builder community and showcase your superpowers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="pixel-card mb-8">
          <div className="p-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 border-4 flex items-center justify-center mb-2 transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-moss-green text-white border-green-700 shadow-lg'
                        : 'bg-white/20 text-gray-600 border-gray-600'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`font-pixel text-pixel-xs uppercase tracking-wider ${
                      currentStep >= step.number ? 'text-moss-green font-bold' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-moss-green' : 'bg-gray-300'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="pixel-card">
          <div className="p-6">
            {/* Global Error Display */}
            {(superheroError || errors.submit) && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-orbitron text-pixel-sm uppercase tracking-wide">
                    {superheroError || errors.submit}
                  </span>
                </div>
              </div>
            )}
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider pixel-text-shadow">
                    Basic Information
                  </h2>
                  <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                    Tell us about yourself and your superhero identity
                  </p>
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                    Choose Your Avatar
                  </label>
                  
                  {/* Upload Section */}
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-400 p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {uploadedImage ? (
                        <div className="space-y-4">
                          <div className="w-24 h-24 mx-auto border-4 border-gray-800 overflow-hidden shadow-lg">
                            <img 
                              src={uploadedImage} 
                              alt="Uploaded avatar" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex justify-center space-x-3">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center space-x-2 bg-sky-blue text-white px-4 py-2 border-2 border-blue-700 font-pixel text-pixel-xs hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider"
                            >
                              <Camera className="w-3 h-3" />
                              <span>CHANGE</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 border-2 border-red-700 font-pixel text-pixel-xs hover:bg-red-600 transition-all duration-200 uppercase tracking-wider"
                            >
                              <X className="w-3 h-3" />
                              <span>REMOVE</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center space-x-2 bg-moss-green text-white px-6 py-3 border-2 border-green-700 font-pixel text-pixel-sm hover:bg-green-600 transition-all duration-200 mx-auto uppercase tracking-wider"
                            >
                              <Upload className="w-4 h-4" />
                              <span>UPLOAD IMAGE</span>
                            </button>
                          </div>
                          <p className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                            Support: JPG, PNG, GIF (Max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                    {errors.avatar && (
                      <p className="mt-2 font-orbitron text-pixel-xs text-red-600 uppercase tracking-wide text-center">
                        {errors.avatar}
                      </p>
                    )}
                  </div>

                  {/* Emoji Options */}
                  <div className="mb-4">
                    <p className="font-pixel text-pixel-sm text-gray-700 mb-3 uppercase tracking-wider text-center">
                      Or choose an emoji avatar:
                    </p>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-4">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, avatarUrl: avatar }));
                            setUploadedImage(null);
                            setUploadedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className={`w-12 h-12 border-4 flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 ${
                            formData.avatarUrl === avatar && !uploadedImage
                              ? 'bg-moss-green border-green-700 shadow-lg'
                              : 'bg-white/50 border-gray-600 hover:bg-white/70'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-sunset-coral to-sky-blue border-4 border-gray-800 flex items-center justify-center text-4xl mx-auto shadow-lg overflow-hidden">
                      {uploadedImage ? (
                        <img 
                          src={uploadedImage} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        formData.avatarUrl
                      )}
                    </div>
                    <p className="font-orbitron text-pixel-xs text-gray-600 mt-2 uppercase tracking-wide">
                      Preview
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                    Superhero Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide"
                    placeholder="ENTER YOUR SUPERHERO NAME..."
                    maxLength={31}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.name && (
                      <p className="font-orbitron text-pixel-xs text-red-600 uppercase tracking-wide">
                        {errors.name}
                      </p>
                    )}
                    <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                      {formData.name.length}/31
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
                    Bio *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide resize-none"
                    placeholder="SHORT BIO (MAX 31 CHARS)..."
                    maxLength={31}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.bio && (
                      <p className="font-orbitron text-pixel-xs text-red-600 uppercase tracking-wide">
                        {errors.bio}
                      </p>
                    )}
                    <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide ml-auto">
                      {formData.bio.length}/31
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Specialties */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider pixel-text-shadow">
                    Select Specialties
                  </h2>
                  <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                    Choose your areas of expertise (1-5 specialties)
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  {availableSpecialties.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtyToggle(specialty)}
                      className={`p-3 border-2 font-pixel text-pixel-sm transition-all duration-200 pixel-button uppercase tracking-wider ${
                        formData.specialties.includes(specialty)
                          ? 'bg-moss-green text-white border-green-700 shadow-lg'
                          : 'bg-white/50 text-gray-700 border-gray-600 hover:bg-white/70'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>

                {/* Selected Specialties Display */}
                {formData.specialties.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-400 p-4">
                    <h4 className="font-pixel font-bold text-pixel-sm text-blue-800 mb-2 uppercase tracking-wider">
                      Selected Specialties ({formData.specialties.length}/5):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white border border-blue-700 font-pixel text-pixel-xs uppercase tracking-wider"
                        >
                          <span>{specialty}</span>
                          <button
                            type="button"
                            onClick={() => handleSpecialtyToggle(specialty)}
                            className="hover:bg-blue-600 p-1 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {errors.specialties && (
                  <p className="font-orbitron text-pixel-sm text-red-600 uppercase tracking-wide text-center">
                    {errors.specialties}
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider pixel-text-shadow">
                    Select Skills
                  </h2>
                  <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                    Choose your technical skills (1-10 skills)
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`p-2 border font-pixel text-pixel-xs transition-all duration-200 pixel-button uppercase tracking-wider ${
                        formData.skills.includes(skill)
                          ? 'bg-sky-blue text-white border-blue-700 shadow-lg'
                          : 'bg-white/50 text-gray-700 border-gray-600 hover:bg-white/70'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>

                {/* Selected Skills Display */}
                {formData.skills.length > 0 && (
                  <div className="bg-green-50 border-2 border-green-400 p-4">
                    <h4 className="font-pixel font-bold text-pixel-sm text-green-800 mb-2 uppercase tracking-wider">
                      Selected Skills ({formData.skills.length}/10):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-green-500 text-white border border-green-700 font-pixel text-pixel-xs uppercase tracking-wider"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className="hover:bg-green-600 p-0.5 transition-colors"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {errors.skills && (
                  <p className="font-orbitron text-pixel-sm text-red-600 uppercase tracking-wide text-center">
                    {errors.skills}
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider pixel-text-shadow">
                    Review & Create
                  </h2>
                  <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                    Review your superhero profile before creating
                  </p>
                </div>

                {/* Profile Preview */}
                <div className="bg-white/90 border-4 border-gray-800 p-6">
                  <div className="flex items-start space-x-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-sunset-coral to-sky-blue border-4 border-gray-800 flex items-center justify-center text-4xl shadow-lg overflow-hidden">
                      {uploadedImage ? (
                        <img 
                          src={uploadedImage} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        formData.avatarUrl
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider pixel-text-shadow">
                        {formData.name}
                      </h3>
                      <p className="font-orbitron text-pixel-sm text-gray-600 mb-2 uppercase tracking-wide">
                        🌐 Web3 Universe
                      </p>
                      <p className="font-orbitron text-pixel-sm text-gray-600 leading-relaxed uppercase tracking-wide">
                        {formData.bio}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                        Specialties ({formData.specialties.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-moss-green/20 border border-moss-green font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                        Skills ({formData.skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Notice */}
                <div className="bg-yellow-100 border-2 border-yellow-400 p-4">
                  <p className="font-orbitron text-pixel-sm text-yellow-700 uppercase tracking-wide text-center">
                    By creating your superhero profile, you agree to our terms of service and community guidelines.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t-4 border-gray-800 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 bg-gray-400 text-white px-6 py-3 border-2 border-gray-600 font-pixel font-bold text-pixel-sm hover:bg-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                <Minus className="w-4 h-4" />
                <span>PREVIOUS</span>
              </button>

              <div className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                Step {currentStep} of {steps.length}
              </div>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={superheroLoading}
                  className="flex items-center space-x-2 bg-moss-green text-white px-6 py-3 border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  <span>NEXT</span>
                  <Plus className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={superheroLoading || isSubmitting}
                  className="flex items-center space-x-2 bg-gradient-to-r from-sunset-coral to-sky-blue text-white px-8 py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? 'CREATING...' : 'CREATE SUPERHERO'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSuperheroPage;