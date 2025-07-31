import React, { useState, useEffect } from 'react';
import { X, Lock, FileText, Download, Eye } from 'lucide-react';
import { ApiService } from '../services/api';
import { useWallet } from '../contexts/WalletContext';

interface IdeaContentModalProps {
  ideaId: number;
  ideaTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const IdeaContentModal: React.FC<IdeaContentModalProps> = ({ ideaId, ideaTitle, isOpen, onClose }) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useWallet();

  useEffect(() => {
    if (isOpen && ideaId && address) {
      loadContent();
    }
  }, [isOpen, ideaId, address]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getIdeaContent(ideaId, address!);
      
      if (response.success) {
        setContent(response.data);
        
      } else {
        setError(response.error?.message || 'Failed to load content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-green-400 to-emerald-500">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 border-2 border-white flex items-center justify-center text-2xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                PURCHASED CONTENT
              </h2>
              <p className="font-orbitron text-pixel-sm text-white/80 uppercase tracking-wide">
                {ideaTitle}
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
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="font-orbitron text-gray-600 uppercase tracking-wide">Loading Content...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-300 p-4 mb-4">
              <div className="flex items-center space-x-2">
                <X className="w-5 h-5 text-red-500" />
                <span className="font-pixel text-red-700 font-bold uppercase tracking-wider">Error</span>
              </div>
              <p className="font-orbitron text-red-600 mt-2 uppercase tracking-wide">{error}</p>
            </div>
          )}

          {content && (
            <div className="space-y-6">
              {/* Decryption Info */}
              <div className="bg-green-50 border-2 border-green-300 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <span className="font-pixel text-green-700 font-bold uppercase tracking-wider">Content Unlocked</span>
                </div>
                <p className="font-orbitron text-green-600 text-pixel-sm uppercase tracking-wide">
                  {content.encrypted ? 'Content was encrypted and has been decrypted for you' : 'Content access granted'}
                </p>
                {content.decryptedFor && (
                  <p className="font-orbitron text-green-500 text-pixel-xs uppercase tracking-wide mt-1">
                    Decrypted for: {content.decryptedFor}
                  </p>
                )}
              </div>

              {/* Main Content */}
              <div className="bg-gray-50 border-2 border-gray-300 p-6">
                <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-4 uppercase tracking-wider flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Full Idea Content
                </h3>
                
                {content.content && (
                  <div className="space-y-4">
                    {/* Description */}
                    {content.content.description && (
                      <div>
                        <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">Description</h4>
                        <div className="bg-white border border-gray-300 p-4">
                          <p className="font-orbitron text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {content.content.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Full Content */}
                    {content.content.fullContent && (
                      <div>
                        <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">Full Content</h4>
                        <div className="bg-white border border-gray-300 p-4">
                          <div className="font-orbitron text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {content.content.fullContent}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {content.content.attachments && content.content.attachments.length > 0 && (
                      <div>
                        <h4 className="font-pixel font-bold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wider">Attachments</h4>
                        <div className="space-y-2">
                          {content.content.attachments.map((attachment: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-white border border-gray-300">
                              <Download className="w-4 h-4 text-gray-600" />
                              <span className="font-orbitron text-gray-700">{attachment.name || `Attachment ${index + 1}`}</span>
                              {attachment.url && (
                                <a 
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 font-pixel text-pixel-xs uppercase"
                                >
                                  Download
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Data (for debugging) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-6 pt-4 border-t border-gray-300">
                    <h4 className="font-pixel font-bold text-pixel-xs text-gray-500 mb-2 uppercase tracking-wider">Access Content in IPFS :</h4>
                    <pre className="bg-gray-100 p-2 text-xs overflow-auto max-h-40">
                      {JSON.stringify(content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="bg-green-600 text-white px-6 py-3 border-2 border-green-800 font-pixel font-bold text-pixel-sm hover:bg-green-700 transition-colors uppercase tracking-wider"
                >
                  Close Content
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaContentModal;