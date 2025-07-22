import { ethers } from 'ethers';

// USDC ABI (minimal for balance, allowance, approve, and mint functions)
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount) returns (bool)'
];

// Marketplace ABI (minimal for buyIdea function)
const MARKETPLACE_ABI = [
  'function buyIdea(uint256 _ideaId) external',
  'event IdeaPurchased(uint256 indexed ideaId, address indexed buyer, address indexed seller, uint256 price, uint256 marketplaceFee, uint256 timestamp)'
];

// TeamCore ABI (for team creation and joining)
const TEAM_CORE_ABI = [
  'function createTeam(uint128 _requiredMembers, uint96 _requiredStake, bytes32 _teamName, bytes32 _description, bytes32 _projectName, bytes32[5] _roles, bytes32[3] _tags) returns (uint256)',
  'function joinTeam(uint256 _teamId) external',
  'function getTeam(uint256 _teamId) view returns (tuple(uint256 teamId, uint256 createdAt, address leader, uint96 requiredStake, uint128 requiredMembers, uint8 status, uint120 reserved, address[] members, bytes32 teamName, bytes32 projectName, bytes32 description, bytes32[5] roles, bytes32[3] tags))',
  'function getTeamMembers(uint256 _teamId) view returns (address[])',
  'function getUserTeams(address _user) view returns (uint256[])',
  'function isTeamMember(uint256 _teamId, address _user) view returns (bool)',
  'function totalTeams() view returns (uint256)',
  'event TeamCreated(uint256 indexed teamId, address indexed leader, bytes32 teamName)',
  'event JoinTeam(uint256 indexed teamId, address indexed member, uint256 amount)'
];

// SuperheroNFT ABI (minimal for reputation and profile functions)
const SUPERHERO_ABI = [
  'function updateReputation(address _superhero, uint256 _newReputation) external',
  'function rateSuperhero(address _superhero, uint8 _rating, string _comment) external',
  'function getSuperheroProfile(address _superhero) view returns (tuple(uint256 superheroId, bytes32 name, bytes32 bio, string avatarUrl, uint256 createdAt, uint256 reputation, bytes32[] specialities, bytes32[] skills, bool flagged))',
  'function isSuperhero(address _address) view returns (bool)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function SUPERHERO_ROLE() view returns (bytes32)',
  'event CreateSuperhero(address indexed addr, uint256 indexed id, bytes32 name, bytes32 bio, string indexed uri)',
  'event SuperheroRated(address indexed rater, address indexed superhero, uint8 rating, string comment, uint256 timestamp)'
];

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const LISK_SEPOLIA_CONFIG: NetworkConfig = {
  chainId: 4202,
  name: 'Lisk Sepolia',
  rpcUrl: 'https://rpc.sepolia-api.lisk.com',
  blockExplorer: 'https://sepolia-blockscout.lisk.com',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18
  }
};

export const CONTRACT_ADDRESSES = {
  SuperheroNFT: '0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9',
  IdeaRegistry: '0xecB93f03515DE67EA43272797Ea8eDa059985894',
  TeamCore: '0xed852d3Ef6a5B57005acDf1054d15af1CF09489c',
  OptimizedMarketplace: '0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF',
  MockUSDC: '0x47B320A4ED999989AE3065Be28B208f177a7546D'
};

