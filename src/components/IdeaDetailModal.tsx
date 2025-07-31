import React, { useState } from 'react';
import { X, Heart, Eye, DollarSign, Lock, Unlock, Star, User, Calendar, FileText } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import IdeaContentModal from './IdeaContentModal';

interface Idea {
  id: number;
  backendId?: number;
  title: string;
  description: string;
  creator: string;
  avatar: string;
  price: string;
  likes: number;
  views: number;
  isLocked: boolean;
  category: string;
  tags: string[];
  categories: string[];
  createdAt: string;
  featured: boolean;
  pixelColor: string;
  isLiked?: boolean;
  isOwned?: boolean;
  attachments?: string[];
}

interface IdeaDetailModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
}

const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({ idea, isOpen, onClose }) => {
  const { likeIdea, purchaseIdea } = useApp();
  const { isConnected, address } = useWallet();
  const { showSuccess, showError, showInfo } = useToast();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  if (!isOpen || !idea) return null;

  // Debug logging

  const handleLike = () => {
    likeIdea(idea.id);
  };

  const handlePurchase = async () => {
    if (isConnected && address) {
      // Show info toast when purchase starts
      showInfo('Processing Purchase', 'Checking wallet balance and initiating purchase...');
      
      try {
        await purchaseIdea(idea.id);
        // If we get here without error, show success toast
        showSuccess(
          'Purchase Successful!', 
          `You now own "${idea.title}"! Check "My Purchases" to access the content.`
        );
      } catch (error) {
        // Show error toast for any purchase failures
        const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
        showError('Purchase Failed', errorMessage);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r ${idea.pixelColor}`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 border-2 border-white flex items-center justify-center text-2xl overflow-hidden">
              {typeof idea.avatar === 'string' && idea.avatar.startsWith('data:') ? (
                <img src={idea.avatar} alt="Creator avatar" className="w-full h-full object-cover" />
              ) : (
                idea.avatar
              )}
            </div>
            <div>
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                {idea.title}
              </h2>
              <p className="font-orbitron text-pixel-sm text-white/80 uppercase tracking-wide">
                by {idea.creator}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider">
                  Description
                </h3>
                <div className="bg-gray-50 border-2 border-gray-300 p-4">
                  <p className="font-orbitron text-pixel-sm text-gray-600 leading-relaxed uppercase tracking-wide">
                    {idea.description}
                  </p>
                </div>
              </div>

              {/* Attachments - Only show if they exist */}
              {idea.attachments && idea.attachments.length > 0 && (
                <div>
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Attachments
                  </h3>
                  <div className="space-y-2">
                    {idea.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-3 bg-gray-100 border border-gray-400"
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="font-orbitron text-pixel-sm text-gray-700 uppercase tracking-wide">
                          {attachment}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creator Info */}
              <div>
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-3 uppercase tracking-wider flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Creator
                </h3>
                <div className="flex items-center space-x-4 p-4 bg-gray-100 border-2 border-gray-400">
                  <div className="w-16 h-16 bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center text-2xl overflow-hidden">
                    {typeof idea.avatar === 'string' && idea.avatar.startsWith('data:') ? (
                      <img src={idea.avatar} alt="Creator avatar" className="w-full h-full object-cover" />
                    ) : (
                      idea.avatar
                    )}
                  </div>
                  <div>
                    <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">{idea.creator}</div>
                    <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Verified Creator</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="font-pixel text-pixel-xs text-gray-600 uppercase tracking-wider">4.8 Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price */}
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center space-x-2 font-pixel font-bold text-pixel-2xl text-gray-800 mb-3 uppercase tracking-wider">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                    <span>{idea.price}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {idea.isOwned || idea.isSold ? (
                    <div className="space-y-2">
                      <button 
                        onClick={() => setIsContentModalOpen(true)}
                        className="w-full bg-blue-600 text-white py-3 border-2 border-blue-800 font-pixel font-bold text-pixel-sm hover:bg-blue-700 transition-all duration-200 uppercase tracking-wider flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>VIEW CONTENT</span>
                      </button>
                      <div className="text-center">
                        <span className="inline-block bg-green-600 text-white px-3 py-1 border border-green-800 font-pixel text-pixel-xs uppercase tracking-wider">
                          ✅ OWNED
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={!isConnected}
                      className="w-full bg-moss-green text-white py-3 border-2 border-green-700 font-pixel font-bold text-pixel-sm hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {isConnected ? 'PURCHASE IDEA' : 'CONNECT WALLET'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleLike}
                    className={`w-full flex items-center justify-center space-x-2 py-3 border-2 font-pixel font-bold text-pixel-sm transition-all duration-200 uppercase tracking-wider ${
                      idea.isLiked 
                        ? 'bg-red-500 text-white border-red-700' 
                        : 'bg-white text-gray-700 border-gray-400 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${idea.isLiked ? 'fill-current' : ''}`} />
                    <span>{idea.isLiked ? 'LIKED' : 'LIKE'}</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">Likes</span>
                    </div>
                    <span className="font-pixel font-bold text-pixel-sm text-gray-800">{idea.likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">Views</span>
                    </div>
                    <span className="font-pixel font-bold text-pixel-sm text-gray-800">{idea.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">Created</span>
                    </div>
                    <span className="font-pixel font-bold text-pixel-sm text-gray-800">{idea.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {idea.isLocked ? (
                        <Lock className="w-4 h-4 text-red-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-green-500" />
                      )}
                      <span className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">Status</span>
                    </div>
                    <span className="font-pixel font-bold text-pixel-sm text-gray-800">
                      {idea.isLocked ? 'LOCKED' : 'OPEN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Info */}
              <div className="bg-gray-50 border-2 border-gray-400 p-4">
                <h3 className="font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
                  Category
                </h3>
                <span className="inline-block px-3 py-2 bg-sunset-coral/20 border-2 border-sunset-coral font-pixel text-pixel-sm font-medium text-gray-700 uppercase tracking-wider shadow-lg">
                  {idea.category}
                </span>
                
                {/* Show additional categories only if there are more than 1 */}
                {idea.categories && idea.categories.length > 1 && (
                  <div className="mt-3">
                    <p className="font-orbitron text-pixel-xs text-gray-600 mb-2 uppercase tracking-wide">
                      Additional Categories:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {idea.categories.filter(cat => cat !== idea.category).map((category, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-moss-green/20 border border-moss-green font-pixel text-pixel-xs font-medium text-gray-700 uppercase tracking-wider"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Modal */}
      {idea && (
        <IdeaContentModal
          ideaId={idea.backendId || idea.id}
          ideaTitle={idea.title}
          isOpen={isContentModalOpen}
          onClose={() => setIsContentModalOpen(false)}
        />
      )}
    </div>
  );
};

export default IdeaDetailModal;