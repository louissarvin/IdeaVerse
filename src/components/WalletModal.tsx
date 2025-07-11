import React from 'react';
import { X, Wallet, Shield, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet } = useApp();

  if (!isOpen) return null;

  const handleConnect = (walletType: string) => {
    connectWallet();
    onClose();
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

          {/* Wallet Options */}
          <div className="space-y-3">
            <button
              onClick={() => handleConnect('metamask')}
              className="w-full flex items-center space-x-4 p-4 bg-orange-100 border-2 border-orange-400 hover:bg-orange-200 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-orange-500 border-2 border-orange-700 flex items-center justify-center">
                <span className="text-2xl">🦊</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">MetaMask</div>
                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Most popular wallet</div>
              </div>
              <Wallet className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => handleConnect('walletconnect')}
              className="w-full flex items-center space-x-4 p-4 bg-blue-100 border-2 border-blue-400 hover:bg-blue-200 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">WalletConnect</div>
                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Connect any wallet</div>
              </div>
              <Shield className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => handleConnect('coinbase')}
              className="w-full flex items-center space-x-4 p-4 bg-purple-100 border-2 border-purple-400 hover:bg-purple-200 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-purple-500 border-2 border-purple-700 flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-pixel font-bold text-pixel-sm text-gray-800 uppercase tracking-wider">Coinbase Wallet</div>
                <div className="font-orbitron text-pixel-xs text-gray-600 uppercase tracking-wide">Easy to use</div>
              </div>
              <Zap className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-yellow-100 border-2 border-yellow-400">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="font-pixel font-bold text-pixel-xs text-yellow-800 uppercase tracking-wider">Security Notice</span>
            </div>
            <p className="font-orbitron text-pixel-xs text-yellow-700 uppercase tracking-wide">
              Never share your private keys. IdeaMan will never ask for your seed phrase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;