// Superhero reputation levels (for rating calculation)
export const REPUTATION_LEVELS = {
  BRONZE: 100,
  SILVER: 500,
  GOLD: 1000,
  PLATINUM: 2500,
  DIAMOND: 5000
};

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<{ address: string; chainId: number }> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Get network info
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      // Switch to Lisk Sepolia if not already connected
      if (chainId !== LISK_SEPOLIA_CONFIG.chainId) {
        await this.switchToLiskSepolia();
      }

      return {
        address: accounts[0],
        chainId: LISK_SEPOLIA_CONFIG.chainId
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async switchToLiskSepolia(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Try to switch to Lisk Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${LISK_SEPOLIA_CONFIG.chainId.toString(16)}` }]
      });
    } catch (switchError: any) {
      // If the chain doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${LISK_SEPOLIA_CONFIG.chainId.toString(16)}`,
              chainName: LISK_SEPOLIA_CONFIG.name,
              rpcUrls: [LISK_SEPOLIA_CONFIG.rpcUrl],
              nativeCurrency: LISK_SEPOLIA_CONFIG.nativeCurrency,
              blockExplorerUrls: [LISK_SEPOLIA_CONFIG.blockExplorer]
            }
          ]
        });
      } else {
        throw switchError;
      }
    }
  }

  async getAccount(): Promise<string | null> {
    try {
      // Always get fresh account from MetaMask, don't rely on cached provider
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts.length > 0 ? accounts[0] : null;
      }
      
      // Fallback to provider method
      if (!this.provider) {
        return null;
      }

      const signer = this.provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const targetAddress = address || await this.getAccount();
    if (!targetAddress) {
      throw new Error('No address provided');
    }

    const balance = await this.provider.getBalance(targetAddress);
    return ethers.utils.formatEther(balance);
  }

  async getNetwork(): Promise<{ chainId: number; name: string }> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const network = await this.provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  }

  async isSuperhero(address: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // This would call the SuperheroNFT contract to check if the address has a superhero NFT
      // For now, we'll use the backend API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'}/superheroes/address/${address}`);
      const data = await response.json();
      return data.success && data.data !== null;
    } catch (error) {
      console.error('Failed to check superhero status:', error);
      return false;
    }
  }

  async waitForTransaction(hash: string): Promise<ethers.providers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      return await this.provider.waitForTransaction(hash);
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      return null;
    }
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  // Event listeners
  setupEventListeners(
    onAccountsChanged: (accounts: string[]) => void,
    onChainChanged: (chainId: string) => void
  ): void {
    if (!window.ethereum) {
      return;
    }

    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', onChainChanged);
  }

  removeEventListeners(): void {
    if (!window.ethereum) {
      return;
    }

    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }

  // USDC Token Methods
  async getUSDCBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const targetAddress = address || await this.getAccount();
    if (!targetAddress) {
      throw new Error('No address provided');
    }

    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, USDC_ABI, this.provider);
    const balance = await usdcContract.balanceOf(targetAddress);
    return ethers.utils.formatUnits(balance, 6); // USDC has 6 decimals
  }

  async getUSDCAllowance(ownerAddress?: string, spenderAddress: string = CONTRACT_ADDRESSES.OptimizedMarketplace): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const targetAddress = ownerAddress || await this.getAccount();
    if (!targetAddress) {
      throw new Error('No address provided');
    }

    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, USDC_ABI, this.provider);
    const allowance = await usdcContract.allowance(targetAddress, spenderAddress);
    return ethers.utils.formatUnits(allowance, 6); // USDC has 6 decimals
  }

  async approveUSDC(amount: string, spenderAddress: string = CONTRACT_ADDRESSES.OptimizedMarketplace): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Provider or signer not initialized');
    }

    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, USDC_ABI, this.signer);
    const amountWei = ethers.utils.parseUnits(amount, 6); // USDC has 6 decimals
    
    const tx = await usdcContract.approve(spenderAddress, amountWei);
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  async checkUSDCAllowanceAndBalance(amount: string, userAddress?: string): Promise<{
    hasBalance: boolean;
    hasAllowance: boolean;
    balance: string;
    allowance: string;
    needsApproval: boolean;
  }> {
    const targetAddress = userAddress || await this.getAccount();
    if (!targetAddress) {
      throw new Error('No address provided');
    }

    const [balance, allowance] = await Promise.all([
      this.getUSDCBalance(targetAddress),
      this.getUSDCAllowance(targetAddress)
    ]);

    const hasBalance = parseFloat(balance) >= parseFloat(amount);
    const hasAllowance = parseFloat(allowance) >= parseFloat(amount);

    return {
      hasBalance,
      hasAllowance,
      balance,
      allowance,
      needsApproval: hasBalance && !hasAllowance
    };
  }

  async mintUSDC(amount: string, toAddress?: string): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Provider or signer not initialized');
    }

    const targetAddress = toAddress || await this.getAccount();
    if (!targetAddress) {
      throw new Error('No address provided for minting');
    }

    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, USDC_ABI, this.signer);
    const amountWei = ethers.utils.parseUnits(amount, 6); // USDC has 6 decimals
    
    console.log(`🪙 Minting ${amount} USDC to ${targetAddress}...`);
    const tx = await usdcContract.mint(targetAddress, amountWei);
    const receipt = await tx.wait();
    
    console.log(`✅ USDC minted successfully: ${receipt.transactionHash}`);
    return receipt.transactionHash;
  }

  async buyIdea(ideaId: number): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Provider or signer not initialized');
    }

    const marketplaceContract = new ethers.Contract(CONTRACT_ADDRESSES.OptimizedMarketplace, MARKETPLACE_ABI, this.signer);
    
    console.log(`🛒 Purchasing idea ${ideaId} via marketplace contract...`);
    const tx = await marketplaceContract.buyIdea(ideaId);
    const receipt = await tx.wait();
    
    console.log(`✅ Idea purchased successfully: ${receipt.transactionHash}`);
    return receipt.transactionHash;
  }

  // SuperheroNFT Contract Methods
  async getSuperheroProfile(address: string): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const superheroContract = new ethers.Contract(CONTRACT_ADDRESSES.SuperheroNFT, SUPERHERO_ABI, this.provider);
    
    try {
      const profile = await superheroContract.getSuperheroProfile(address);
      return {
        superheroId: profile.superheroId.toNumber(),
        name: profile.name,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt.toNumber(),
        reputation: profile.reputation.toNumber(),
        specialities: profile.specialities,
        skills: profile.skills,
        flagged: profile.flagged
      };
    } catch (error) {
      console.error(`Failed to get superhero profile for ${address}:`, error);
      throw error;
    }
  }

  async updateSuperheroReputation(superheroAddress: string, newReputation: number): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Provider or signer not initialized');
    }

    const superheroContract = new ethers.Contract(CONTRACT_ADDRESSES.SuperheroNFT, SUPERHERO_ABI, this.signer);
    
    console.log(`📈 Updating reputation for ${superheroAddress} to ${newReputation}...`);
    
    try {
      const tx = await superheroContract.updateReputation(superheroAddress, newReputation);
      const receipt = await tx.wait();
      
      console.log(`✅ Reputation updated successfully: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to update reputation:', error);
      throw error;
    }
  }

  async rateSuperhero(superheroAddress: string, rating: number, comment: string = ''): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Provider or signer not initialized');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const superheroContract = new ethers.Contract(CONTRACT_ADDRESSES.SuperheroNFT, SUPERHERO_ABI, this.signer);
    
    console.log(`⭐ Rating superhero ${superheroAddress} with ${rating} stars...`);
    
    try {
      const tx = await superheroContract.rateSuperhero(superheroAddress, rating, comment || '');
      const receipt = await tx.wait();
      
      console.log(`✅ Superhero rated successfully: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to rate superhero:', error);
      throw error;
    }
  }

  async checkIsSuperhero(address: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const superheroContract = new ethers.Contract(CONTRACT_ADDRESSES.SuperheroNFT, SUPERHERO_ABI, this.provider);
    
    try {
      // Try both methods since there might be two different superhero systems
      console.log(`🔍 Checking superhero status for ${address} using both methods...`);
      
      // Method 1: Direct isSuperhero function
      let isSuperheroMethod1 = false;
      try {
        isSuperheroMethod1 = await superheroContract.isSuperhero(address);
        console.log(`📋 Method 1 (isSuperhero): ${isSuperheroMethod1}`);
      } catch (method1Error) {
        console.warn('Method 1 failed:', method1Error);
      }
      
      // Method 2: Role-based hasRole function
      let isSuperheroMethod2 = false;
      try {
        const superheroRole = await superheroContract.SUPERHERO_ROLE();
        isSuperheroMethod2 = await superheroContract.hasRole(superheroRole, address);
        console.log(`📋 Method 2 (hasRole): ${isSuperheroMethod2}`);
      } catch (method2Error) {
        console.warn('Method 2 failed:', method2Error);
      }
      
      // Method 3: Check IdeaRegistry contract (which TeamCore might be using)
      let isSuperheroMethod3 = false;
      try {
        const ideaRegistryContract = new ethers.Contract(CONTRACT_ADDRESSES.IdeaRegistry, [
          'function hasRole(bytes32 role, address account) view returns (bool)',
          'function SUPERHERO_ROLE() view returns (bytes32)'
        ], this.provider);
        
        const superheroRole = await ideaRegistryContract.SUPERHERO_ROLE();
        isSuperheroMethod3 = await ideaRegistryContract.hasRole(superheroRole, address);
        console.log(`📋 Method 3 (IdeaRegistry hasRole): ${isSuperheroMethod3}`);
      } catch (method3Error) {
        console.warn('Method 3 (IdeaRegistry) failed:', method3Error);
      }
      
      const result = isSuperheroMethod1 || isSuperheroMethod2 || isSuperheroMethod3;
      console.log(`🎯 Final superhero status: ${result} (SuperheroNFT-Method1: ${isSuperheroMethod1}, SuperheroNFT-Method2: ${isSuperheroMethod2}, IdeaRegistry: ${isSuperheroMethod3})`);
      
      // Show warning if there's a mismatch
      if ((isSuperheroMethod1 || isSuperheroMethod2) && !isSuperheroMethod3) {
        console.warn('⚠️ MISMATCH DETECTED: You are a superhero in SuperheroNFT but NOT in IdeaRegistry! TeamCore might be checking IdeaRegistry.');
      }
      
      return result;
      
    } catch (error) {
      console.error(`Failed to check superhero status for ${address}:`, error);
      return false;
    }
  }

  // TeamCore Contract Methods
  async createTeam(teamData: {
    teamName: string;
    projectName: string;
    description: string;
    requiredMembers: number;
    requiredStake: number;
    roles: string[];
    tags: string[];
  }): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Provider or signer not initialized');
    }

    const teamContract = new ethers.Contract(CONTRACT_ADDRESSES.TeamCore, TEAM_CORE_ABI, this.signer);
    
    // Convert strings to bytes32 and pad arrays
    const teamNameBytes = ethers.utils.formatBytes32String(teamData.teamName);
    const projectNameBytes = ethers.utils.formatBytes32String(teamData.projectName);
    const descriptionBytes = ethers.utils.formatBytes32String(teamData.description);
    
    // Pad roles array to 5 elements
    const rolesBytes = Array(5).fill(ethers.utils.formatBytes32String(''));
    teamData.roles.slice(0, 5).forEach((role, i) => {
      rolesBytes[i] = ethers.utils.formatBytes32String(role);
    });
    
    // Pad tags array to 3 elements
    const tagsBytes = Array(3).fill(ethers.utils.formatBytes32String(''));
    teamData.tags.slice(0, 3).forEach((tag, i) => {
      tagsBytes[i] = ethers.utils.formatBytes32String(tag);
    });

    // First approve USDC tokens for the TeamCore contract (leader stakes same amount as members)
    const leaderStakeAmount = teamData.requiredStake; // Leader stakes same as member requirement
    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, USDC_ABI, this.signer);
    const stakeAmountWei = ethers.utils.parseUnits(leaderStakeAmount.toString(), 6);
    
    console.log(`💰 Approving ${leaderStakeAmount} USDC for team creation (leader stake)...`);
    const approveTx = await usdcContract.approve(CONTRACT_ADDRESSES.TeamCore, stakeAmountWei);
    await approveTx.wait();
    
    console.log(`🏗️ Creating team "${teamData.teamName}" with ${teamData.requiredMembers} members...`);
    
    try {
      // Convert stake amount to wei format (6 decimals for USDC)
      const stakeAmountInWei = ethers.utils.parseUnits(teamData.requiredStake.toString(), 6);
      
      const tx = await teamContract.createTeam(
        teamData.requiredMembers,
        stakeAmountInWei,
        teamNameBytes,
        descriptionBytes,
        projectNameBytes,
        rolesBytes,
        tagsBytes
      );
      const receipt = await tx.wait();
      
      console.log(`✅ Team created successfully: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  }

  async joinTeam(teamId: number, stakeAmount: number): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Provider or signer not initialized');
    }

    // First approve USDC tokens for the TeamCore contract
    const usdcContract = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, USDC_ABI, this.signer);
    const stakeAmountWei = ethers.utils.parseUnits(stakeAmount.toString(), 6);
    
    console.log(`💰 Approving ${stakeAmount} USDC for team join...`);
    const approveTx = await usdcContract.approve(CONTRACT_ADDRESSES.TeamCore, stakeAmountWei);
    await approveTx.wait();
    
    // Now join the team
    const teamContract = new ethers.Contract(CONTRACT_ADDRESSES.TeamCore, TEAM_CORE_ABI, this.signer);
    
    console.log(`🤝 Joining team ${teamId}...`);
    
    try {
      const tx = await teamContract.joinTeam(teamId);
      const receipt = await tx.wait();
      
      console.log(`✅ Successfully joined team: ${receipt.transactionHash}`);
      return receipt.transactionHash;
    } catch (error) {
      console.error('Failed to join team:', error);
      throw error;
    }
  }

  async getTeamDetails(teamId: number): Promise<any> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const teamContract = new ethers.Contract(CONTRACT_ADDRESSES.TeamCore, TEAM_CORE_ABI, this.provider);
    
    try {
      const team = await teamContract.getTeam(teamId);
      
      return {
        teamId: team.teamId.toNumber(),
        createdAt: team.createdAt.toNumber(),
        leader: team.leader,
        requiredStake: team.requiredStake.toNumber(),
        requiredMembers: team.requiredMembers.toNumber(),
        status: team.status,
        members: team.members,
        teamName: ethers.utils.parseBytes32String(team.teamName),
        projectName: ethers.utils.parseBytes32String(team.projectName),
        description: ethers.utils.parseBytes32String(team.description),
        roles: team.roles.map((role: string) => ethers.utils.parseBytes32String(role)).filter((r: string) => r !== ''),
        tags: team.tags.map((tag: string) => ethers.utils.parseBytes32String(tag)).filter((t: string) => t !== '')
      };
    } catch (error) {
      console.error(`Failed to get team details for ${teamId}:`, error);
      throw error;
    }
  }

  async getUserTeams(userAddress: string): Promise<number[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const teamContract = new ethers.Contract(CONTRACT_ADDRESSES.TeamCore, TEAM_CORE_ABI, this.provider);
    
    try {
      const teamIds = await teamContract.getUserTeams(userAddress);
      return teamIds.map((id: any) => id.toNumber());
    } catch (error) {
      console.error(`Failed to get user teams for ${userAddress}:`, error);
      return [];
    }
  }

  async isTeamMember(teamId: number, userAddress: string): Promise<boolean> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const teamContract = new ethers.Contract(CONTRACT_ADDRESSES.TeamCore, TEAM_CORE_ABI, this.provider);
    
    try {
      return await teamContract.isTeamMember(teamId, userAddress);
    } catch (error) {
      console.error(`Failed to check team membership for ${userAddress} in team ${teamId}:`, error);
      return false;
    }
  }

  async getTotalTeams(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const teamContract = new ethers.Contract(CONTRACT_ADDRESSES.TeamCore, TEAM_CORE_ABI, this.provider);
    
    try {
      const total = await teamContract.totalTeams();
      return total.toNumber();
    } catch (error) {
      console.error('Failed to get total teams:', error);
      return 0;
    }
  }

  // Rating System Helper Functions
  calculateReputationFromRatings(ratings: { rating: number }[]): number {
    if (ratings.length === 0) return 0;
    
    // Calculate weighted average (recent ratings have more weight)
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    
    // Convert 1-5 star rating to reputation points
    // Base reputation = average * 100, with bonus for volume
    const baseReputation = Math.floor(averageRating * 100);
    const volumeBonus = Math.min(totalRatings * 10, 500); // Max 500 bonus for volume
    
    return baseReputation + volumeBonus;
  }

  getReputationLevel(reputation: number): string {
    if (reputation >= REPUTATION_LEVELS.DIAMOND) return 'DIAMOND';
    if (reputation >= REPUTATION_LEVELS.PLATINUM) return 'PLATINUM';
    if (reputation >= REPUTATION_LEVELS.GOLD) return 'GOLD';
    if (reputation >= REPUTATION_LEVELS.SILVER) return 'SILVER';
    if (reputation >= REPUTATION_LEVELS.BRONZE) return 'BRONZE';
    return 'ROOKIE';
  }
}

// Global instance
export const web3Service = new Web3Service();

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

export default web3Service;