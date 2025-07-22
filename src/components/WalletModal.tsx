import React, { useState, useEffect } from 'react';
import { X, Wallet, Shield, Zap, Loader } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isLoading, error: walletError } = useWallet();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('🔳 WalletModal opened');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (walletType: string) => {
    console.log('🦊 MetaMask connect button clicked, type:', walletType);
    
    if (walletType !== 'metamask') {
      console.log('❌ Unsupported wallet type:', walletType);
      setError('Only MetaMask is supported at this time');
      return;
    }

    setError(null);
    console.log('✅ Starting MetaMask connection...');

    try {
      await connectWallet();
      console.log('✅ Connection successful, closing modal...');
      onClose();
    } catch (err) {
      console.error('❌ Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r from-sunset-coral to-sky-blue">
          <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
            Connect Wallet
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="font-orbitron text-pixel-sm text-gray-600 mb-6 uppercase tracking-wide text-center">
            Choose your preferred wallet to connect to IdeaMan
          </p>

          {/* Error Message */}
          {(error || walletError) && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 font-orbitron text-pixel-xs uppercase tracking-wide">
              {error || walletError}
            </div>
          )}

          {/* Wallet Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleConnect('metamask')}
              disabled={isLoading}
              className="w-full flex items-center space-x-4 p-4 bg-orange-100 border-2 border-orange-400 hover:bg-orange-200 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-orange-500 border-2 border-orange-700 flex items-center justify-center">
                {isLoading ? (
                  <Loader className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <span className="text-2xl">🦊</span>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">MetaMask</div>
                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">
                  {isLoading ? 'Connecting...' : 'Recommended for Lisk Sepolia'}
                </div>
              </div>
              <Wallet className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => handleConnect('walletconnect')}
              disabled={isLoading}
              className="w-full flex items-center space-x-4 p-4 bg-gray-100 border-2 border-gray-400 cursor-not-allowed opacity-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gray-500 border-2 border-gray-700 flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">WalletConnect</div>
                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Coming soon</div>
              </div>
              <Shield className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => handleConnect('coinbase')}
              disabled={isLoading}
              className="w-full flex items-center space-x-4 p-4 bg-gray-100 border-2 border-gray-400 cursor-not-allowed opacity-50 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-gray-500 border-2 border-gray-700 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">Coinbase Wallet</div>
                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Coming soon</div>
              </div>
              <Zap className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-yellow-100 border-2 border-yellow-400">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="font-pixel font-bold text-pixel-xs text-yellow-800 uppercase tracking-wider">Network Notice</span>
            </div>
            <p className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide">
              This app uses Lisk Sepolia testnet. MetaMask will prompt you to add/switch networks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;