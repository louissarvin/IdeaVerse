import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Users, Zap, Calendar, Target, MessageCircle, Edit, Share, Heart, Eye, DollarSign } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWallet } from '../contexts/WalletContext';
import { ApiService } from '../services/api';
import BuilderRatingModal from '../components/BuilderRatingModal';

const ProfilePage = () => {
  const { id } = useParams();
  const { builders, ideas, user, rateBuilder, getBuilderRating } = useApp();
  const { isConnected, address, hasSuperheroIdentity, superheroName } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentUserSuperhero, setCurrentUserSuperhero] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check if this is the current user's profile
  const isCurrentUserProfile = id === 'me' || !id;

  // Load current user's superhero profile if viewing own profile
  useEffect(() => {
    if (isCurrentUserProfile && isConnected &&  hasSuperheroIdentity && address) {
      // Always try to load profile if we have an address, don't wait for hasSuperheroIdentity
      loadCurrentUserProfile();
    }
  }, [isCurrentUserProfile, isConnected, hasSuperheroIdentity, address]);

  const loadCurrentUserProfile = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading current user superhero profile for:', address);
      
      // Try to get superhero profile from API
      const superheroResponse = await ApiService.getSuperheroByAddress(address);
      
      if (superheroResponse.success && superheroResponse.data) {
        const apiSuperhero = superheroResponse.data;
        
        // Transform API superhero to Builder format
        const transformedSuperhero = {
          id: apiSuperhero.superhero_id || 999,
          name: apiSuperhero.name || superheroName || 'Current User',
          username: `@${(apiSuperhero.name || superheroName || 'user').toLowerCase().replace(/\s+/g, '')}`,
          avatar: apiSuperhero.avatar_url || '🦸‍♂️',
          level: Math.floor((apiSuperhero.reputation || 0) / 100) + 1,
          reputation: apiSuperhero.reputation || 0,
          specialties: Array.isArray(apiSuperhero.specialities) ? apiSuperhero.specialities : ['Blockchain', 'Web3'],
          achievements: ['Blockchain Pioneer', 'Builder'],
          teamsFormed: 0,
          ideasMinted: 0,
          bgGradient: 'from-sunset-coral/20 to-sky-blue/20',
          location: 'Decentralized',
          joinedDate: apiSuperhero.created_at ? 
            new Date(typeof apiSuperhero.created_at === 'string' ? apiSuperhero.created_at : apiSuperhero.created_at * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
            new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          bio: apiSuperhero.bio || 'A superhero building the future of Web3',
          skills: Array.isArray(apiSuperhero.skills) ? apiSuperhero.skills : ['Smart Contracts', 'DeFi', 'NFTs'],
          currentProjects: 1,
          followers: 0,
          following: 0,
          isOnline: true,
          featured: false,
          pixelColor: 'from-green-400 to-emerald-500',
          rating: 0,
          totalRatings: 0,
        };
        
        console.log('✅ Loaded current user superhero profile:', transformedSuperhero);
        setCurrentUserSuperhero(transformedSuperhero);
      } else {
        console.log('❌ No superhero profile found for current user');
      }
    } catch (error) {
      console.error('❌ Failed to load current user superhero profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find the superhero to display
  let superhero = null;
  
  if (isCurrentUserProfile) {
    // For current user, use the loaded profile or create a basic one
    if (isConnected && hasSuperheroIdentity) {
      superhero = currentUserSuperhero || {
        id: 999,
        name: superheroName || 'Current User',
        username: `@${(superheroName || 'user').toLowerCase().replace(/\s+/g, '')}`,
        avatar: '🦸‍♂️',
        level: 1,
        reputation: 100,
        specialties: ['Web3', 'Blockchain'],
        achievements: ['New Superhero'],
        teamsFormed: 0,
        ideasMinted: 0,
        bgGradient: 'from-sunset-coral/20 to-sky-blue/20',
        location: 'Decentralized',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        bio: 'A superhero building the future of Web3',
        skills: ['Smart Contracts', 'DeFi'],
        currentProjects: 0,
        followers: 0,
        following: 0,
        isOnline: true,
        featured: false,
        pixelColor: 'from-green-400 to-emerald-500',
        rating: 0,
        totalRatings: 0,
      };
    }
  } else {
    // For other users, find by ID from builders array
    superhero = builders.find(builder => builder.id === parseInt(id || '1'));
  }
  
  // Get superhero's ideas
  const superheroIdeas = ideas.filter(idea => idea.creator === superhero?.name);
  
  // Show loading for current user profile while fetching
  if (isCurrentUserProfile && loading) {
    return (
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sunset-coral mx-auto mb-4"></div>
          <p className="text-pixel-lg font-orbitron text-gray-600 uppercase tracking-wide">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Show connect wallet message if not connected
  if (isCurrentUserProfile && !isConnected) {
    return (
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-pixel-4xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
            Connect Wallet
          </h1>
          <p className="text-pixel-lg font-orbitron text-gray-600 uppercase tracking-wide">
            Please connect your wallet to view your profile
          </p>
        </div>
      </div>
    );
  }

  // Show create superhero prompt if current user doesn't have superhero identity
  if (isCurrentUserProfile && isConnected && !hasSuperheroIdentity) {
    return (
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-pixel-4xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
            Create Your Superhero
          </h1>
          <p className="text-pixel-lg font-orbitron text-gray-600 uppercase tracking-wide mb-2">
            Address: {address}
          </p>
          <p className="text-pixel-lg font-orbitron text-gray-600 uppercase tracking-wide mb-6">
            You haven't created your superhero identity yet
          </p>
          <a 
            href="/create-superhero"
            className="inline-block bg-gradient-to-r from-sunset-coral to-sky-blue text-white font-pixel text-pixel-lg px-8 py-4 border-4 border-gray-800 hover:transform hover:scale-105 transition-all duration-200 uppercase tracking-wider pixel-text-shadow"
          >
            Create Superhero
          </a>
        </div>
      </div>
    );
  }

  // Show error if superhero not found (for other users or if current user has issues)
  if (!superhero) {
    return (
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-pixel-4xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
            Superhero Not Found
          </h1>
          <p className="text-pixel-lg font-orbitron text-gray-600 uppercase tracking-wide">
            {isCurrentUserProfile ? 'Unable to load your superhero profile' : 'The superhero you\'re looking for doesn\'t exist'}
          </p>
          {isCurrentUserProfile && (
            <p className="text-pixel-sm font-orbitron text-gray-500 uppercase tracking-wide mt-2">
              Please try refreshing the page or check your wallet connection
            </p>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'ideas', label: 'Ideas', icon: Zap },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentUserRating = getBuilderRating(superhero.id);

  return (
    <>
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-8xl px-4">
          {/* Clean Hero Section */}
          <div className="pixel-card mb-8">
            <div className={`h-24 bg-gradient-to-r ${superhero.pixelColor} relative overflow-hidden border-b-4 border-gray-800`}>
              {/* Simple Pixel Pattern Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-12 h-full">
                  {[...Array(48)].map((_, i) => (
                    <div key={i} className={`${i % 3 === 0 ? 'bg-white/30' : i % 5 === 0 ? 'bg-black/20' : ''}`}></div>
                  ))}
                </div>
              </div>

              {/* Simple Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="bg-white/20 border-2 border-white text-white p-2 hover:bg-white/30 transition-colors">
                  <Share className="w-4 h-4" />
                </button>
                {user && user.name !== superhero.name && (
                  <button className="bg-white/20 border-2 border-white text-white p-2 hover:bg-white/30 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Clean Profile Info */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-sunset-coral to-sky-blue border-4 border-gray-800 flex items-center justify-center text-6xl shadow-2xl">
                    {superhero.avatar}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div>
                      <h1 className="text-pixel-3xl font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider pixel-text-shadow">
                        {superhero.name}
                      </h1>
                      <p className="text-pixel-lg font-orbitron text-gray-600 mb-4 uppercase tracking-wide">
                        {superhero.username}
                      </p>
                      <div className="flex items-center space-x-6 mb-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                            Joined {superhero.joinedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3">
                      {user && user.name !== superhero.name && (
                        <>
                          <button
                            onClick={() => setIsRatingModalOpen(true)}
                            className="flex items-center space-x-2 bg-yellow-500 text-white px-6 py-3 border-2 border-yellow-700 font-pixel font-bold text-pixel-sm hover:bg-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wider"
                          >
                            <Star className="w-4 h-4" />
                            <span>{currentUserRating > 0 ? 'UPDATE RATING' : 'RATE SUPERHERO'}</span>
                          </button>
                          <button className="flex items-center space-x-2 bg-moss-green text-white px-6 py-3 border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wider">
                            <Users className="w-4 h-4" />
                            <span>CONNECT</span>
                          </button>
                        </>
                      )}
                      {user && user.name === superhero.name && (
                        <button className="flex items-center space-x-2 bg-sky-blue text-white px-6 py-3 border-2 border-blue-700 font-pixel font-bold text-pixel-sm hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wider">
                          <Edit className="w-4 h-4" />
                          <span>EDIT PROFILE</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="font-orbitron text-pixel-sm text-gray-600 mb-6 leading-relaxed uppercase tracking-wide">
                    {superhero.bio}
                  </p>

                  {/* Essential Stats Only */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-100 border-2 border-blue-400">
                      <div className="font-pixel font-bold text-pixel-2xl text-blue-600 mb-1">{superhero.reputation}</div>
                      <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Reputation</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-100 border-2 border-yellow-400">
                      <div className="font-pixel font-bold text-pixel-2xl text-yellow-600 mb-1">{superhero.rating}</div>
                      <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Rating</div>
                    </div>
                    <div className="text-center p-4 bg-green-100 border-2 border-green-400">
                      <div className="font-pixel font-bold text-pixel-2xl text-green-600 mb-1">{superhero.teamsFormed}</div>
                      <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Teams</div>
                    </div>
                    <div className="text-center p-4 bg-purple-100 border-2 border-purple-400">
                      <div className="font-pixel font-bold text-pixel-2xl text-purple-600 mb-1">{superhero.ideasMinted}</div>
                      <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Ideas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="pixel-card mb-8">
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 border-2 font-pixel text-pixel-sm transition-all duration-200 pixel-button uppercase tracking-wider ${
                      activeTab === tab.id
                        ? 'bg-sunset-coral text-white border-red-600 shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-gray-600 hover:bg-white/30'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pixel-card">
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Specialties */}
                  <div>
                    <h3 className="text-pixel-xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {superhero.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-sky-blue/20 border-2 border-sky-blue font-pixel text-pixel-sm font-medium text-gray-700 uppercase tracking-wider shadow-lg"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-pixel-xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
                      Skills
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {superhero.skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-moss-green/20 border border-moss-green text-center"
                        >
                          <span className="font-orbitron text-pixel-sm font-medium text-gray-700 uppercase tracking-wide">
                            {skill}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Stats - Simplified */}
                  <div>
                    <h3 className="text-pixel-xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
                      Activity
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-orange-100 border-2 border-orange-400 text-center">
                        <div className="font-pixel font-bold text-pixel-xl text-orange-600 mb-2">{superhero.currentProjects}</div>
                        <div className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">Current Projects</div>
                      </div>
                      <div className="p-4 bg-indigo-100 border-2 border-indigo-400 text-center">
                        <div className="font-pixel font-bold text-pixel-xl text-indigo-600 mb-2">{superhero.followers}</div>
                        <div className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">Followers</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ideas' && (
                <div>
                  <h3 className="text-pixel-xl font-pixel font-bold text-gray-800 mb-6 uppercase tracking-wider pixel-text-shadow">
                    Ideas Created ({superheroIdeas.length})
                  </h3>
                  {superheroIdeas.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {superheroIdeas.map((idea, index) => (
                        <div
                          key={idea.id}
                          className="bg-white/90 border-4 border-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className={`h-16 bg-gradient-to-r ${idea.pixelColor} relative overflow-hidden border-b-4 border-gray-800`}>
                            <div className="absolute inset-0 opacity-30">
                              <div className="grid grid-cols-6 h-full">
                                {[...Array(18)].map((_, i) => (
                                  <div key={i} className={`${i % 3 === 0 ? 'bg-white/30' : i % 5 === 0 ? 'bg-black/20' : ''}`}></div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            <h4 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider line-clamp-2">
                              {idea.title}
                            </h4>
                            <p className="font-orbitron text-pixel-xs text-gray-600 mb-3 uppercase tracking-wide line-clamp-2">
                              {idea.description}
                            </p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3 text-red-500" />
                                  <span className="font-pixel text-pixel-xs">{idea.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3 text-blue-500" />
                                  <span className="font-pixel text-pixel-xs">{idea.views}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 font-pixel text-pixel-xs text-gray-800 bg-yellow-100 px-2 py-1 border border-yellow-400">
                                <DollarSign className="w-3 h-3 text-yellow-600" />
                                <span>{idea.price}</span>
                              </div>
                            </div>

                            <button className="w-full bg-moss-green text-white py-2 border-2 border-green-700 font-pixel font-bold text-pixel-xs hover:bg-green-600 transition-all duration-200 uppercase tracking-wider">
                              VIEW IDEA
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="font-orbitron text-pixel-lg text-gray-500 uppercase tracking-wide">
                        No ideas created yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-pixel-xl font-pixel font-bold text-gray-800 mb-6 uppercase tracking-wider pixel-text-shadow">
                    Reviews & Ratings
                  </h3>
                  
                  {/* Rating Summary */}
                  <div className="mb-8 p-6 bg-yellow-100 border-2 border-yellow-400">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-6 h-6 ${
                                  i < Math.floor(superhero.rating) ? 'fill-current text-yellow-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-pixel font-bold text-pixel-2xl text-gray-800">
                            {superhero.rating}/5
                          </span>
                        </div>
                        <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
                          Based on {superhero.totalRatings} reviews
                        </p>
                      </div>
                      
                      {user && user.name !== superhero.name && (
                        <button
                          onClick={() => setIsRatingModalOpen(true)}
                          className="bg-yellow-500 text-white px-6 py-3 border-2 border-yellow-700 font-pixel font-bold text-pixel-sm hover:bg-yellow-600 transition-all duration-200 uppercase tracking-wider"
                        >
                          {currentUserRating > 0 ? 'UPDATE RATING' : 'RATE NOW'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Reviews List Placeholder */}
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="font-orbitron text-pixel-lg text-gray-500 uppercase tracking-wide">
                      Reviews will be displayed here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BuilderRatingModal 
        builder={superhero} 
        isOpen={isRatingModalOpen} 
        onClose={() => setIsRatingModalOpen(false)} 
      />
    </>
  );
};

export default ProfilePage;