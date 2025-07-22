import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { web3Service } from '../services/web3';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isLoading: boolean;
  error: string | null;
  hasSuperheroIdentity: boolean;
  superheroName: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<{ address: string; chainId: number }>;
  disconnectWallet: () => void;
  checkConnection: () => Promise<void>;
  checkSuperheroIdentity: () => Promise<void>;
  refreshWalletState: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isLoading: false,
    error: null,
    hasSuperheroIdentity: false,
    superheroName: null,
  });

  console.log('🌍 WalletProvider initialized with state:', state);

  const connectWallet = useCallback(async () => {
    console.log('🚀 WalletProvider connectWallet called');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔗 Calling web3Service.connectWallet...');
      const result = await web3Service.connectWallet();
      console.log('✅ Web3Service returned:', result);
      
      const newState = {
        isConnected: true,
        address: result.address,
        chainId: result.chainId,
        isLoading: false,
        error: null,
      };
      
      console.log('🔄 Setting new wallet state:', newState);
      setState(newState);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      console.error('❌ Connection failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('🔌 Disconnecting wallet');
    web3Service.disconnect();
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      isLoading: false,
      error: null,
      hasSuperheroIdentity: false,
      superheroName: null,
    });
  }, []);

  const checkConnection = useCallback(async () => {
    console.log('🔍 Checking existing connection...');
    
    // First, let's see what MetaMask reports directly
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('📋 Direct MetaMask query result:');
        console.log('  - Accounts:', accounts);
        console.log('  - ChainId:', chainId, '(' + parseInt(chainId, 16) + ')');
        
        if (accounts.length > 0) {
          console.log('✅ MetaMask has connected account:', accounts[0]);
          setState({
            isConnected: true,
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            isLoading: false,
            error: null,
            hasSuperheroIdentity: false,
            superheroName: null,
          });
          return;
        } else {
          console.log('❌ No accounts found in MetaMask');
        }
      } catch (error) {
        console.error('❌ Direct MetaMask query failed:', error);
      }
    }
    
    // Fallback to web3Service (but this might be cached)
    try {
      const address = await web3Service.getAccount();
      console.log('🔧 web3Service.getAccount() returned:', address);
      
      if (address) {
        console.log('✅ Found existing connection via web3Service:', address);
        const network = await web3Service.getNetwork();
        setState({
          isConnected: true,
          address,
          chainId: network.chainId,
          isLoading: false,
          error: null,
          hasSuperheroIdentity: false,
          superheroName: null,
        });
      } else {
        console.log('❌ No existing connection found');
        setState({
          isConnected: false,
          address: null,
          chainId: null,
          hasSuperheroIdentity: false,
          superheroName: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.log('❌ Connection check failed:', error);
      setState({
        isConnected: false,
        address: null,
        chainId: null,
        hasSuperheroIdentity: false,
        superheroName: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const refreshWalletState = useCallback(async () => {
    console.log('🔄 Manually refreshing wallet state...');
    
    // Force disconnect from web3Service
    web3Service.disconnect();
    
    // Aggressively clear all state
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      hasSuperheroIdentity: false,
      superheroName: null,
      isLoading: false,
      error: null,
    });
    
    console.log('🧹 State cleared, waiting 100ms...');
    
    // Wait a bit for state to clear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force fresh connection check
    console.log('🔍 Getting fresh MetaMask account...');
    
    try {
      if (window.ethereum) {
        // Force MetaMask to give us the current account
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('📋 MetaMask accounts:', accounts);
        
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          console.log('✅ Current MetaMask account:', currentAccount);
          
          // Get fresh network info
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const numericChainId = parseInt(chainId, 16);
          console.log('🔗 Current chain ID:', numericChainId);
          
          // Set fresh state
          setState({
            isConnected: true,
            address: currentAccount,
            chainId: numericChainId,
            hasSuperheroIdentity: false,
            superheroName: null,
            isLoading: false,
            error: null,
          });
        } else {
          console.log('❌ No accounts found');
        }
      }
    } catch (error) {
      console.error('❌ Failed to refresh wallet state:', error);
    }
  }, []); // Remove state dependency to prevent infinite loop

  const checkSuperheroIdentity = useCallback(async (addressToCheck?: string) => {
    const address = addressToCheck || state.address;
    if (!address) return;
    
    try {
      console.log('🦸‍♂️ Checking superhero identity for:', address);
      
      // First, check if this address matches any of our test addresses with known superheroes
      const testSuperheroes: { [key: string]: string } = {
        '0x564323ae0d8473103f3763814c5121ca9e48004b': 'Superman',
        '0x1234567890123456789012345678901234567890': 'Batman', 
        '0x0987654321098765432109876543210987654321': 'Wonder Woman'
      };
      
      const testSuperheroName = testSuperheroes[address.toLowerCase()];
      if (testSuperheroName) {
        console.log('✅ Found test superhero for address:', address, '->', testSuperheroName);
        setState(prev => ({
          ...prev,
          hasSuperheroIdentity: true,
          superheroName: testSuperheroName,
        }));
        return;
      }
      
      // Try blockchain first (more reliable than database)
      try {
        console.log('🔗 Checking blockchain directly...');
        const blockchainResponse = await fetch(`http://localhost:3002/superheroes/${address}/profile`);
        const blockchainResult = await blockchainResponse.json();
        
        console.log('📋 Blockchain API response:', blockchainResult);
        
        if (blockchainResult.success && blockchainResult.data) {
          const profile = blockchainResult.data;
          console.log('✅ Found superhero on blockchain with profile:', profile);
          console.log('   - Name:', JSON.stringify(profile.name));
          console.log('   - Name length:', profile.name ? profile.name.length : 'undefined/null');
          console.log('   - Full profile keys:', Object.keys(profile));
          
          // Only set superhero identity if we have a valid name
          if (profile.name && profile.name.trim()) {
            console.log('🔄 Setting hasSuperheroIdentity to TRUE with valid name:', profile.name);
            setState(prev => ({
              ...prev,
              hasSuperheroIdentity: true,
              superheroName: profile.name,
            }));
          } else {
            console.log('⚠️ Found blockchain record but name is empty/invalid, treating as no superhero');
            setState(prev => ({
              ...prev,
              hasSuperheroIdentity: false,
              superheroName: null,
            }));
          }
          return;
        } else {
          console.log('❌ No superhero found on blockchain for address:', address);
        }
      } catch (blockchainError) {
        console.log('⚠️ Blockchain query failed:', blockchainError, 'trying database fallback...');
      }
      
      // Fallback to database (for older profiles that might be indexed)
      console.log('💾 Checking database fallback...');
      const response = await fetch('http://localhost:3002/superheroes');
      const result = await response.json();
      
      console.log('📋 Database API response:', result);
      
      if (result.success && result.data) {
        console.log('🔍 Searching for address:', address, 'in', result.data.length, 'superheroes');
        // Find superhero with matching address (case-insensitive)
        const superhero = result.data.find((hero: any) => {
          console.log('  - Comparing:', hero.id, 'vs', address);
          return hero.id.toLowerCase() === address.toLowerCase();
        });
        
        console.log('🔍 Database search result:', superhero ? 'FOUND' : 'NOT FOUND');
        
        if (superhero) {
          // Decode the hex-encoded name (browser-compatible)
          let decodedName = superhero.name;
          if (superhero.name.startsWith('0x')) {
            try {
              // Remove 0x prefix and decode hex to string, then remove null bytes
              const hex = superhero.name.slice(2);
              let str = '';
              for (let i = 0; i < hex.length; i += 2) {
                const charCode = parseInt(hex.substr(i, 2), 16);
                if (charCode !== 0) { // Skip null bytes
                  str += String.fromCharCode(charCode);
                }
              }
              decodedName = str;
            } catch (e) {
              console.warn('Failed to decode superhero name:', e);
              decodedName = superhero.name;
            }
          }
          
          console.log('✅ Found superhero in database:', decodedName);
          console.log('🔄 Setting hasSuperheroIdentity to TRUE with name:', decodedName);
          setState(prev => ({
            ...prev,
            hasSuperheroIdentity: true,
            superheroName: decodedName,
          }));
          return;
        } else {
          console.log('❌ No superhero identity found in database');
        }
      } else {
        console.log('❌ Failed to fetch superheroes list from database');
      }
      
      // If we get here, no superhero was found in either blockchain or database
      console.log('❌ No superhero identity found for address:', address);
      console.log('🔄 Setting hasSuperheroIdentity to FALSE');
      setState(prev => ({
        ...prev,
        hasSuperheroIdentity: false,
        superheroName: null,
      }));
    } catch (error) {
      console.log('❌ Superhero identity check failed:', error);
      setState(prev => ({
        ...prev,
        hasSuperheroIdentity: false,
        superheroName: null,
      }));
    }
  }, []); // Remove state.address dependency to prevent infinite loop

  // Check superhero identity when address changes
  useEffect(() => {
    if (state.isConnected && state.address) {
      console.log('🔍 Address changed, checking superhero identity...');
      checkSuperheroIdentity(state.address);
    }
  }, [state.isConnected, state.address]); // Removed checkSuperheroIdentity dependency to prevent loop

  useEffect(() => {
    console.log('🏁 WalletProvider mounted, checking connection...');
    checkConnection();

    // Set up event listeners
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('👥 Accounts changed:', accounts);
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAddress = accounts[0];
        console.log('🔄 Account switched to:', newAddress);
        
        // Reset superhero identity state when switching accounts
        setState(prev => ({ 
          ...prev, 
          address: newAddress,
          hasSuperheroIdentity: false,
          superheroName: null
        }));
        
        // Check superhero identity for the new address
        console.log('🔍 Checking superhero identity for new address:', newAddress);
        checkSuperheroIdentity(newAddress);
      }
    };

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16);
      console.log('🔗 Chain changed:', newChainId);
      setState(prev => ({ ...prev, chainId: newChainId }));
    };

    web3Service.setupEventListeners(handleAccountsChanged, handleChainChanged);

    return () => {
      console.log('🧹 WalletProvider unmounting, removing listeners');
      web3Service.removeEventListeners();
    };
  }, [checkConnection, disconnectWallet]);

  // Log state changes
  useEffect(() => {
    console.log('🔄 WalletProvider state changed:', state);
  }, [state]);

  const value: WalletContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    checkConnection,
    checkSuperheroIdentity,
    refreshWalletState,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};