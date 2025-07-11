import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, Zap } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 sm:py-16 lg:py-20">
      {/* Dynamic Helicarrier Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-mint-green"></div>
      
      {/* Animated Clouds - Hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute top-10 left-0 w-24 sm:w-32 h-12 sm:h-16 bg-white opacity-60 rounded-none animate-float-slow" style={{clipPath: 'polygon(0 50%, 25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%)'}}></div>
        <div className="absolute top-20 right-0 w-32 sm:w-40 h-16 sm:h-20 bg-white opacity-50 rounded-none animate-float-slow" style={{animationDelay: '2s', clipPath: 'polygon(0 50%, 25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%)'}}></div>
        <div className="absolute top-32 left-1/4 w-20 sm:w-28 h-10 sm:h-14 bg-white opacity-70 rounded-none animate-float-slow" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-40 right-1/3 w-28 sm:w-36 h-14 sm:h-18 bg-white opacity-45 rounded-none animate-float-slow" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Floating Helicarrier - Scaled for mobile */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        {/* Main Helicarrier */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 animate-helicarrier-float">
          <div className="relative">
            {/* Helicarrier Body */}
            <div className="w-64 md:w-80 lg:w-96 h-16 md:h-20 lg:h-24 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 border-2 md:border-4 border-gray-800 shadow-2xl">
              {/* Deck Details */}
              <div className="absolute top-1 md:top-2 left-2 md:left-4 right-2 md:right-4 h-1 md:h-2 bg-gray-400 border border-gray-600"></div>
              <div className="absolute top-3 md:top-6 left-4 md:left-8 right-4 md:right-8 h-0.5 md:h-1 bg-gray-300 border border-gray-500"></div>
              <div className="absolute bottom-2 md:bottom-4 left-3 md:left-6 right-3 md:right-6 h-2 md:h-3 bg-gray-400 border border-gray-600"></div>
              
              {/* Control Tower */}
              <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 w-12 md:w-16 h-8 md:h-12 bg-gray-600 border-2 md:border-4 border-gray-800">
                <div className="absolute top-0.5 md:top-1 left-0.5 md:left-1 right-0.5 md:right-1 h-1 md:h-2 bg-blue-400 border border-blue-600 opacity-80"></div>
                <div className="absolute bottom-0.5 md:bottom-1 left-1 md:left-2 right-1 md:right-2 h-0.5 md:h-1 bg-gray-400 border border-gray-600"></div>
              </div>
              
              {/* Engines */}
              <div className="absolute -bottom-4 md:-bottom-6 left-4 md:left-8 w-6 md:w-8 h-6 md:h-8 bg-gray-700 border border-gray-900 md:border-2">
                <div className="absolute inset-0.5 md:inset-1 bg-blue-400 border border-blue-600 animate-pulse"></div>
              </div>
              <div className="absolute -bottom-4 md:-bottom-6 right-4 md:right-8 w-6 md:w-8 h-6 md:h-8 bg-gray-700 border border-gray-900 md:border-2">
                <div className="absolute inset-0.5 md:inset-1 bg-blue-400 border border-blue-600 animate-pulse"></div>
              </div>
              
              {/* Landing Platforms */}
              <div className="absolute -top-1 md:-top-2 left-8 md:left-12 w-8 md:w-12 h-2 md:h-4 bg-gray-500 border border-gray-700 md:border-2"></div>
              <div className="absolute -top-1 md:-top-2 right-8 md:right-12 w-8 md:w-12 h-2 md:h-4 bg-gray-500 border border-gray-700 md:border-2"></div>
            </div>
            
            {/* Propellers */}
            <div className="absolute -top-8 md:-top-12 left-2 md:left-4 w-4 md:w-6 h-4 md:h-6 border-2 md:border-4 border-gray-700 animate-spin-slow">
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
            <div className="absolute -top-8 md:-top-12 right-2 md:right-4 w-4 md:w-6 h-4 md:h-6 border-2 md:border-4 border-gray-700 animate-spin-slow" style={{animationDelay: '0.5s'}}>
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
            <div className="absolute -bottom-8 md:-bottom-12 left-8 md:left-16 w-6 md:w-8 h-6 md:h-8 border-2 md:border-4 border-gray-700 animate-spin-slow" style={{animationDelay: '1s'}}>
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
            <div className="absolute -bottom-8 md:-bottom-12 right-8 md:right-16 w-6 md:w-8 h-6 md:h-8 border-2 md:border-4 border-gray-700 animate-spin-slow" style={{animationDelay: '1.5s'}}>
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Smaller Support Vehicles */}
        <div className="absolute top-1/3 left-1/4 animate-support-vehicle-1">
          <div className="w-12 md:w-16 h-4 md:h-6 bg-gray-500 border border-gray-700 md:border-2 shadow-lg">
            <div className="absolute -top-1 md:-top-2 left-1 md:left-2 w-2 md:w-3 h-2 md:h-3 border border-gray-700 md:border-2 animate-spin-slow">
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
            <div className="absolute -top-1 md:-top-2 right-1 md:right-2 w-2 md:w-3 h-2 md:h-3 border border-gray-700 md:border-2 animate-spin-slow">
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
          </div>
        </div>

        <div className="absolute top-2/3 right-1/4 animate-support-vehicle-2">
          <div className="w-16 md:w-20 h-6 md:h-8 bg-gray-500 border border-gray-700 md:border-2 shadow-lg">
            <div className="absolute -bottom-2 md:-bottom-3 left-2 md:left-3 w-3 md:w-4 h-3 md:h-4 border border-gray-700 md:border-2 animate-spin-slow">
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
            <div className="absolute -bottom-2 md:-bottom-3 right-2 md:right-3 w-3 md:w-4 h-3 md:h-4 border border-gray-700 md:border-2 animate-spin-slow">
              <div className="absolute inset-0 bg-gray-400 opacity-50"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Ideas/Energy Orbs - Simplified for mobile */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-4 sm:left-16 w-6 sm:w-8 h-6 sm:h-8 bg-sunset-coral border border-red-600 sm:border-2 animate-idea-float opacity-80 shadow-lg">
          <div className="absolute inset-0.5 sm:inset-1 bg-white border border-red-300 opacity-60"></div>
        </div>
        <div className="absolute top-2/3 right-6 sm:right-24 w-4 sm:w-6 h-4 sm:h-6 bg-sky-blue border border-blue-600 sm:border-2 animate-idea-float opacity-70 shadow-lg" style={{animationDelay: '1s'}}>
          <div className="absolute inset-0.5 sm:inset-1 bg-white border border-blue-300 opacity-60"></div>
        </div>
        <div className="absolute top-1/4 right-1/4 w-8 sm:w-10 h-8 sm:h-10 bg-moss-green border border-green-600 sm:border-2 animate-idea-float opacity-75 shadow-lg" style={{animationDelay: '2s'}}>
          <div className="absolute inset-1 sm:inset-2 bg-white border border-green-300 opacity-60"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/3 w-5 sm:w-7 h-5 sm:h-7 bg-lavender border border-purple-600 sm:border-2 animate-idea-float opacity-65 shadow-lg" style={{animationDelay: '3s'}}>
          <div className="absolute inset-0.5 sm:inset-1 bg-white border border-purple-300 opacity-60"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 animate-slide-up max-w-6xl mx-auto">
        {/* Main Headline - Responsive text sizes */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-pixel font-bold text-gray-800 mb-6 sm:mb-8 leading-tight uppercase tracking-wider pixel-text-shadow">
          <span className="inline-block bg-white/20 border-2 sm:border-4 border-gray-800 px-2 sm:px-4 py-1 sm:py-2 mb-2 shadow-lg">Own Ideas.</span><br />
          <span className="inline-block bg-sunset-coral/20 border-2 sm:border-4 border-red-600 px-2 sm:px-4 py-1 sm:py-2 mb-2 shadow-lg text-sunset-coral">Stake Teams.</span><br />
          <span className="inline-block bg-sky-blue/20 border-2 sm:border-4 border-blue-600 px-2 sm:px-4 py-1 sm:py-2 shadow-lg text-sky-blue">Build Worlds.</span>
        </h1>

        {/* Subtext - Responsive */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-orbitron text-gray-700 mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto leading-relaxed uppercase tracking-wide px-2">
          Where creators become heroes and ideas come to life on-chain. 
          Join the ultimate Web3 builder's paradise.
        </p>

        {/* Feature Icons - Responsive grid */}
        <div className="flex flex-col space-y-8 sm:space-y-12 lg:flex-row lg:justify-center lg:items-center lg:space-y-0 lg:space-x-12 xl:space-x-20 mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center max-w-xs mx-auto">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-sunset-coral/20 border-2 sm:border-4 border-sunset-coral flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg animate-pixel-glow">
              <Sparkles className="w-8 sm:w-10 h-8 sm:h-10 text-sunset-coral" />
            </div>
            <h3 className="font-pixel font-bold text-sm sm:text-base lg:text-lg text-gray-700 mb-2 sm:mb-3 uppercase pixel-text-shadow">Mint Ideas</h3>
            <p className="font-orbitron text-xs sm:text-sm text-gray-600 leading-relaxed uppercase">Transform concepts into NFTs and own your innovation.</p>
          </div>
          
          <div className="text-center max-w-xs mx-auto">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-sky-blue/20 border-2 sm:border-4 border-sky-blue flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg animate-pixel-glow">
              <Compass className="w-8 sm:w-10 h-8 sm:h-10 text-sky-blue" />
            </div>
            <h3 className="font-pixel font-bold text-sm sm:text-base lg:text-lg text-gray-700 mb-2 sm:mb-3 uppercase pixel-text-shadow">Build Teams</h3>
            <p className="font-orbitron text-xs sm:text-sm text-gray-600 leading-relaxed uppercase">Stake tokens and form legendary builder squads.</p>
          </div>
          
          <div className="text-center max-w-xs mx-auto">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-moss-green/20 border-2 sm:border-4 border-moss-green flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg animate-pixel-glow">
              <Zap className="w-8 sm:w-10 h-8 sm:h-10 text-moss-green" />
            </div>
            <h3 className="font-pixel font-bold text-sm sm:text-base lg:text-lg text-gray-700 mb-2 sm:mb-3 uppercase pixel-text-shadow">Track Progress</h3>
            <p className="font-orbitron text-xs sm:text-sm text-gray-600 leading-relaxed uppercase">Monitor milestones with blockchain verification.</p>
          </div>
        </div>

        {/* CTA Buttons - Responsive stacking */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center mb-12 sm:mb-16 lg:mb-20">
          <Link
            to="/create-superhero"
            className="group flex items-center justify-center space-x-2 sm:space-x-4 bg-gradient-to-r from-sunset-coral to-moss-green text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 border-2 sm:border-4 border-gray-800 font-pixel font-bold text-sm sm:text-base lg:text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 uppercase tracking-wider animate-pixel-glow w-full sm:w-auto"
          >
            <span>Start Mission</span>
            <ArrowRight className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to="/marketplace"
            className="flex items-center justify-center space-x-2 sm:space-x-4 bg-white/90 border-2 sm:border-4 border-gray-800 text-gray-700 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 font-pixel font-bold text-sm sm:text-base lg:text-lg hover:bg-white hover:shadow-lg transition-all duration-300 uppercase tracking-wider w-full sm:w-auto"
          >
            <span>Explore Ideas</span>
          </Link>
        </div>

        {/* Stats - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          <div className="text-center p-4 sm:p-6 lg:p-8 bg-white/80 border-2 sm:border-4 border-gray-800 shadow-lg animate-pixel-glow">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-pixel font-bold text-sunset-coral mb-1 sm:mb-2 uppercase pixel-text-shadow">1.2K+</div>
            <div className="text-xs sm:text-sm lg:text-base font-orbitron text-gray-600 uppercase tracking-wide">Ideas Minted</div>
          </div>
          <div className="text-center p-4 sm:p-6 lg:p-8 bg-white/80 border-2 sm:border-4 border-gray-800 shadow-lg animate-pixel-glow">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-pixel font-bold text-sky-blue mb-1 sm:mb-2 uppercase pixel-text-shadow">450+</div>
            <div className="text-xs sm:text-sm lg:text-base font-orbitron text-gray-600 uppercase tracking-wide">Active Builders</div>
          </div>
          <div className="text-center p-4 sm:p-6 lg:p-8 bg-white/80 border-2 sm:border-4 border-gray-800 shadow-lg animate-pixel-glow">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-pixel font-bold text-moss-green mb-1 sm:mb-2 uppercase pixel-text-shadow">89</div>
            <div className="text-xs sm:text-sm lg:text-base font-orbitron text-gray-600 uppercase tracking-wide">Teams Formed</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;