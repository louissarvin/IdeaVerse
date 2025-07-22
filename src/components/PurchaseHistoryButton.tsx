import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';

const PurchaseHistoryButton: React.FC = () => {
  const { refreshPurchaseHistory, isLoading } = useApp();
  const { isConnected } = useWallet();
  const { showWarning } = useToast();

  const handleRefresh = async () => {
    if (!isConnected) {
      showWarning('Wallet Required', 'Please connect your wallet first');
      return;
    }
    
    console.log('🔄 Manually refreshing purchase history...');
    await refreshPurchaseHistory();
  };

  if (!isConnected) return null;

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white border-2 border-blue-800 font-pixel font-bold text-pixel-xs hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
      title="Check which ideas you've purchased and show VIEW CONTENT buttons"
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      <span>Check My Purchases</span>
    </button>
  );
};

export default PurchaseHistoryButton;