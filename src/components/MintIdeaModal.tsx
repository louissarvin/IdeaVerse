import React, { useState } from 'react';
import { X, Sparkles, Upload, UserPlus, AlertCircle, Loader, CheckCircle, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useApp } from '../contexts/AppContext';
import { ApiService } from '../services/api';
import { contractService, ContractService } from '../services/contracts';

interface MintIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['DeFi', 'Gaming', 'Sustainability', 'Education', 'Art', 'Metaverse'];

const MintIdeaModal: React.FC<MintIdeaModalProps> = ({ isOpen, onClose }) => {
  const { isConnected, address, hasSuperheroIdentity } = useWallet();
  const { refreshIdeas } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [] as string[],
    price: '',
    attachments: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (!isOpen) return null;

  // Use real superhero identity check from WalletContext

  // If user doesn't have wallet connected
  if (!isConnected || !address) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 border-4 border-gray-800 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-red-500 to-orange-500">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-white" />
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                Wallet Required
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 border-4 border-red-400 flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-3 uppercase tracking-wider pixel-text-shadow">
              Connect Wallet First
            </h3>
            <p className="font-orbitron text-pixel-sm text-gray-600 mb-6 uppercase tracking-wide">
              You need to connect your wallet before you can mint ideas on the platform.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-sunset-coral to-sky-blue text-white py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider"
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user doesn't have superhero identity
  if (!hasSuperheroIdentity) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 border-4 border-gray-800 max-w-lg w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-moss-green to-sky-blue">
            <div className="flex items-center space-x-3">
              <UserPlus className="w-6 h-6 text-white" />
              <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
                Create Superhero Identity
              </h2>
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
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-sunset-coral to-sky-blue border-4 border-gray-800 flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                🦸‍♂️
              </div>
              <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-3 uppercase tracking-wider pixel-text-shadow">
                Superhero Identity Required
              </h3>
              <p className="font-orbitron text-pixel-sm text-gray-600 mb-4 uppercase tracking-wide leading-relaxed">
                Before you can mint ideas, you need to create your superhero identity. This helps build trust and reputation in our community.
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-blue-50 border-2 border-blue-400 p-4 mb-6">
              <h4 className="font-pixel font-bold text-pixel-sm text-blue-800 mb-3 uppercase tracking-wider">
                Why Create Identity?
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 border border-blue-800"></div>
                  <span className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide">
                    Build reputation and trust
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 border border-blue-800"></div>
                  <span className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide">
                    Showcase your skills and specialties
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 border border-blue-800"></div>
                  <span className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide">
                    Connect with other builders
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 border border-blue-800"></div>
                  <span className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide">
                    Earn achievements and levels
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/create-superhero"
                onClick={onClose}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-moss-green to-sky-blue text-white py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider"
              >
                <UserPlus className="w-4 h-4" />
                <span>CREATE SUPERHERO IDENTITY</span>
              </Link>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-400 text-white py-3 border-2 border-gray-600 font-pixel font-bold text-pixel-sm hover:bg-gray-500 transition-all duration-200 uppercase tracking-wider"
              >
                MAYBE LATER
              </button>
            </div>

            {/* Info Notice */}
            <div className="mt-4 p-3 bg-yellow-100 border-2 border-yellow-400">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span className="font-pixel font-bold text-pixel-xs text-yellow-800 uppercase tracking-wider">Quick Setup</span>
              </div>
              <p className="font-orbitron text-pixel-xs text-yellow-700 mt-1 uppercase tracking-wide">
                Creating your identity takes less than 2 minutes!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || formData.categories.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    setProgress('Preparing idea data...');

    try {

      // Step 1: Upload files and metadata to IPFS via backend
      setProgress('Uploading files to IPFS...');
      
      const metadataResponse = await ApiService.prepareIdeaMetadata({
        title: formData.title,
        description: formData.description,
        categories: formData.categories,
        price: parseFloat(formData.price),
        userAddress: address,
      }, contentFile || undefined, imageFile || undefined);

      if (!metadataResponse.success) {
        throw new Error(metadataResponse.error?.message || 'Failed to upload metadata to IPFS');
      }


      // Step 2: Connect to user's wallet and create idea on blockchain
      setProgress('Connecting to your wallet...');
      
      if (!ContractService.isMetaMaskInstalled()) {
        throw new Error('MetaMask is required. Please install MetaMask and try again.');
      }

      await contractService.connect();
      
      setProgress('Please confirm the transaction in your wallet...');
      
      const contractResult = await contractService.createIdea({
        title: formData.title,
        categories: formData.categories,
        ipfsHash: metadataResponse.data.metadataHash,
        price: parseFloat(formData.price)
      });


      // Step 3: Show success message
      setProgress(null);
      setSuccess(`Idea created successfully! Transaction: ${contractResult.transactionHash.slice(0, 10)}... The indexer will pick it up shortly.`);
      
      // Refresh the ideas in the marketplace after a delay (indexer needs time)
      setTimeout(async () => {
        try {
          await refreshIdeas();
        } catch (e) {
          // Note: Ideas will appear when indexer processes the transaction
        }
      }, 5000);
      
      // Wait a moment to show success message, then close
      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          categories: [],
          price: '',
          attachments: [],
        });
        setContentFile(null);
        setImageFile(null);
        setSuccess(null);
        setProgress(null);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea');
      setProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-moss-green to-sky-blue">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-white" />
            <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
              Mint New Idea
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* User Identity Display */}
        <div className="p-4 bg-green-50 border-b-4 border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center text-lg overflow-hidden">
              🦸‍♂️
            </div>
            <div>
              <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">
                {address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Connected'}
              </div>
              <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">
                🔗 Wallet Connected
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-400 text-red-700">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-orbitron text-pixel-sm uppercase tracking-wide">
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="p-4 bg-green-100 border-2 border-green-400 text-green-700">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-orbitron text-pixel-sm uppercase tracking-wide">
                  {success}
                </span>
              </div>
            </div>
          )}

          {/* Progress Display */}
          {progress && (
            <div className="p-4 bg-blue-100 border-2 border-blue-400 text-blue-700">
              <div className="flex items-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="font-orbitron text-pixel-sm uppercase tracking-wide">
                  {progress}
                </span>
              </div>
            </div>
          )}
          {/* Title */}
          <div>
            <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
              Idea Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide"
              placeholder="ENTER YOUR IDEA TITLE..."
              required
              maxLength={100}
            />
            <div className="text-right mt-1">
              <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                {formData.title.length}/100
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide resize-none"
              placeholder="DESCRIBE YOUR IDEA IN DETAIL..."
              required
              maxLength={1000}
            />
            <div className="text-right mt-1">
              <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                {formData.description.length}/1000
              </span>
            </div>
          </div>

          {/* Categories - Multiple Selection */}
          <div>
            <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
              Categories * (Select 1-3)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  disabled={!formData.categories.includes(category) && formData.categories.length >= 3}
                  className={`p-3 border-2 font-pixel text-pixel-sm transition-all duration-200 pixel-button uppercase tracking-wider ${
                    formData.categories.includes(category)
                      ? 'bg-moss-green text-white border-green-700 shadow-lg'
                      : formData.categories.length >= 3
                      ? 'bg-gray-200 text-gray-400 border-gray-400 cursor-not-allowed'
                      : 'bg-white/50 text-gray-700 border-gray-600 hover:bg-white/70'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {formData.categories.length === 0 && (
              <p className="mt-2 font-orbitron text-pixel-xs text-red-600 uppercase tracking-wide">
                Please select at least one category
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
              Price (USDC) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="10000"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide"
              placeholder="0.00"
              required
            />
            <p className="mt-1 font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
              Price range: $0.01 - $10,000 USDC
            </p>
          </div>

          {/* Upload Section */}
          <div>
            <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
              Attachments (Optional)
            </label>
            
            {/* Content File Upload */}
            <div className="mb-4">
              <label className="block font-pixel font-bold text-pixel-xs text-gray-700 mb-2 uppercase tracking-wider">
                Content File (Document, Code, etc.)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.js,.ts,.py,.sol,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      setError('Content file must be less than 10MB');
                      return;
                    }
                    setContentFile(file);
                    setError(null);
                  }
                }}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-gray-600 file:text-pixel-xs file:font-pixel file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:uppercase file:tracking-wider"
              />
              {contentFile && (
                <p className="mt-1 text-pixel-xs text-green-600 font-orbitron uppercase tracking-wide">
                  ✓ {contentFile.name} ({(contentFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            {/* Image File Upload */}
            <div>
              <label className="block font-pixel font-bold text-pixel-xs text-gray-700 mb-2 uppercase tracking-wider">
                Image File (Preview/Thumbnail)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      setError('Image file must be less than 5MB');
                      return;
                    }
                    setImageFile(file);
                    setError(null);
                  }
                }}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-gray-600 file:text-pixel-xs file:font-pixel file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:uppercase file:tracking-wider"
              />
              {imageFile && (
                <p className="mt-1 text-pixel-xs text-green-600 font-orbitron uppercase tracking-wide">
                  ✓ {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-100 border-2 border-blue-400">
              <p className="font-orbitron text-pixel-xs text-blue-700 uppercase tracking-wide">
                Files will be uploaded to IPFS for decentralized storage
              </p>
            </div>
          </div>

          {/* Selected Categories Display */}
          {formData.categories.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-400 p-4">
              <h4 className="font-pixel font-bold text-pixel-sm text-blue-800 mb-2 uppercase tracking-wider">
                Selected Categories ({formData.categories.length}/3):
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white border border-blue-700 font-pixel text-pixel-xs uppercase tracking-wider"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className="hover:bg-blue-600 p-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
              Network: Lisk Sepolia
            </div>
            <button
              type="submit"
              disabled={formData.categories.length === 0 || !formData.title || !formData.description || !formData.price || isSubmitting}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-moss-green to-sky-blue text-white px-8 py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'CREATING...' : 'MINT IDEA NFT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MintIdeaModal;