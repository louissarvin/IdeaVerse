import React, { useState, useEffect } from 'react';
import { Heart, Lock, Unlock, DollarSign, User, Eye, ShoppingCart, CheckCircle, X, TrendingUp } from 'lucide-react';
import { usePonderQuery } from '../hooks/usePonderQuery';
import IdeaDetailModal from './IdeaDetailModal';

const MarketplaceSection = () => {
  const { getIdeas, loading, error } = usePonderQuery();
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);

  // Load ideas from Ponder GraphQL
  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const result = await getIdeas(20, false); // Get all ideas, not just available
        setIdeas(result.items || []);
      } catch (err) {
        console.error('Failed to load ideas:', err);
        // Fallback to empty array if loading fails
        setIdeas([]);
      }
    };

    loadIdeas();
  }, [getIdeas]);

  // Separate available and sold ideas
  const availableIdeas = ideas.filter(idea => !idea.isPurchased).slice(0, 4);
  const soldIdeas = ideas.filter(idea => idea.isPurchased).slice(0, 4);

  const handleIdeaClick = (idea) => {
    // Don't allow viewing purchased ideas
    if (idea.isPurchased) {
      return;
    }
    setSelectedIdea(idea);
  };

  return (
    <>
      <section id="marketplace" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-fredoka font-bold text-gray-800 mb-4">
              Idea <span className="text-sky-blue">Marketplace</span>
            </h2>
            <p className="text-lg font-poppins text-gray-600 max-w-2xl mx-auto mb-8">
              Discover, collect, and trade groundbreaking ideas from creators worldwide
            </p>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['All', 'DeFi', 'Gaming', 'Sustainability', 'Education'].map((filter) => (
                <button
                  key={filter}
                  className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 font-poppins text-sm hover:bg-white/30 transition-all duration-200"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Available Ideas Grid - TOP SECTION */}
          {availableIdeas.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-fredoka font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 text-moss-green mr-2" />
                Available Ideas
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {availableIdeas.map((idea, index) => (
                  <div
                    key={idea.id}
                    className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                    onClick={() => handleIdeaClick(idea)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="px-2 py-1 rounded-full text-xs font-poppins font-medium border bg-sunset-coral/20 border-sunset-coral text-gray-700">
                          {idea.category}
                        </div>
                        <div className="flex items-center space-x-1">
                          {idea.isLocked ? (
                            <Lock className="w-4 h-4 text-red-500" />
                          ) : (
                            <Unlock className="w-4 h-4 text-moss-green" />
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-fredoka font-bold text-lg text-gray-800 mb-1 line-clamp-2">
                        {idea.title}
                      </h3>
                      <p className="font-poppins text-sm text-gray-600 line-clamp-2">
                        {idea.description}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Creator */}
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-sunset-coral to-sky-blue rounded-full flex items-center justify-center text-xs overflow-hidden">
                          {typeof idea.avatar === 'string' && idea.avatar.startsWith('data:') ? (
                            <img src={idea.avatar} alt="Creator avatar" className="w-full h-full object-cover" />
                          ) : (
                            idea.avatar
                          )}
                        </div>
                        <span className="font-poppins text-sm text-gray-700">{idea.creator}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              likeIdea(idea.id);
                            }}
                            className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${idea.isLiked ? 'fill-current text-red-500' : ''}`} />
                            <span>{idea.likes}</span>
                          </button>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{idea.views}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-center space-x-1 font-poppins font-semibold text-yellow-800">
                          <DollarSign className="w-4 h-4" />
                          <span>{idea.price}</span>
                        </div>
                      </div>

                      {/* View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIdeaClick(idea);
                        }}
                        className="w-full px-3 py-1 bg-gradient-to-r from-sunset-coral to-sky-blue text-white rounded-full text-xs font-poppins font-medium hover:shadow-md transition-all duration-200"
                      >
                        View Details
                      </button>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sold Ideas Grid - BOTTOM SECTION */}
          {soldIdeas.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-fredoka font-bold text-gray-800 mb-6 flex items-center">
                <ShoppingCart className="w-6 h-6 text-red-500 mr-2" />
                Recently Sold Ideas
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {soldIdeas.map((idea, index) => (
                  <div
                    key={idea.id}
                    className="group relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 transition-all duration-300 hover:shadow-xl cursor-not-allowed opacity-75"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Sold Out Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-500 border-4 border-red-700 flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-2xl">
                          <X className="w-8 h-8" />
                        </div>
                        <div className="bg-red-500 text-white px-4 py-2 border-2 border-red-700 font-fredoka font-bold text-lg shadow-lg">
                          SOLD OUT
                        </div>
                        <div className="mt-2 text-white font-poppins text-sm">
                          No longer available
                        </div>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="px-2 py-1 rounded-full text-xs font-poppins font-medium border bg-sunset-coral/20 border-sunset-coral text-gray-700">
                          {idea.category}
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-poppins font-bold flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>SOLD</span>
                          </div>
                          {idea.isLocked ? (
                            <Lock className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Unlock className="w-4 h-4 text-moss-green" />
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-fredoka font-bold text-lg text-gray-800 mb-1 line-clamp-2">
                        {idea.title}
                      </h3>
                      <p className="font-poppins text-sm text-gray-600 line-clamp-2">
                        {idea.description}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Creator */}
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-sunset-coral to-sky-blue rounded-full flex items-center justify-center text-xs overflow-hidden">
                          {typeof idea.avatar === 'string' && idea.avatar.startsWith('data:') ? (
                            <img src={idea.avatar} alt="Creator avatar" className="w-full h-full object-cover" />
                          ) : (
                            idea.avatar
                          )}
                        </div>
                        <span className="font-poppins text-sm text-gray-700">{idea.creator}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 text-gray-400" />
                            <span>{idea.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{idea.views}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sale Info */}
                      <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-poppins text-xs text-green-700 font-medium">Sold for:</span>
                          <div className="flex items-center space-x-1 font-poppins font-semibold text-green-800">
                            <DollarSign className="w-4 h-4" />
                            <span>{idea.soldPrice}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="font-poppins text-xs text-green-600">{idea.soldDate}</span>
                        </div>
                      </div>

                      {/* Disabled Button */}
                      <button
                        disabled
                        className="w-full px-3 py-1 bg-gray-400 text-gray-600 rounded-full text-xs font-poppins font-medium cursor-not-allowed opacity-50"
                      >
                        No Longer Available
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load More */}
          <div className="text-center">
            <button className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 px-8 py-3 rounded-full font-poppins font-medium hover:bg-white/30 transition-all duration-200">
              <span>Explore More Ideas</span>
            </button>
          </div>
        </div>
      </section>

      <IdeaDetailModal 
        idea={selectedIdea} 
        isOpen={!!selectedIdea} 
        onClose={() => setSelectedIdea(null)} 
      />
    </>
  );
};

export default MarketplaceSection;