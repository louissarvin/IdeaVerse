import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ABIS, ContractName } from '../contracts/abis';
import { CONTRACT_ADDRESSES } from '../contracts/config';
import { useWallet } from '../contexts/WalletContext';

interface ContractState {
  isLoading: boolean;
  error: string | null;
}

export const useContract = () => {
  const { isConnected } = useWallet();
  const [state, setState] = useState<ContractState>({
    isLoading: false,
    error: null,
  });

  const getContract = useCallback(async (contractName: ContractName) => {
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      // Create provider and signer directly from window.ethereum
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES[contractName],
        ABIS[contractName],
        signer
      );

      return contract;
    } catch (error) {
      throw new Error(`Failed to get contract: ${error}`);
    }
  }, [isConnected]);

  const executeContractMethod = useCallback(async (
    contractName: ContractName,
    method: string,
    args: any[] = [],
    options: { value?: string } = {}
  ) => {
    setState({ isLoading: true, error: null });

    try {
      const contract = await getContract(contractName);
      
      // Execute the method
      const tx = await contract[method](...args, options);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      setState({ isLoading: false, error: null });
      
      return {
        transaction: tx,
        receipt,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      setState({ isLoading: false, error: errorMessage });
      throw error;
    }
  }, [getContract]);

  const readContractMethod = useCallback(async (
    contractName: ContractName,
    method: string,
    args: any[] = []
  ) => {
    try {
      const contract = await getContract(contractName);
      const result = await contract[method](...args);
      return result;
    } catch (error) {
      throw new Error(`Failed to read from contract: ${error}`);
    }
  }, [getContract]);

  return {
    ...state,
    executeContractMethod,
    readContractMethod,
    getContract,
  };
};

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      removeAllListeners: (event: string) => void;
    };
  }
}