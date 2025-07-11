import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Wallet, Plus, User, LogOut, UserPlus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
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
  const { user, connectedWallet, disconnectWallet, builders } = useApp();

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

  const handleMintIdea = () => {
    setIsMintModalOpen(true);
  };

  // Check if user has superhero identity
  const userSuperhero = user ? builders.find(builder => builder.name === user.name) : null;

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
              <div className={`bg-sunset-coral border-2 sm:border-4 border-gray-800 flex items-center justify-center animate-pixel-glow transition-all duration-300 ${
                isScrolled && isSticky ? 'w-8 h-8' : 'w-10 h-10'
              }`}>
                <Zap className={`text-white transition-all duration-300 ${
                  isScrolled && isSticky ? 'w-4 h-4' : 'w-6 h-6'
                }`} />
              </div>
              <span className={`font-pixel font-bold text-gray-800 uppercase tracking-wider transition-all duration-300 ${
                isScrolled && isSticky ? 'text-pixel-lg sm:text-pixel-xl' : 'text-pixel-xl sm:text-pixel-2xl'
              }`}>
                IdeaMan
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
              <a 
                href="#roadmap" 
                className={`text-gray-700 hover:text-sunset-coral transition-colors font-pixel uppercase tracking-wider ${
                  isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-sm'
                }`}
              >
                Roadmap
              </a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {user ? (
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
                        {typeof user.avatar === 'string' && user.avatar.startsWith('data:') ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          user.avatar
                        )}
                      </div>
                      <div className="text-left hidden lg:block">
                        <div className={`font-pixel font-bold text-gray-800 uppercase tracking-wider ${
                          isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-xs'
                        }`}>
                          {user.name}
                        </div>
                        <div className={`font-orbitron text-gray-600 uppercase tracking-wide ${
                          isScrolled && isSticky ? 'text-pixel-xs' : 'text-pixel-xs'
                        }`}>
                          {userSuperhero ? '✅ Superhero' : '⚠️ No Identity'}
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
                              {typeof user.avatar === 'string' && user.avatar.startsWith('data:') ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                user.avatar
                              )}
                            </div>
                            <div>
                              <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">{user.name}</div>
                              <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">{user.username}</div>
                            </div>
                          </div>
                          
                          {/* Identity Status */}
                          {userSuperhero ? (
                            <div className="p-2 bg-green-100 border border-green-400 mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-600 border border-green-800"></div>
                                <span className="font-pixel text-pixel-xs text-green-800 uppercase tracking-wider">
                                  Superhero Identity Active
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 bg-yellow-100 border border-yellow-400 mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-600 border border-yellow-800"></div>
                                <span className="font-pixel text-pixel-xs text-yellow-800 uppercase tracking-wider">
                                  No Superhero Identity
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="p-2 bg-blue-100 border border-blue-400">
                              <div className="font-pixel font-bold text-pixel-sm text-blue-600">L{user.level}</div>
                              <div className="font-orbitron text-pixel-xs text-gray-600 uppercase">Level</div>
                            </div>
                            <div className="p-2 bg-yellow-100 border border-yellow-400">
                              <div className="font-pixel font-bold text-pixel-sm text-yellow-600">{user.reputation}</div>
                              <div className="font-orbitron text-pixel-xs text-gray-600 uppercase">Rep</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 space-y-2">
                          {userSuperhero ? (
                            <Link
                              to={`/profile/${userSuperhero.id}`}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-blue-100 border border-blue-400 font-pixel text-pixel-xs text-blue-600 uppercase tracking-wider"
                            >
                              <User className="w-4 h-4" />
                              <span>VIEW PROFILE</span>
                            </Link>
                          ) : (
                            <Link
                              to="/create-superhero"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-green-100 border border-green-400 font-pixel text-pixel-xs text-green-600 uppercase tracking-wider"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>CREATE IDENTITY</span>
                            </Link>
                          )}
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
                
                {user ? (
                  <div className="space-y-3 pt-4 border-t-2 border-gray-600">
                    <button
                      onClick={handleMintIdea}
                      className="flex items-center space-x-2 bg-moss-green text-white px-4 py-2 border-2 border-green-700 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                    >
                      <Plus className="w-4 h-4" />
                      <span>MINT IDEA</span>
                    </button>
                    
                    {userSuperhero ? (
                      <Link
                        to={`/profile/${userSuperhero.id}`}
                        className="flex items-center space-x-2 bg-sky-blue text-white px-4 py-2 border-2 border-blue-700 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>VIEW PROFILE</span>
                      </Link>
                    ) : (
                      <Link
                        to="/create-superhero"
                        className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 border-2 border-yellow-700 font-pixel text-pixel-sm font-bold w-fit uppercase tracking-wider"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>CREATE IDENTITY</span>
                      </Link>
                    )}
                    
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