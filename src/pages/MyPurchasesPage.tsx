import React, { useState, useEffect } from 'react';
import { Eye, Download, Calendar, DollarSign, User, ShoppingBag, BookOpen, Lock, Star } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useApp } from '../contexts/AppContext';
import { ApiService } from '../services/api';
import IdeaContentModal from '../components/IdeaContentModal';
import BuilderRatingModal from '../components/BuilderRatingModal';

interface PurchasedIdea {
  id: number;
  backendId: number;
  title: string;
  description: string;
  creator: string;
  creatorName?: string;
  creatorAvatar?: string;
  creatorBio?: string;
  creatorSpecialties?: string[];
  creatorSkills?: string[];
  price: string;
  purchasedAt: string;
  transactionHash?: string;
  categories: string[];
  ipfsHash: string;
}

const MyPurchasesPage: React.FC = () => {
  const [purchasedIdeas, setPurchasedIdeas] = useState<PurchasedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<PurchasedIdea | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [ratingModalIdea, setRatingModalIdea] = useState<PurchasedIdea | null>(null);
  const { isConnected, address } = useWallet();
  const { user } = useApp();

  useEffect(() => {
    if (isConnected && address) {
      loadPurchasedIdeas();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadPurchasedIdeas = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First try to get purchase history from blockchain events
      const purchaseHistoryResponse = await ApiService.getPurchasedIdeas(address);
      
      let purchasedIdeas: PurchasedIdea[] = [];
      
      if (purchaseHistoryResponse.success && purchaseHistoryResponse.data.length > 0) {
        // Process blockchain purchase history
        
        for (const idea of purchaseHistoryResponse.data) {
          try {
            // Try to fetch real superhero identity for the creator
            let realCreatorName = idea.creatorName || idea.creator;
            try {
              const superheroResponse = await ApiService.getSuperheroByAddress(idea.creator);
              
              if (superheroResponse.success && superheroResponse.data && superheroResponse.data.name) {
                realCreatorName = superheroResponse.data.name;
              } else {
                // Use a clean fallback instead of wallet address
                realCreatorName = 'Anonymous Superhero';
              }
            } catch (superheroError) {
              realCreatorName = 'Anonymous Superhero';
            }
            
            purchasedIdeas.push({
              id: parseInt(idea.ideaId),
              backendId: parseInt(idea.ideaId),
              title: idea.title,
              description: idea.description || 'No description',
              creator: idea.creator,
              creatorName: realCreatorName,
              price: `${idea.purchaseInfo.price} USDC`,
              purchasedAt: new Date(idea.purchaseInfo.timestamp).toLocaleDateString(),
              categories: idea.categories || ['General'],
              ipfsHash: idea.ipfsHash
            });
            
          } catch (err) {
            // Failed to process purchased idea
          }
        }
      } else {
        // Fallback: Check ownership for all ideas (previous logic)
        
        const allIdeasResponse = await ApiService.getIdeas(1, 100, false);
        if (allIdeasResponse.success) {
          
          for (const idea of allIdeasResponse.data) {
            try {
              const ownershipResponse = await ApiService.getIdeaOwnership(parseInt(idea.ideaId), address);
              
              if (ownershipResponse.success && ownershipResponse.data?.isOwner) {
                const isCreatedByUser = idea.creator.toLowerCase() === address.toLowerCase();
                
                if (!isCreatedByUser) {
                  // Try to fetch real superhero identity for the creator
                  let realCreatorName = idea.creatorName || idea.creator;
                  try {
                    const superheroResponse = await ApiService.getSuperheroByAddress(idea.creator);
                    
                    if (superheroResponse.success && superheroResponse.data && superheroResponse.data.name) {
                      realCreatorName = superheroResponse.data.name;
                    } else {
                      realCreatorName = 'Anonymous Superhero';
                    }
                  } catch (superheroError) {
                    realCreatorName = 'Anonymous Superhero';
                  }
                  
                  purchasedIdeas.push({
                    id: parseInt(idea.ideaId),
                    backendId: parseInt(idea.ideaId),
                    title: idea.title,
                    description: idea.description || 'No description',
                    creator: idea.creator,
                    creatorName: realCreatorName,
                    price: `${idea.price} USDC`,
                    purchasedAt: new Date().toLocaleDateString(),
                    categories: idea.categories || ['General'],
                    ipfsHash: idea.ipfsHash
                  });
                }
              }
              
            } catch (err) {
              // Failed to check ownership for idea
            }
          }
        }
      }
      
      setPurchasedIdeas(purchasedIdeas);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchased ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewContent = (idea: PurchasedIdea) => {
    setSelectedIdea(idea);
    setIsContentModalOpen(true);
  };

  const handleRateCreator = async (idea: PurchasedIdea) => {
    // First, try to fetch real superhero identity from backend
    try {
      const superheroResponse = await ApiService.getSuperheroByAddress(idea.creator);
      
      if (superheroResponse.success && superheroResponse.data) {
        
        // Use REAL superhero data from backend
        const enhancedIdea = {
          ...idea,
          creatorName: superheroResponse.data.name || 'Anonymous Superhero',
          creatorAvatar: superheroResponse.data.avatarUrl,
          creatorBio: superheroResponse.data.bio || `Creator of "${idea.title}"`,
          creatorSpecialties: superheroResponse.data.specialties || idea.categories || ['Innovation'],
          creatorSkills: superheroResponse.data.skills || idea.categories || ['Creativity']
        };
        
        setRatingModalIdea(enhancedIdea);
        return;
      }
    } catch (error) {
      // Failed to fetch superhero identity
    }

    // Fallback: Use clean display name instead of ugly address
    const cleanName = idea.creatorName && idea.creatorName !== idea.creator 
      ? idea.creatorName 
      : 'Anonymous Superhero';
    
    const fallbackIdea = {
      ...idea,
      creatorName: cleanName,
      creatorAvatar: undefined,
      creatorBio: `Creator of "${idea.title}"`,
      creatorSpecialties: idea.categories || ['Innovation'],
      creatorSkills: idea.categories || ['Creativity']
    };
    
    setRatingModalIdea(fallbackIdea);
  };

  if (!isConnected) {
    return (
      <div className="relative z-10 min-h-screen pt-24 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center">
            <div className="pixel-card p-8">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-pixel-2xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider">
                My Purchases
              </h1>
              <p className="font-orbitron text-gray-600 mb-6 uppercase tracking-wide">
                Please connect your wallet to view your purchased ideas
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative z-10 min-h-screen pt-24 pb-12 bg-dreamy-gradient">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-pixel-3xl md:text-pixel-4xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
              <span className="inline-block bg-white/20 border-4 border-gray-800 px-4 py-2 mb-2 shadow-lg">My</span>{' '}
              <span className="inline-block bg-green-400/20 border-4 border-green-600 px-4 py-2 shadow-lg text-green-600">Purchases</span>
            </h1>
            <p className="text-pixel-sm font-orbitron text-gray-600 uppercase tracking-wide">
              Access your purchased ideas and rate their creators
            </p>
          </div>

          {/* Wallet Info */}
          <div className="pixel-card mb-6">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-pixel text-pixel-sm text-gray-800 uppercase tracking-wider">Connected Wallet</p>
                  <p className="font-orbitron text-pixel-xs text-gray-600 font-mono">{address}</p>
                </div>
              </div>
              <button
                onClick={loadPurchasedIdeas}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-800 font-pixel font-bold text-pixel-xs hover:bg-blue-700 transition-colors disabled:opacity-50 uppercase tracking-wider"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="font-orbitron text-gray-600 uppercase tracking-wide">Loading your purchases...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="pixel-card mb-6">
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="font-pixel text-red-700 font-bold uppercase tracking-wider">Error</p>
                <p className="font-orbitron text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && purchasedIdeas.length === 0 && (
            <div className="text-center py-12">
              <div className="pixel-card p-8">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-pixel-xl font-pixel font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  No Purchases Yet
                </h2>
                <p className="font-orbitron text-gray-600 mb-6 uppercase tracking-wide">
                  You haven't purchased any ideas yet. Visit the marketplace to explore!
                </p>
                <a
                  href="/marketplace"
                  className="inline-block px-6 py-3 bg-green-600 text-white border-2 border-green-800 font-pixel font-bold text-pixel-sm hover:bg-green-700 transition-colors uppercase tracking-wider"
                >
                  Browse Marketplace
                </a>
              </div>
            </div>
          )}

          {/* Purchased Ideas Grid */}
          {!loading && purchasedIdeas.length > 0 && (
            <>
              <div className="mb-6">
                <p className="font-pixel text-pixel-sm text-gray-700 uppercase tracking-wider">
                  Found {purchasedIdeas.length} purchased idea{purchasedIdeas.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedIdeas.map((idea) => (
                  <div key={idea.id} className="pixel-card hover:scale-105 transition-transform duration-200">
                    <div className="p-4">
                      {/* Owned Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-block bg-green-600 text-white px-3 py-1 border border-green-800 font-pixel text-pixel-xs font-bold uppercase tracking-wider">
                          ✅ OWNED
                        </span>
                        <div className="text-right">
                          <p className="font-pixel text-pixel-xs text-gray-600 uppercase tracking-wider">Price Paid</p>
                          <p className="font-pixel text-pixel-sm text-gray-800 font-bold">{idea.price}</p>
                        </div>
                      </div>

                      {/* Title and Description */}
                      <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-2 uppercase tracking-wider line-clamp-1">
                        {idea.title}
                      </h3>
                      <p className="font-orbitron text-pixel-sm text-gray-600 mb-4 line-clamp-2 uppercase tracking-wide">
                        {idea.description}
                      </p>

                      {/* Creator Info */}
                      <div className="flex items-center space-x-2 mb-4">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">
                          by {idea.creatorName && idea.creatorName !== idea.creator ? idea.creatorName : 'Anonymous Superhero'}
                        </span>
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {idea.categories.slice(0, 2).map((category, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 border border-blue-300 font-pixel text-pixel-xs text-blue-700 uppercase tracking-wider"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleViewContent(idea)}
                          className="w-full bg-blue-600 text-white py-3 border-2 border-blue-800 font-pixel font-bold text-pixel-sm hover:bg-blue-700 transition-colors uppercase tracking-wider flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Full Content</span>
                        </button>
                        
                        <button
                          onClick={() => handleRateCreator(idea)}
                          disabled={!user && !isConnected}
                          className={`w-full py-3 border-2 font-pixel font-bold text-pixel-sm transition-colors uppercase tracking-wider flex items-center justify-center space-x-2 ${
                            user || isConnected
                              ? 'bg-yellow-500 text-white border-yellow-700 hover:bg-yellow-600' 
                              : 'bg-gray-400 text-gray-200 border-gray-600 cursor-not-allowed'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                          <span>{user || isConnected ? 'Rate Creator' : 'Connect Wallet'}</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center">
                            <p className="font-pixel text-pixel-xs text-gray-600 uppercase tracking-wider">Purchased</p>
                            <p className="font-orbitron text-pixel-xs text-gray-500">{idea.purchasedAt}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-pixel text-pixel-xs text-gray-600 uppercase tracking-wider">Status</p>
                            <div className="flex items-center justify-center space-x-1">
                              <Lock className="w-3 h-3 text-green-500" />
                              <span className="font-pixel text-pixel-xs text-green-600 uppercase tracking-wider">Unlocked</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Modal */}
      {selectedIdea && (
        <IdeaContentModal
          ideaId={selectedIdea.backendId}
          ideaTitle={selectedIdea.title}
          isOpen={isContentModalOpen}
          onClose={() => {
            setIsContentModalOpen(false);
            setSelectedIdea(null);
          }}
        />
      )}

      {/* Rating Modal */}
      {ratingModalIdea && (
        <BuilderRatingModal
          builder={{
            id: ratingModalIdea.backendId,
            name: ratingModalIdea.creatorName || 'Anonymous Superhero',
            username: ratingModalIdea.creatorName 
              ? `@${ratingModalIdea.creatorName.toLowerCase().replace(/\s+/g, '')}`
              : `@${ratingModalIdea.creator.slice(0, 6)}...${ratingModalIdea.creator.slice(-4)}`,
            avatar: '🦸‍♂️',
            avatarUrl: ratingModalIdea.creatorAvatar,
            address: ratingModalIdea.creator,
            level: 1,
            reputation: 0,
            specialties: ratingModalIdea.creatorSpecialties || ratingModalIdea.categories || ['General'],
            achievements: [],
            teamsFormed: 0,
            ideasMinted: 1,
            bgGradient: 'from-blue-400 to-purple-500',
            location: 'IdeaVerse',
            joinedDate: new Date().toLocaleDateString(),
            bio: ratingModalIdea.creatorBio || `Creator of "${ratingModalIdea.title}"`,
            skills: ratingModalIdea.creatorSkills || ratingModalIdea.categories || ['General'],
            currentProjects: 1,
            followers: 0,
            following: 0,
            isOnline: false,
            featured: false,
            pixelColor: 'from-yellow-400 to-orange-500',
            rating: 0,
            totalRatings: 0
          }}
          ideaId={ratingModalIdea.backendId}
          isOpen={!!ratingModalIdea}
          onClose={() => {
            setRatingModalIdea(null);
          }}
        />
      )}
    </>
  );
};

export default MyPurchasesPage;