import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Wallet, Plus, User, LogOut, UserPlus, ShoppingBag } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import WalletModal from './WalletModal';
import MintIdeaModal from './MintIdeaModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();
  const { isConnected, address, disconnectWallet, hasSuperheroIdentity, superheroName, isCheckingSuperhero, refreshWalletState } = useWallet();
  
  // Debug: Log initial state and changes
  React.useEffect(() => {
    
  }, []);
  
  React.useEffect(() => {
    
  }, [isConnected, address, hasSuperheroIdentity, superheroName]);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight * 0.6; // After 60% of viewport height
      
      setIsScrolled(scrollPosition > 50);
      setIsSticky(scrollPosition > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleConnectWallet = () => {
    
    setIsWalletModalOpen(true);
    
  };

  const handleRefreshWallet = async () => {
    
    
    // First, let's see what MetaMask reports right now
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_accounts' });
        await window.ethereum.request({ method: 'eth_chainId' });
        
        
        
        
      } catch (error) {
        // Handle error silently
      }
    }
    
    await refreshWalletState();
  };

  const handleMintIdea = () => {
    setIsMintModalOpen(true);
  };

  // Note: Superhero identity checking can be added later via blockchain queries

  return (
    <>
      <header className={`relative z-50 transition-all duration-300 ${
        isSticky 
          ? 'fixed top-0 left-0 right-0 backdrop-blur-lg bg-white/20 border-b-2 border-gray-600 shadow-xl' 
          : 'backdrop-blur-md bg-white/10 border-b-4 border-gray-800'
      } ${isScrolled && isSticky ? 'py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo - Compact when sticky */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              
                <img 
                  src="/logoVerse.png" 
                  alt="IdeaVerse Logo" 
                  className={`transition-all duration-300 object-contain ${
                    isScrolled && isSticky ? 'w-6 h-6' : 'w-12 h-12'
                  }`}
                />
              <span className={`font-pixel font-bold text-gray-800 uppercase tracking-wider transition-all duration-300 ${
                isScrolled && isSticky ? 'text-pixel-lg sm:text-pixel-xl' : 'text-pixel-xl sm:text-pixel-2xl'
              }`}>
                IdeaVerse
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <Link 
                to="/" 
                className={`transition-colors font-pixel uppercase tracking-wider ${
                  isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-sm'
                } ${
                  isActive('/') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/marketplace" 
                className={`transition-colors font-pixel uppercase tracking-wider ${
                  isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-sm'
                } ${
                  isActive('/marketplace') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                }`}
              >
                Marketplace
              </Link>
              <Link 
                to="/builders" 
                className={`transition-colors font-pixel uppercase tracking-wider ${
                  isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-sm'
                } ${
                  isActive('/builders') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                }`}
              >
                Builders
              </Link>
              <Link 
                to="/teams" 
                className={`transition-colors font-pixel uppercase tracking-wider ${
                  isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-sm'
                } ${
                  isActive('/teams') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                }`}
              >
                Teams
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {isConnected ? (
                <>
                  {/* Mint Button - Compact when sticky */}
                  <button
                    onClick={handleMintIdea}
                    className={`flex items-center space-x-1 sm:space-x-2 bg-moss-green text-white border-2 border-green-700 font-pixel font-bold hover:bg-green-600 transition-all duration-200 uppercase tracking-wider ${
                      isScrolled && isSticky 
                        ? 'px-2 py-1 text-pixel-xs' 
                        : 'px-4 py-2 text-pixel-sm'
                    }`}
                  >
                    <Plus className={`${isScrolled && isSticky ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    <span>MINT</span>
                  </button>


                  {/* User Menu - Compact when sticky */}
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center space-x-2 sm:space-x-3 bg-white/20 border-2 border-gray-600 hover:bg-white/30 transition-colors ${
                        isScrolled && isSticky ? 'px-2 py-1' : 'px-4 py-2'
                      }`}
                    >
                      <div className={`bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                        isScrolled && isSticky ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
                      }`}>
                        🦸‍♂️
                      </div>
                      <div className="text-left hidden lg:block">
                        <div className={`font-pixel font-bold text-gray-800 uppercase tracking-wider ${
                          isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-xs'
                        }`}>
                          {isCheckingSuperhero ? 'Checking...' : (hasSuperheroIdentity && superheroName ? superheroName : (address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Connected'))}
                        </div>
                        <div className={`font-orbitron text-gray-600 uppercase tracking-wide ${
                          isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-xs'
                        }`}>
                          {isCheckingSuperhero ? '🔍 Verifying...' : (hasSuperheroIdentity ? '🦸‍♂️ Superhero' : '🔗 Wallet Connected')}
                        </div>
                      </div>
                    </button>

                    {/* User Dropdown - Adjusted positioning for sticky */}
                    {isUserMenuOpen && (
                      <div className={`absolute right-0 mt-2 w-64 bg-white/95 border-4 border-gray-800 shadow-2xl z-50 ${
                        isSticky ? 'top-full' : 'top-full'
                      }`}>
                        <div className="p-4 border-b-2 border-gray-600">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center text-lg overflow-hidden">
                              🦸‍♂️
                            </div>
                            <div>
                              <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">
                                {isCheckingSuperhero ? 'Checking...' : (hasSuperheroIdentity && superheroName ? superheroName : (address ? `${address.slice(0,8)}...${address.slice(-6)}` : 'Connected'))}
                              </div>
                              <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">
                                {isCheckingSuperhero ? '🔍 Verifying...' : (hasSuperheroIdentity ? '🦸‍♂️ Superhero' : '🔗 Wallet Connected')}
                              </div>
                            </div>
                          </div>
                          
                          {/* Identity Status */}
                          <div className={`p-2 border mb-3 ${
                            isCheckingSuperhero ? 'bg-yellow-100 border-yellow-400' : (hasSuperheroIdentity ? 'bg-green-100 border-green-400' : 'bg-blue-100 border-blue-400')
                          }`}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 border ${
                                isCheckingSuperhero ? 'bg-yellow-600 border-yellow-800 animate-pulse' : (hasSuperheroIdentity ? 'bg-green-600 border-green-800' : 'bg-blue-600 border-blue-800')
                              }`}></div>
                              <span className={`font-pixel text-pixel-xs uppercase tracking-wider ${
                                isCheckingSuperhero ? 'text-yellow-800' : (hasSuperheroIdentity ? 'text-green-800' : 'text-blue-800')
                              }`}>
                                {isCheckingSuperhero ? 'Checking Identity...' : (hasSuperheroIdentity ? 'Superhero Identity' : 'Wallet Connected')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 space-y-2">
                          {!isCheckingSuperhero && !hasSuperheroIdentity && (
                            <Link
                              to="/create-superhero"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-green-100 border border-green-400 font-pixel text-pixel-xs text-green-600 uppercase tracking-wider"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>CREATE IDENTITY</span>
                            </Link>
                          )}
                          {!isCheckingSuperhero && hasSuperheroIdentity && (
                            <Link
                              to="/profile/me"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-purple-100 border border-purple-400 font-pixel text-pixel-xs text-purple-600 uppercase tracking-wider"
                            >
                              <User className="w-4 h-4" />
                              <span>VIEW PROFILE</span>
                            </Link>
                          )}
                          {isCheckingSuperhero && (
                            <div className="w-full flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-400 font-pixel text-pixel-xs text-yellow-600 uppercase tracking-wider opacity-75">
                              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent animate-spin rounded-full"></div>
                              <span>CHECKING IDENTITY...</span>
                            </div>
                          )}
                          
                          {/* My Purchases Link */}
                          <Link
                            to="/my-purchases"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-orange-100 border border-orange-400 font-pixel text-pixel-xs text-orange-600 uppercase tracking-wider"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>MY PURCHASES</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              refreshWalletState();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-blue-100 border border-blue-400 font-pixel text-pixel-xs text-blue-600 uppercase tracking-wider"
                          >
                            <User className="w-4 h-4" />
                            <span>REFRESH WALLET</span>
                          </button>
                          <button
                            onClick={() => {
                              disconnectWallet();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-100 border border-red-400 font-pixel text-pixel-xs text-red-600 uppercase tracking-wider"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>DISCONNECT</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <Link
                    to="/create-superhero"
                    className={`flex items-center space-x-1 sm:space-x-2 bg-moss-green text-white border-2 border-green-700 font-pixel font-bold hover:bg-green-600 transition-all duration-200 uppercase tracking-wider ${
                      isScrolled && isSticky 
                        ? 'px-2 py-1 text-pixel-xs' 
                        : 'px-4 py-2 text-pixel-sm'
                    }`}
                  >
                    <UserPlus className={`${isScrolled && isSticky ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    <span>JOIN</span>
                  </Link>
                  <button
                    onClick={handleConnectWallet}
                    className={`flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-sunset-coral to-sky-blue text-white border-2 sm:border-4 border-gray-800 font-pixel font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200 uppercase tracking-wider animate-pixel-glow ${
                      isScrolled && isSticky 
                        ? 'px-3 py-2 text-pixel-xs' 
                        : 'px-6 py-3 text-pixel-sm'
                    }`}
                  >
                    <Wallet className={`${isScrolled && isSticky ? 'w-3 h-3' : 'w-4 h-4'}`} />
                    <span>Connect</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 border-2 border-gray-800 bg-white/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t-4 border-gray-800">
              <nav className="flex flex-col space-y-4 pt-4">
                <Link 
                  to="/" 
                  className={`transition-colors font-pixel text-pixel-sm uppercase tracking-wider ${
                    isActive('/') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/marketplace" 
                  className={`transition-colors font-pixel text-pixel-sm uppercase tracking-wider ${
                    isActive('/marketplace') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link 
                  to="/builders" 
                  className={`transition-colors font-pixel text-pixel-sm uppercase tracking-wider ${
                    isActive('/builders') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Builders
                </Link>
                <Link 
                  to="/teams" 
                  className={`transition-colors font-pixel text-pixel-sm uppercase tracking-wider ${
                    isActive('/teams') ? 'text-sunset-coral font-bold' : 'text-gray-700 hover:text-sunset-coral'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Teams
                </Link>
                <a href="#roadmap" className="text-gray-700 hover:text-sunset-coral transition-colors font-pixel text-pixel-sm uppercase tracking-wider">Roadmap</a>
                
                {isConnected ? (
                  <div className="space-y-3 pt-4 border-t-2 border-gray-600">
                    <button
                      onClick={handleMintIdea}
                      className="flex items-center space-x-2 bg-moss-green text-white px-4 py-2 border-2 border-green-700 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>MINT IDEA</span>
                    </button>
                    
                    <Link
                      to="/create-superhero"
                      className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 border-2 border-yellow-700 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>CREATE IDENTITY</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 border-2 border-red-700 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>DISCONNECT</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t-2 border-gray-600">
                    <Link
                      to="/create-superhero"
                      className="flex items-center space-x-2 bg-moss-green text-white px-4 py-2 border-2 border-green-700 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>JOIN COMMUNITY</span>
                    </Link>
                    <button
                      onClick={handleConnectWallet}
                      className="flex items-center space-x-2 bg-gradient-to-r from-sunset-coral to-sky-blue text-white px-6 py-3 border-4 border-gray-800 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Spacer to prevent content jump when header becomes fixed */}
      {isSticky && (
        <div className={`transition-all duration-300 ${
          isScrolled ? 'h-16' : 'h-20'
        }`}></div>
      )}

      {/* Modals */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <MintIdeaModal isOpen={isMintModalOpen} onClose={() => setIsMintModalOpen(false)} />
    </>
  );
};

export default Header;