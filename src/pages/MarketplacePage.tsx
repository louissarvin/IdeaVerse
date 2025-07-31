import React, { useState, useEffect } from 'react';
import { Heart, Lock, Unlock, DollarSign, Eye, Search, Filter, TrendingUp, Grid, List } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWallet } from '../contexts/WalletContext';
import IdeaDetailModal from '../components/IdeaDetailModal';

const categories = ['All', 'DeFi', 'Gaming', 'Sustainability', 'Education', 'Art', 'Metaverse'];
const sortOptions = ['Latest', 'Most Popular', 'Price: Low to High', 'Price: High to Low'];

const MarketplacePage = () => {
  const { ideas, likeIdea, isLoading, refreshIdeas } = useApp();
  const { isConnected, address } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);

  // Load ideas when component mounts
  useEffect(() => {
    refreshIdeas();
  }, []); // Empty dependency array means this runs once on mount

  const filteredIdeas = ideas.filter(idea => {
    const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // MARKETPLACE FILTERING: Only show ideas user can purchase
  const displayIdeas = filteredIdeas.filter(idea => {
    // If wallet not connected, show all available ideas
    if (!isConnected || !address) {
      return !idea.isLocked && !idea.isSold && !idea.isOwned;
    }
    
    // Filter out ideas created by current user (creator address matches wallet address)
    if (idea.creator && idea.creator.toLowerCase() === address.toLowerCase()) {
      return false;
    }
    
    // Filter out ideas already purchased by current user
    if (idea.isOwned) {
      return false;
    }
    
    // Filter out locked ideas (unavailable for purchase)
    if (idea.isLocked) {
      return false;
    }
    
    // Filter out already sold ideas (unless they're available for resale)
    if (idea.isSold) {
      return false;
    }
    
    // Show available ideas that can be purchased
    return true;
  });

  // Debug logging for filtering stats
  useEffect(() => {
    if (isConnected && address && ideas.length > 0) {
      const ownCreations = ideas.filter(idea => idea.creator?.toLowerCase() === address.toLowerCase()).length;
      const ownedIdeas = ideas.filter(idea => idea.isOwned).length;
      const lockedIdeas = ideas.filter(idea => idea.isLocked).length;
      const soldIdeas = ideas.filter(idea => idea.isSold).length;
      const availableIdeas = displayIdeas.length;
      
    }
  }, [ideas, displayIdeas, isConnected, address]);

  const handleIdeaClick = (idea: any) => {
    // Allow viewing all ideas - the modal will show appropriate buttons
    setSelectedIdea(idea);
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-8xl px-4">
          <div className="text-center py-20">
            <div className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider">
              Loading Marketplace...
            </div>
            <div className="w-16 h-16 mx-auto border-4 border-sunset-coral border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no ideas
  if (!isLoading && ideas.length === 0) {
    return (
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-8xl px-4">
          <div className="text-center py-20">
            <div className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider">
              No Ideas Found
            </div>
            <p className="text-pixel-lg font-orbitron text-gray-600 uppercase tracking-wide">
              The marketplace is empty. Be the first to mint an idea!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-8xl px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-pixel-4xl md:text-pixel-6xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
              <span className="inline-block bg-white/20 border-4 border-gray-800 px-4 py-2 mb-2 shadow-lg">Idea</span>{' '}
              <span className="inline-block bg-sky-blue/20 border-4 border-blue-600 px-4 py-2 shadow-lg text-sky-blue">Marketplace</span>
            </h1>
            <p className="text-pixel-lg font-orbitron text-gray-600 max-w-2xl mx-auto uppercase tracking-wide">
              Discover and purchase groundbreaking ideas from creators worldwide
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
                    placeholder="SEARCH IDEAS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/30 backdrop-blur-sm border-2 border-gray-600 rounded-none font-pixel text-pixel-sm placeholder-gray-500 focus:outline-none focus:border-sunset-coral pixel-input uppercase tracking-wider"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white/30 backdrop-blur-sm border-2 border-gray-600 rounded-none font-pixel text-pixel-sm focus:outline-none focus:border-sunset-coral pixel-input uppercase tracking-wider"
                  >
                    {sortOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>

                  <div className="flex border-2 border-gray-600 bg-white/20 backdrop-blur-sm">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-all duration-200 pixel-button ${
                        viewMode === 'grid' ? 'bg-sunset-coral text-white border-r-2 border-gray-600' : 'text-gray-600 hover:text-sunset-coral border-r-2 border-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-all duration-200 pixel-button ${
                        viewMode === 'list' ? 'bg-sunset-coral text-white' : 'text-gray-600 hover:text-sunset-coral'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 border-2 font-pixel text-pixel-xs transition-all duration-200 pixel-button uppercase tracking-wider ${
                      selectedCategory === category
                        ? 'bg-sunset-coral text-white border-red-600 shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-gray-600 hover:bg-white/30'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MARKETPLACE IDEAS */}
          {displayIdeas.length > 0 && (
            <div className="mb-16">
              <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-6 flex items-center uppercase tracking-wider pixel-text-shadow">
                <TrendingUp className="w-6 h-6 text-moss-green mr-2" />
                Available Ideas ({displayIdeas.length})
              </h2>
              
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {displayIdeas.map((idea, index) => (
                    <div
                      key={idea.id}
                      className="group relative bg-white/90 border-4 border-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => handleIdeaClick(idea)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={`h-16 bg-gradient-to-r ${idea.pixelColor} relative overflow-hidden border-b-4 border-gray-800`}>
                        <div className="absolute inset-0 opacity-30">
                          <div className="grid grid-cols-6 h-full">
                            {[...Array(18)].map((_, i) => (
                              <div key={i} className={`${i % 3 === 0 ? 'bg-white/30' : i % 5 === 0 ? 'bg-black/20' : ''}`}></div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="absolute top-1 left-1 right-1 flex justify-between items-start">
                          <div className="px-1 py-0.5 bg-sunset-coral/20 border border-sunset-coral font-pixel text-pixel-xs font-bold uppercase tracking-wider">
                            {idea.category.charAt(0)}
                          </div>
                          <div className="flex items-center space-x-1">
                            {idea.isOwned || idea.isSold ? (
                              <div className="bg-green-600 text-white px-1 py-0.5 border border-green-800 font-pixel text-pixel-xs font-bold uppercase tracking-wider">
                                ✓ OWNED
                              </div>
                            ) : idea.isLocked ? (
                              <div className="bg-red-500 text-white p-0.5 border border-red-700">
                                <Lock className="w-2 h-2" />
                              </div>
                            ) : (
                              <div className="bg-green-500 text-white p-0.5 border border-green-700">
                                <Unlock className="w-2 h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <h3 className="font-pixel font-bold text-pixel-xs text-gray-800 mb-2 line-clamp-2 uppercase tracking-wider leading-tight">
                          {idea.title}
                        </h3>

                        <div className="flex items-center space-x-2 mb-2 p-1 bg-gray-100 border border-gray-400">
                          <div className="w-4 h-4 bg-gradient-to-br from-sunset-coral to-sky-blue border border-gray-600 flex items-center justify-center text-xs overflow-hidden">
                            {typeof idea.avatar === 'string' && idea.avatar.startsWith('data:') ? (
                              <img src={idea.avatar} alt="Creator avatar" className="w-full h-full object-cover" />
                            ) : (
                              idea.avatar
                            )}
                          </div>
                          <span className="font-pixel text-pixel-xs font-bold text-gray-700 uppercase tracking-wider truncate">{idea.creator}</span>
                        </div>

                        <div className="flex items-center justify-between mb-2 p-1 bg-gray-50 border border-gray-300">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                likeIdea(idea.id);
                              }}
                              className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                            >
                              <Heart className={`w-2 h-2 ${idea.isLiked ? 'fill-current text-red-500' : 'text-red-500'}`} />
                              <span className="font-pixel font-bold text-pixel-xs">{idea.likes}</span>
                            </button>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-2 h-2 text-blue-500" />
                              <span className="font-pixel font-bold text-pixel-xs">{idea.views}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 font-pixel font-bold text-pixel-xs px-1 py-0.5 border uppercase tracking-wider text-gray-800 bg-yellow-100 border-yellow-400">
                            <DollarSign className="w-2 h-2 text-yellow-600" />
                            <span>{idea.price}</span>
                          </div>
                          <button className={`px-2 py-0.5 text-white border font-pixel font-bold text-pixel-xs transition-all duration-200 uppercase tracking-wider ${
                            idea.isOwned || idea.isSold 
                              ? 'bg-blue-600 border-blue-700 hover:bg-blue-700' 
                              : 'bg-moss-green border-green-700 hover:bg-green-600'
                          }`}>
                            {idea.isOwned || idea.isSold ? 'VIEW CONTENT' : 'VIEW'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {displayIdeas.map((idea, index) => (
                    <div
                      key={idea.id}
                      className="group relative bg-white/90 border-4 border-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => handleIdeaClick(idea)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                            {typeof idea.avatar === 'string' && idea.avatar.startsWith('data:') ? (
                              <img src={idea.avatar} alt="Creator avatar" className="w-full h-full object-cover" />
                            ) : (
                              idea.avatar
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 pr-4">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 uppercase tracking-wider truncate pixel-text-shadow">
                                    {idea.title}
                                  </h3>
                                </div>
                                <p className="font-orbitron text-pixel-sm text-gray-600 mb-2 uppercase tracking-wide line-clamp-1">
                                  {idea.description}
                                </p>
                                <div className="flex items-center space-x-4 text-pixel-xs text-gray-500">
                                  <span className="font-pixel font-bold uppercase tracking-wider">by {idea.creator}</span>
                                  <span className="font-orbitron uppercase tracking-wide">{idea.createdAt}</span>
                                  <div className="px-2 py-1 bg-sunset-coral/20 border border-sunset-coral font-pixel font-bold uppercase tracking-wider">
                                    {idea.category}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right flex-shrink-0">
                                <div className="flex items-center space-x-2 font-pixel font-bold text-pixel-lg mb-2 px-3 py-2 border-2 uppercase tracking-wider text-gray-800 bg-yellow-100 border-yellow-400">
                                  <DollarSign className="w-4 h-4 text-yellow-600" />
                                  <span>{idea.price}</span>
                                </div>
                                <button className="px-4 py-2 bg-moss-green text-white border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 uppercase tracking-wider">
                                  VIEW DETAILS
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex flex-wrap gap-2">
                                {idea.tags.slice(0, 2).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center space-x-4 text-pixel-xs text-gray-600 bg-gray-50 px-3 py-2 border border-gray-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    likeIdea(idea.id);
                                  }}
                                  className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                                >
                                  <Heart className={`w-3 h-3 ${idea.isLiked ? 'fill-current text-red-500' : 'text-red-500'}`} />
                                  <span className="font-pixel font-bold">{idea.likes}</span>
                                </button>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3 text-blue-500" />
                                  <span className="font-pixel font-bold">{idea.views}</span>
                                </div>
                                {idea.isLocked ? (
                                  <Lock className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Unlock className="w-3 h-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* EMPTY STATE */}
          {displayIdeas.length === 0 && (
            <div className="text-center py-16">
              <div className="pixel-card p-8">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-pixel-xl font-pixel font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  No Ideas Available
                </h2>
                {isConnected && address ? (
                  <div className="font-orbitron text-gray-600 mb-6 uppercase tracking-wide space-y-2">
                    <p>No ideas available for purchase that match your filters.</p>
                    <p className="text-pixel-sm">Ideas you created or already own are hidden.</p>
                  </div>
                ) : (
                  <p className="font-orbitron text-gray-600 mb-6 uppercase tracking-wide">
                    No ideas match your current filters.
                  </p>
                )}
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="inline-block px-6 py-3 bg-moss-green text-white border-2 border-green-800 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-colors uppercase tracking-wider"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}


          {/* Load More */}
          <div className="text-center mt-8">
            <button className="inline-flex items-center space-x-2 bg-white/90 border-4 border-gray-600 text-gray-700 px-6 py-3 font-pixel font-bold text-pixel-sm hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>LOAD MORE IDEAS</span>
            </button>
          </div>
        </div>
      </div>

      <IdeaDetailModal 
        idea={selectedIdea} 
        isOpen={!!selectedIdea} 
        onClose={() => setSelectedIdea(null)} 
      />
    </>
  );
};

export default MarketplacePage;