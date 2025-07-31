import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trophy, Users, Zap, Badge, Search, Filter, MapPin, Calendar, Award, Target, MessageCircle, RefreshCw, Database, Blocks } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWallet } from '../contexts/WalletContext';

const specialties = ['All', 'DeFi', 'UI/UX', 'Blockchain', 'GameFi', 'Mobile', 'Product'];
const sortOptions = ['Reputation', 'Level', 'Recently Joined', 'Most Active', 'Highest Rated'];

const BuildersPage = () => {
  const { builders, loadBuilders, isLoading, user, error } = useApp();
  const { isConnected, address } = useWallet();
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('Reputation');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load builders from API when component mounts
  useEffect(() => {
    loadBuilders();
  }, []); // Remove loadBuilders dependency to prevent infinite loop

  // Manual refresh function with blockchain fallback
  const handleRefresh = async (forceBlockchain: boolean = false) => {
    setIsRefreshing(true);
    try {
      await loadBuilders(forceBlockchain);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredBuilders = builders.filter(builder => {
    // Ensure specialties is an array
    const builderSpecialties = Array.isArray(builder.specialties) ? builder.specialties : [];
    
    const matchesSpecialty = selectedSpecialty === 'All' || builderSpecialties.some(spec => spec.includes(selectedSpecialty));
    const matchesSearch = builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (builder.username && builder.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         builderSpecialties.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpecialty && matchesSearch;
  });

  // Sort builders
  const sortedBuilders = [...filteredBuilders].sort((a, b) => {
    switch (sortBy) {
      case 'Highest Rated':
        return b.rating - a.rating;
      case 'Reputation':
        return b.reputation - a.reputation;
      case 'Level':
        return b.level - a.level;
      case 'Most Active':
        return b.currentProjects - a.currentProjects;
      default:
        return 0;
    }
  });

  return (
    <>
      <div className="relative z-10 min-h-screen pt-8 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-8xl px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-pixel-4xl md:text-pixel-6xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
              <span className="inline-block bg-white/20 border-4 border-gray-800 px-4 py-2 mb-2 shadow-lg">Builder</span>{' '}
              <span className="inline-block bg-moss-green/20 border-4 border-green-600 px-4 py-2 shadow-lg text-moss-green">Community</span>
            </h1>
            <p className="text-pixel-lg font-orbitron text-gray-600 max-w-2xl mx-auto uppercase tracking-wide">
              Connect with talented creators and rate their superhero skills
            </p>
          </div>

          {/* Search and Filters */}
          <div className="pixel-card mb-8">
            <div className="p-4">
              {/* Top Row - Search and Sort Controls */}
              <div className="flex flex-col lg:flex-row gap-3 items-center justify-between mb-4">
                {/* Search */}
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="SEARCH BUILDERS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/30 backdrop-blur-sm border-2 border-gray-600 rounded-none font-pixel text-pixel-sm placeholder-gray-500 focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wider"
                  />
                </div>

                {/* Sort Control */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white/30 backdrop-blur-sm border-2 border-gray-600 rounded-none font-pixel text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wider"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Bottom Row - Specialty Filters */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`px-3 py-1 border-2 font-pixel text-pixel-xs transition-all duration-200 pixel-button uppercase tracking-wider ${
                      selectedSpecialty === specialty
                        ? 'bg-moss-green text-white border-green-600 shadow-lg'
                        : 'bg-white/20 backdrop-blur-sm border-gray-600 hover:bg-white/30'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Data Source Indicator & Refresh Controls */}
          <div className="pixel-card mb-6">
            <div className="p-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Data Source Info */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="font-pixel text-pixel-sm text-gray-700 uppercase tracking-wider">
                      {sortedBuilders.length} Builders Loaded
                    </span>
                  </div>
                  
                  {error && (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <Blocks className="w-4 h-4" />
                      <span className="font-orbitron text-pixel-xs uppercase tracking-wide">
                        Using Blockchain Data
                      </span>
                    </div>
                  )}
                </div>

                {/* Refresh Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRefresh(false)}
                    disabled={isLoading || isRefreshing}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 border-2 border-blue-700 font-pixel text-pixel-xs hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>REFRESH</span>
                  </button>
                  
                  <button
                    onClick={() => handleRefresh(true)}
                    disabled={isLoading || isRefreshing}
                    className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 border-2 border-purple-700 font-pixel text-pixel-xs hover:bg-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    <Blocks className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>BLOCKCHAIN</span>
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mt-3 p-3 bg-orange-100 border-2 border-orange-400 text-orange-700">
                  <p className="font-orbitron text-pixel-xs uppercase tracking-wide">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-8">
            <h2 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider pixel-text-shadow">
              {searchQuery || selectedSpecialty !== 'All' ? 'Search Results' : 'All Builders'} ({sortedBuilders.length})
            </h2>

            {(searchQuery || selectedSpecialty !== 'All') && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">Filters:</span>
                {selectedSpecialty !== 'All' && (
                  <span className="px-2 py-1 bg-moss-green/20 border border-moss-green font-pixel text-pixel-xs text-gray-700 uppercase tracking-wider">
                    {selectedSpecialty}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-1 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs text-gray-700 uppercase tracking-wider">
                    "{searchQuery}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('All');
                  }}
                  className="px-2 py-1 bg-red-500 text-white border border-red-700 font-pixel text-pixel-xs hover:bg-red-600 transition-all duration-200 uppercase tracking-wider"
                >
                  CLEAR ALL
                </button>
              </div>
            )}
          </div>

          {/* Builders Grid */}
          {sortedBuilders.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sortedBuilders.map((builder, index) => (
                <div
                  key={`builder-${builder.id}-${index}-${builder.username}`}
                  className="group relative bg-white/90 border-4 border-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Compact Pixel Art Header */}
                  <div className={`h-16 bg-gradient-to-r ${builder.pixelColor} relative overflow-hidden border-b-4 border-gray-800`}>
                    {/* Pixel Pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="grid grid-cols-6 h-full">
                        {[...Array(18)].map((_, i) => (
                          <div key={i} className={`${i % 3 === 0 ? 'bg-white/30' : i % 5 === 0 ? 'bg-black/20' : ''}`}></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-1 left-1 right-1 flex justify-between items-start">
                      {/* Level Badge */}
                      <div className="px-1 py-0.5 bg-purple-500 text-white border border-purple-700 font-pixel text-pixel-xs font-bold uppercase tracking-wider">
                        L{builder.level}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center space-x-1">
                        {/* Superhero Identity Badge */}
                        <div className="bg-blue-500 text-white p-0.5 border border-blue-700 font-pixel text-pixel-xs font-bold" title="Superhero Identity - Can be rated">
                          🦸‍♂️
                        </div>
                        {builder.featured && (
                          <div className="bg-yellow-400 text-black p-0.5 border border-yellow-600 font-pixel text-pixel-xs font-bold">
                            ⭐
                          </div>
                        )}
                        {builder.isOnline ? (
                          <div className="bg-green-500 text-white p-0.5 border border-green-700">
                            <div className="w-2 h-2 bg-white rounded-none animate-pulse"></div>
                          </div>
                        ) : (
                          <div className="bg-gray-500 text-white p-0.5 border border-gray-700">
                            <div className="w-2 h-2 bg-white rounded-none"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compact Card Content */}
                  <div className="p-2">
                    {/* Avatar & Name */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center text-sm overflow-hidden">
                        {builder.avatarUrl ? (
                          <img 
                            src={builder.avatarUrl} 
                            alt={builder.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${builder.avatarUrl ? 'hidden' : 'flex'}`}>
                          {typeof builder.avatar === 'string' && builder.avatar.startsWith('http') ? (
                            <img 
                              src={builder.avatar} 
                              alt={builder.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            builder.avatar || '🦸‍♂️'
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-pixel font-bold text-pixel-xs text-gray-800 uppercase tracking-wider truncate">{builder.name}</h3>
                        <p className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide truncate">{builder.username}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-1 mb-2 p-1 bg-gray-100 border border-gray-400">
                      <MapPin className="w-2 h-2 text-gray-500" />
                      <span className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide truncate">{builder.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between mb-2 p-1 bg-yellow-100 border border-yellow-400">
                      <div className="flex items-center space-x-1">
                        <Star className="w-2 h-2 text-yellow-600" />
                        <span className="font-pixel text-pixel-xs font-bold text-gray-700 uppercase tracking-wider">
                          {builder.rating}
                        </span>
                      </div>
                      <span className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">
                        ({builder.totalRatings})
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(builder.specialties) && builder.specialties.slice(0, 2).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-1 py-0.5 bg-sky-blue/20 border border-sky-blue font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                          >
                            {specialty}
                          </span>
                        ))}
                        {(!Array.isArray(builder.specialties) || builder.specialties.length === 0) && (
                          <span className="px-1 py-0.5 bg-gray-200 border border-gray-400 font-pixel text-pixel-xs font-medium text-gray-500 uppercase tracking-wider">
                            No specialties
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div className="text-center p-1 bg-blue-100 border border-blue-400">
                        <div className="font-pixel font-bold text-pixel-xs text-blue-600">{builder.teamsFormed}</div>
                        <div className="font-orbitron text-pixel-xs text-gray-600 uppercase">Teams</div>
                      </div>
                      <div className="text-center p-1 bg-green-100 border border-green-400">
                        <div className="font-pixel font-bold text-pixel-xs text-green-600">{builder.ideasMinted}</div>
                        <div className="font-orbitron text-pixel-xs text-gray-600 uppercase">Ideas</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-1">
                      <Link
                        to={`/profile/${builder.id}`}
                        className="flex items-center justify-center bg-sky-blue text-white py-1 border border-blue-700 font-pixel font-bold text-pixel-xs hover:bg-blue-600 transition-all duration-200 uppercase tracking-wider"
                      >
                        VIEW PROFILE
                      </Link>
                      <button className="bg-moss-green text-white py-1 border border-green-700 font-pixel font-bold text-pixel-xs hover:bg-green-600 transition-all duration-200 uppercase tracking-wider">
                        CONNECT
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* No Results State */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 border-4 border-gray-400 flex items-center justify-center text-4xl mx-auto mb-6">
                🔍
              </div>
              <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-3 uppercase tracking-wider pixel-text-shadow">
                No Builders Found
              </h3>
              <p className="font-orbitron text-pixel-sm text-gray-600 mb-6 uppercase tracking-wide max-w-md mx-auto">
                Try adjusting your search terms or filters to find more builders
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All');
                }}
                className="bg-moss-green text-white px-6 py-3 border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 uppercase tracking-wider"
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BuildersPage;