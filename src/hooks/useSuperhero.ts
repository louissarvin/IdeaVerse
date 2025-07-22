import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import { BACKEND_API_URL } from '../contracts/config';

interface CreateSuperheroData {
  name: string;
  bio: string;
  skills: string[];
  specialities: string[];
  avatarFile?: File;
}

interface CreateSuperheroResult {
  transactionHash: string;
  blockNumber: number;
  metadataUrl: string;
  avatarUrl?: string;
}

export const useSuperhero = () => {
  const { executeContractMethod, readContractMethod, isLoading: contractLoading, error: contractError } = useContract();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadToIPFS = useCallback(async (data: CreateSuperheroData) => {
    try {
      console.log('📄 Uploading to IPFS via backend...');
      
      let avatarUrl = null;
      
      // Step 1: Upload avatar if provided
      if (data.avatarFile) {
        console.log('🖼️ Uploading avatar to IPFS...');
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', data.avatarFile);
        
        const avatarResponse = await fetch(`${BACKEND_API_URL}/superheroes/upload-avatar`, {
          method: 'POST',
          body: avatarFormData,
        });
        
        if (!avatarResponse.ok) {
          throw new Error('Failed to upload avatar to IPFS');
        }
        
        const avatarResult = await avatarResponse.json();
        if (!avatarResult.success) {
          throw new Error(avatarResult.error?.message || 'Avatar upload failed');
        }
        
        avatarUrl = avatarResult.data.ipfsUrl;
        console.log('✅ Avatar uploaded:', avatarUrl);
      }
      
      // Step 2: Upload metadata JSON to IPFS
      console.log('📄 Uploading metadata to IPFS...');
      const metadataResponse = await fetch(`${BACKEND_API_URL}/superheroes/upload-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          bio: data.bio,
          skills: data.skills,
          specialities: data.specialities,
          avatarHash: avatarUrl ? avatarUrl.replace('ipfs://', '') : undefined,
        }),
      });
      
      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }
      
      const metadataResult = await metadataResponse.json();
      if (!metadataResult.success) {
        throw new Error(metadataResult.error?.message || 'Metadata upload failed');
      }
      
      console.log('✅ Metadata uploaded:', metadataResult.data.url);
      
      return {
        metadataUrl: metadataResult.data.url,
        avatarUrl,
      };
    } catch (error) {
      throw new Error(`IPFS upload failed: ${error}`);
    }
  }, []);

  const createSuperhero = useCallback(async (data: CreateSuperheroData): Promise<CreateSuperheroResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload to IPFS via backend
      console.log('📄 Uploading metadata to IPFS...');
      const { metadataUrl, avatarUrl } = await uploadToIPFS(data);
      console.log('✅ Metadata uploaded:', metadataUrl);

      // Step 2: Check if name is available
      console.log('🔍 Checking superhero name availability...');
      const nameBytes32 = ethers.utils.formatBytes32String(data.name);
      const isAvailable = await readContractMethod('SuperheroNFT', 'isSuperheroNameAvailable', [nameBytes32]);
      
      if (!isAvailable) {
        throw new Error('Superhero name is already taken');
      }

      // Step 3: Prepare contract arguments
      const skillsBytes32 = data.skills.map(skill => ethers.utils.formatBytes32String(skill));
      const specialitiesBytes32 = data.specialities.map(spec => ethers.utils.formatBytes32String(spec));
      const bioBytes32 = ethers.utils.formatBytes32String(data.bio);

      // Step 4: Execute contract transaction
      console.log('⛓️ Creating superhero on blockchain...');
      console.log('📊 Contract arguments:', {
        nameBytes32,
        bioBytes32,
        metadataUrl,
        skillsBytes32: skillsBytes32.length,
        specialitiesBytes32: specialitiesBytes32.length
      });
      
      const contractCallResult = executeContractMethod('SuperheroNFT', 'createSuperhero', [
        nameBytes32,
        bioBytes32,
        metadataUrl,
        skillsBytes32,
        specialitiesBytes32
      ]);
      
      console.log('🔍 Contract call result type:', typeof contractCallResult);
      console.log('🔍 Contract call result:', contractCallResult);
      
      if (!contractCallResult || typeof contractCallResult.then !== 'function') {
        throw new Error('Contract method did not return a Promise');
      }
      
      const result = await contractCallResult;

      console.log('✅ Superhero created successfully!');
      console.log('📊 Contract result:', result);

      setIsLoading(false);

      return {
        transactionHash: result.transactionHash || result.receipt?.transactionHash || 'unknown',
        blockNumber: result.blockNumber || result.receipt?.blockNumber || 0,
        metadataUrl,
        avatarUrl: avatarUrl || undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create superhero';
      setError(errorMessage);
      setIsLoading(false);
      throw error;
    }
  }, [executeContractMethod, readContractMethod, uploadToIPFS]);

  const isSuperheroNameAvailable = useCallback(async (name: string): Promise<boolean> => {
    try {
      const nameBytes32 = ethers.utils.formatBytes32String(name);
      return await readContractMethod('SuperheroNFT', 'isSuperheroNameAvailable', [nameBytes32]);
    } catch (error) {
      console.error('Failed to check name availability:', error);
      return false;
    }
  }, [readContractMethod]);

  const getSuperheroProfile = useCallback(async (address: string) => {
    try {
      const profile = await readContractMethod('SuperheroNFT', 'getSuperheroProfile', [address]);
      
      return {
        superheroId: profile.superheroId.toString(),
        name: ethers.utils.parseBytes32String(profile.name),
        bio: ethers.utils.parseBytes32String(profile.bio),
        avatarUrl: profile.avatarUrl,
        reputation: profile.reputation.toString(),
        skills: profile.skills.map((skill: string) => ethers.utils.parseBytes32String(skill)).filter((s: string) => s.length > 0),
        specialities: profile.specialities.map((spec: string) => ethers.utils.parseBytes32String(spec)).filter((s: string) => s.length > 0),
        flagged: profile.flagged,
        createdAt: new Date(profile.createdAt.toNumber() * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to get superhero profile: ${error}`);
    }
  }, [readContractMethod]);

  const isSuperhero = useCallback(async (address: string): Promise<boolean> => {
    try {
      const superheroRole = await readContractMethod('SuperheroNFT', 'SUPERHERO_ROLE', []);
      return await readContractMethod('SuperheroNFT', 'hasRole', [superheroRole, address]);
    } catch (error) {
      console.error('Failed to check superhero status:', error);
      return false;
    }
  }, [readContractMethod]);

  return {
    createSuperhero,
    isSuperheroNameAvailable,
    getSuperheroProfile,
    isSuperhero,
    isLoading: isLoading || contractLoading,
    error: error || contractError,
  };
};