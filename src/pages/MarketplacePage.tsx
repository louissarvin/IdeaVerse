import React, { useState } from 'react';
import { Heart, Lock, Unlock, DollarSign, User, Eye, Search, Filter, TrendingUp, Star, Grid, List, ShoppingCart, CheckCircle, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import IdeaDetailModal from '../components/IdeaDetailModal';

const categories = ['All', 'DeFi', 'Gaming', 'Sustainability', 'Education', 'Art', 'Metaverse'];
const sortOptions = ['Latest', 'Most Popular', 'Price: Low to High', 'Price: High to Low'];

const MarketplacePage = () => {
  const { ideas, likeIdea } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdea, setSelectedIdea] = useState(null);

  const filteredIdeas = ideas.filter(idea => {
    const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Separate available and sold ideas
  const availableIdeas = filteredIdeas.filter(idea => !idea.isSold);
  const soldIdeas = filteredIdeas.filter(idea => idea.isSold);

  const handleIdeaClick = (idea) => {
    // Don't allow viewing sold ideas
    if (idea.isSold) {
      return;
    }
    setSelectedIdea(idea);
  };

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
              Discover, collect, and trade groundbreaking ideas from creators worldwide
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

          {/* AVAILABLE IDEAS - TOP SECTION */}
          {availableIdeas.length > 0 && (
            <div className="mb-16">
              <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-6 flex items-center uppercase tracking-wider pixel-text-shadow">
                <TrendingUp className="w-6 h-6 text-moss-green mr-2" />
                Available Ideas ({availableIdeas.length})
              </h2>
              
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {availableIdeas.map((idea, index) => (
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
                            {idea.isLocked ? (
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
                          <button className="px-2 py-0.5 bg-moss-green text-white border border-green-700 font-pixel font-bold text-pixel-xs hover:bg-green-600 transition-all duration-200 uppercase tracking-wider">
                            VIEW
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {availableIdeas.map((idea, index) => (
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

          {/* SOLD OUT IDEAS - BOTTOM SECTION */}
          {soldIdeas.length > 0 && (
            <div className="mb-8">
              <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-6 flex items-center uppercase tracking-wider pixel-text-shadow">
                <ShoppingCart className="w-6 h-6 text-red-500 mr-2" />
                Sold Out Ideas ({soldIdeas.length})
              </h2>
              
              {viewMode === 'grid' ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {soldIdeas.map((idea, index) => (
                    <div
                      key={idea.id}
                      className="group relative bg-white/90 border-4 border-gray-800 transition-all duration-300 cursor-not-allowed opacity-75"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Sold Out Overlay for grid view */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-500 border-2 border-red-700 flex items-center justify-center text-white text-lg mx-auto mb-2 shadow-2xl">
                            <X className="w-6 h-6" />
                          </div>
                          <div className="bg-red-500 text-white px-2 py-1 border border-red-700 font-pixel font-bold text-pixel-xs shadow-lg uppercase tracking-wider">
                            SOLD OUT
                          </div>
                        </div>
                      </div>

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
                            <div className="bg-green-500 text-white p-0.5 border border-green-700">
                              <CheckCircle className="w-2 h-2" />
                            </div>
                            {idea.isLocked ? (
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
                            <div className="flex items-center space-x-1">
                              <Heart className="w-2 h-2 text-gray-400" />
                              <span className="font-pixel font-bold text-pixel-xs">{idea.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-2 h-2 text-gray-400" />
                              <span className="font-pixel font-bold text-pixel-xs">{idea.views}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 font-pixel font-bold text-pixel-xs px-1 py-0.5 border uppercase tracking-wider text-green-800 bg-green-100 border-green-400">
                            <DollarSign className="w-2 h-2 text-green-600" />
                            <span>{idea.soldPrice}</span>
                          </div>
                          <button 
                            disabled
                            className="px-2 py-0.5 bg-gray-400 text-gray-600 border border-gray-600 font-pixel font-bold text-pixel-xs cursor-not-allowed uppercase tracking-wider"
                          >
                            SOLD
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {soldIdeas.map((idea, index) => (
                    <div
                      key={idea.id}
                      className="group relative bg-white/90 border-4 border-gray-800 transition-all duration-300 cursor-not-allowed opacity-75"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Sold Out Overlay for list view */}
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-red-500 border-4 border-red-700 flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-2xl">
                            <X className="w-8 h-8" />
                          </div>
                          <div className="bg-red-500 text-white px-4 py-2 border-2 border-red-700 font-pixel font-bold text-pixel-lg shadow-lg uppercase tracking-wider">
                            SOLD OUT
                          </div>
                          <div className="mt-2 text-white font-orbitron text-pixel-sm uppercase tracking-wide">
                            No longer available
                          </div>
                        </div>
                      </div>

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
                                  <div className="bg-green-500 text-white px-2 py-1 border border-green-700 font-pixel text-pixel-xs font-bold shadow-lg uppercase tracking-wider flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>SOLD</span>
                                  </div>
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
                                <div className="flex items-center space-x-2 font-pixel font-bold text-pixel-lg mb-2 px-3 py-2 border-2 uppercase tracking-wider text-green-800 bg-green-100 border-green-400">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span>{idea.soldPrice}</span>
                                </div>
                                <div className="text-center mb-2">
                                  <span className="font-orbitron text-pixel-xs text-green-600 uppercase tracking-wide">
                                    Sold {idea.soldDate}
                                  </span>
                                </div>
                                <button 
                                  disabled
                                  className="px-4 py-2 bg-gray-400 text-gray-600 border-2 border-gray-600 font-pixel font-bold text-pixel-sm cursor-not-allowed uppercase tracking-wider"
                                >
                                  SOLD OUT
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
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3 text-gray-400" />
                                  <span className="font-pixel font-bold">{idea.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3 text-gray-400" />
                                  <span className="font-pixel font-bold">{idea.views}</span>
                                </div>
                                {idea.isLocked ? (
                                  <Lock className="w-3 h-3 text-gray-400" />
                                ) : (
                                  <Unlock className="w-3 h-3 text-gray-400" />
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