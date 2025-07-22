import 'dotenv/config';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Contract addresses from your deployment
export const CONTRACT_ADDRESSES = {
  SuperheroNFT: '0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9',
  IdeaRegistry: '0xecB93f03515DE67EA43272797Ea8eDa059985894',
  TeamCore: '0xed852d3Ef6a5B57005acDf1054d15af1CF09489c',
  TeamMilestones: '0xf31e7B8E0a820DCd1a283315DB0aD641dFe7Db84',
  OptimizedMarketplace: '0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF',
  MockUSDC: '0x47B320A4ED999989AE3065Be28B208f177a7546D'
};

// Load ABIs from JSON files
const loadABI = (filename: string) => {
  const abiPath = path.join(process.cwd(), 'src', 'abi', filename);
  return JSON.parse(fs.readFileSync(abiPath, 'utf8'));
};

const SUPERHERO_NFT_ABI = loadABI('SUPERHERO.json');
const IDEA_REGISTRY_ABI = loadABI('IDEA_REGISTRY.json');
const TEAM_CORE_ABI = loadABI('TEAM_CORE.json');
const MARKETPLACE_ABI = loadABI('MARKETPLACE.json');
const USDC_ABI = loadABI('USDC.json');

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private superheroNFT: ethers.Contract;
  private ideaRegistry: ethers.Contract;
  private teamCore: ethers.Contract;
  private marketplace: ethers.Contract;
  private mockUSDC: ethers.Contract;

  constructor() {
    // Use multiple fallback RPC URLs for better reliability
    const rpcUrls = [
      "https://lisk-sepolia.drpc.org",
      "https://rpc.sepolia-api.lisk.com",
      process.env.LISK_SEPOLIA_RPC_URL
    ].filter(Boolean);
    
    // Configure provider with explicit network details for Lisk Sepolia
    const networkConfig = {
      name: 'lisk-sepolia',
      chainId: 4202,
      ensAddress: undefined,
      _defaultProvider: null
    };
    
    // Create provider with explicit configuration to avoid network detection
    const connectionInfo = {
      url: rpcUrls[0],
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    this.provider = new ethers.providers.JsonRpcProvider(connectionInfo, networkConfig);
    console.log(`✅ Configured blockchain provider: ${rpcUrls[0]}`);
    
    // Validate private key
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    
    // Ensure private key starts with 0x
    const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
      ? process.env.PRIVATE_KEY 
      : `0x${process.env.PRIVATE_KEY}`;
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contracts with full ABIs
    this.superheroNFT = new ethers.Contract(CONTRACT_ADDRESSES.SuperheroNFT, SUPERHERO_NFT_ABI, this.wallet);
    this.ideaRegistry = new ethers.Contract(CONTRACT_ADDRESSES.IdeaRegistry, IDEA_REGISTRY_ABI, this.wallet);
    this.teamCore = new ethers.Contract(CONTRACT_ADDRESSES.TeamCore, TEAM_CORE_ABI, this.wallet);
    this.marketplace = new ethers.Contract(CONTRACT_ADDRESSES.OptimizedMarketplace, MARKETPLACE_ABI, this.wallet);
    this.mockUSDC = new ethers.Contract(CONTRACT_ADDRESSES.MockUSDC, USDC_ABI, this.wallet);
  }

  // Utility functions
  private formatBytes32String(str: string): string {
    return ethers.utils.formatBytes32String(str);
  }

  private parseBytes32String(bytes32: string): string {
    return ethers.utils.parseBytes32String(bytes32);
  }

  // Superhero operations
  async createSuperhero(data: {
    name: string;
    bio: string;
    avatarUri: string;
    skills: string[];
    specialities: string[];
    userAddress: string;
  }) {
    try {
      // Check if name is available
      const nameBytes32 = this.formatBytes32String(data.name);
      const isAvailable = await this.superheroNFT.isSuperheroNameAvailable(nameBytes32);
      
      if (!isAvailable) {
        throw new Error('Superhero name is already taken');
      }

      // Convert arrays to bytes32
      const skillsBytes32 = data.skills.map(skill => this.formatBytes32String(skill));
      const specialitiesBytes32 = data.specialities.map(spec => this.formatBytes32String(spec));
      const bioBytes32 = this.formatBytes32String(data.bio);

      // Create superhero transaction
      const tx = await this.superheroNFT.createSuperhero(
        nameBytes32,
        bioBytes32,
        data.avatarUri,
        skillsBytes32,
        specialitiesBytes32
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to create superhero: ${error}`);
    }
  }

  // Helper method to convert IPFS URLs to gateway URLs
  private convertIpfsToGateway(ipfsUrl: string): string {
    if (ipfsUrl && ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  }

  async getSuperheroProfile(address: string) {
    try {
      const profile = await this.superheroNFT.getSuperheroProfile(address);
      
      const metadataUrl = profile.avatarUrl;
      const metadataGatewayUrl = this.convertIpfsToGateway(metadataUrl);
      
      return {
        superheroId: profile.superheroId.toString(),
        name: this.parseBytes32String(profile.name),
        bio: this.parseBytes32String(profile.bio),
        avatarUrl: metadataGatewayUrl, // Provide gateway URL for immediate use
        metadataUrl: metadataUrl, // Original IPFS URL for reference
        metadataGatewayUrl: metadataGatewayUrl, // Gateway URL for metadata fetching
        reputation: profile.reputation.toString(),
        skills: profile.skills.map((skill: string) => this.parseBytes32String(skill)).filter((s: string) => s.length > 0),
        specialities: profile.specialities.map((spec: string) => this.parseBytes32String(spec)).filter((s: string) => s.length > 0),
        flagged: profile.flagged,
        createdAt: new Date(profile.createdAt.toNumber() * 1000)
      };
    } catch (error) {
      throw new Error(`Failed to get superhero profile: ${error}`);
    }
  }

  async isSuperhero(address: string): Promise<boolean> {
    try {
      const superheroRole = await this.superheroNFT.SUPERHERO_ROLE();
      return await this.superheroNFT.hasRole(superheroRole, address);
    } catch (error) {
      return false;
    }
  }

  // Idea operations
  async createIdea(data: {
    title: string;
    categories: string[];
    ipfsHash: string;
    price: number; // in USDC
    userAddress: string;
  }) {
    try {
      // Check if user is a superhero
      const isSuperhero = await this.isSuperhero(data.userAddress);
      if (!isSuperhero) {
        throw new Error('Only superheroes can create ideas');
      }

      // Convert data to contract format
      const titleBytes32 = this.formatBytes32String(data.title);
      const categoriesBytes32 = data.categories.map(cat => this.formatBytes32String(cat));
      const priceWei = ethers.utils.parseUnits(data.price.toString(), 6); // USDC has 6 decimals

      // Create idea transaction
      const tx = await this.ideaRegistry.createIdea(
        titleBytes32,
        categoriesBytes32,
        data.ipfsHash,
        priceWei
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to create idea: ${error}`);
    }
  }

  async getIdeaDetails(ideaId: number) {
    try {
      const idea = await this.ideaRegistry.getIdea(ideaId);
      
      return {
        ideaId: idea.ideaId.toString(),
        creator: idea.creator,
        title: this.parseBytes32String(idea.title),
        categories: idea.category.map((cat: string) => this.parseBytes32String(cat)).filter((c: string) => c.length > 0),
        ipfsHash: idea.ipfsHash,
        price: ethers.utils.formatUnits(idea.price, 6),
        ratingTotal: idea.ratingTotal.toString(),
        numRaters: idea.numRaters.toString(),
        isPurchased: idea.isPurchased,
        createdAt: new Date(idea.created.toNumber() * 1000)
      };
    } catch (error) {
      throw new Error(`Failed to get idea details: ${error}`);
    }
  }

  // Admin function to grant SUPERHERO_ROLE in IdeaRegistry
  async grantSuperheroRoleInIdeaRegistry(userAddress: string) {
    try {
      console.log(`🔐 Granting SUPERHERO_ROLE in IdeaRegistry to ${userAddress}...`);
      
      // Get the SUPERHERO_ROLE hash
      const superheroRole = await this.ideaRegistry.SUPERHERO_ROLE();
      console.log(`📋 SUPERHERO_ROLE hash: ${superheroRole}`);
      
      // Grant the role
      const tx = await this.ideaRegistry.grantRole(superheroRole, userAddress);
      const receipt = await tx.wait();
      
      console.log(`✅ SUPERHERO_ROLE granted successfully: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        message: `SUPERHERO_ROLE granted to ${userAddress} in IdeaRegistry`
      };
    } catch (error) {
      console.error(`❌ Failed to grant SUPERHERO_ROLE:`, error);
      throw new Error(`Failed to grant SUPERHERO_ROLE: ${error}`);
    }
  }

  async getAllIdeas() {
    try {
      console.log('🔍 Fetching all ideas from blockchain...');
      
      // Get total number of ideas
      const totalIdeas = await this.ideaRegistry.totalIdeas();
      const total = totalIdeas.toNumber();
      
      console.log(`📊 Total ideas in contract: ${total}`);
      
      if (total === 0) {
        return [];
      }
      
      // Fetch all ideas in parallel
      const ideaPromises = [];
      for (let i = 1; i <= total; i++) {
        ideaPromises.push(this.getIdeaDetailsWithSuperhero(i));
      }
      
      const ideas = await Promise.allSettled(ideaPromises);
      const successfulIdeas = ideas
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromisedSettledResult<any>).value);
      
      console.log(`✅ Successfully fetched ${successfulIdeas.length} ideas from blockchain`);
      
      return successfulIdeas;
    } catch (error) {
      console.error('❌ Failed to get all ideas from blockchain:', error);
      throw new Error(`Failed to get all ideas: ${error}`);
    }
  }

  async getIdeaDetailsWithSuperhero(ideaId: number) {
    try {
      // Get basic idea details
      const idea = await this.getIdeaDetails(ideaId);
      
      // Get superhero info for the creator
      const superheroInfo = await this.getSuperheroByAddress(idea.creator);
      
      return {
        ...idea,
        creatorName: superheroInfo ? superheroInfo.name : null,
        creatorSuperheroId: superheroInfo ? superheroInfo.superheroId : null
      };
    } catch (error) {
      console.error(`Failed to get idea ${ideaId} with superhero info:`, error);
      // Fallback to basic idea details without superhero info
      const idea = await this.getIdeaDetails(ideaId);
      return {
        ...idea,
        creatorName: null,
        creatorSuperheroId: null
      };
    }
  }

  async getSuperheroByAddress(address: string) {
    try {
      // First check if the address has a superhero NFT
      const superheroRole = await this.superheroNFT.SUPERHERO_ROLE();
      const hasSuperheroRole = await this.superheroNFT.hasRole(superheroRole, address);
      
      if (!hasSuperheroRole) {
        return null;
      }
      
      // Get superhero details - we need to find which superhero ID belongs to this address
      // This requires checking all superhero NFTs or using events
      // For now, let's try to get it from the backend API as a fallback
      try {
        const response = await fetch(`http://localhost:3002/superheroes/${address}/profile`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            return {
              name: result.data.name,
              superheroId: result.data.superhero_id
            };
          }
        }
      } catch (apiError) {
        console.warn('Failed to fetch superhero from API:', apiError);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get superhero by address:', error);
      return null;
    }
  }

  // Marketplace operations
  async buyIdea(ideaId: number, buyerAddress: string) {
    try {
      console.log(`💰 Purchasing idea ${ideaId} for buyer ${buyerAddress}...`);
      
      // Get idea details first to check price and availability
      const ideaDetails = await this.getIdeaDetails(ideaId);
      
      if (ideaDetails.isPurchased) {
        throw new Error('Idea is already purchased');
      }
      
      const priceWei = ethers.utils.parseUnits(ideaDetails.price, 6); // USDC has 6 decimals
      console.log(`💵 Idea price: ${ideaDetails.price} USDC (${priceWei.toString()} wei)`);
      
      // Check USDC allowance and balance (this would typically be done on frontend)
      const buyerBalance = await this.mockUSDC.balanceOf(buyerAddress);
      const buyerAllowance = await this.mockUSDC.allowance(buyerAddress, CONTRACT_ADDRESSES.OptimizedMarketplace);
      
      console.log(`💰 Buyer balance: ${ethers.utils.formatUnits(buyerBalance, 6)} USDC`);
      console.log(`🔓 Buyer allowance: ${ethers.utils.formatUnits(buyerAllowance, 6)} USDC`);
      
      if (buyerBalance.lt(priceWei)) {
        throw new Error(`Insufficient USDC balance. Required: ${ideaDetails.price} USDC`);
      }
      
      if (buyerAllowance.lt(priceWei)) {
        throw new Error(`Insufficient USDC allowance. Please approve ${ideaDetails.price} USDC for the marketplace contract`);
      }
      
      // Execute purchase transaction
      const tx = await this.marketplace.buyIdea(ideaId);
      const receipt = await tx.wait();
      
      console.log(`✅ Idea purchased successfully! Transaction: ${receipt.transactionHash}`);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        ideaId,
        price: ideaDetails.price,
        seller: ideaDetails.creator,
        buyer: buyerAddress
      };
    } catch (error) {
      console.error(`❌ Failed to purchase idea ${ideaId}:`, error);
      throw new Error(`Failed to purchase idea: ${error.message || error}`);
    }
  }
  
  async checkUSDCAllowance(userAddress: string, spenderAddress: string = CONTRACT_ADDRESSES.OptimizedMarketplace) {
    try {
      const allowance = await this.mockUSDC.allowance(userAddress, spenderAddress);
      const balance = await this.mockUSDC.balanceOf(userAddress);
      
      return {
        allowance: ethers.utils.formatUnits(allowance, 6),
        balance: ethers.utils.formatUnits(balance, 6),
        allowanceWei: allowance.toString(),
        balanceWei: balance.toString()
      };
    } catch (error) {
      throw new Error(`Failed to check USDC allowance: ${error}`);
    }
  }

  async checkIdeaOwnership(ideaId: number, userAddress: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking ownership of idea ${ideaId} for user ${userAddress}`);
      
      // Get the owner of the idea NFT
      const owner = await this.ideaRegistry.ownerOf(ideaId);
      const isOwner = owner.toLowerCase() === userAddress.toLowerCase();
      
      console.log(`👤 Idea ${ideaId} owner: ${owner}`);
      console.log(`🏠 User ${userAddress} owns idea ${ideaId}: ${isOwner}`);
      
      return isOwner;
    } catch (error) {
      console.error(`❌ Failed to check ownership of idea ${ideaId}:`, error);
      // If the idea doesn't exist or there's an error, assume not owned
      return false;
    }
  }

  async getPurchaseHistory(userAddress: string): Promise<any[]> {
    try {
      console.log(`📋 Getting purchase history for user: ${userAddress}`);
      
      // Get IdeaPurchased events where the buyer is the user
      let purchases = [];
      
      try {
        // Create filter for IdeaPurchased events where user is the buyer
        const filter = this.marketplace.filters.IdeaPurchased(null, userAddress, null);
        console.log(`🔍 Querying IdeaPurchased events for buyer: ${userAddress}`);
        
        // DEBUGGING: Also check for ANY purchases of idea #2 to see if events exist
        const idea2Filter = this.marketplace.filters.IdeaPurchased(2, null, null);
        console.log(`🔍 [DEBUG] Checking for ANY purchases of idea #2...`);
        
        // Get current block number
        const currentBlock = await this.provider.getBlockNumber();
        console.log(`📊 Current block: ${currentBlock}`);
        
        // Query in chunks of 8000 blocks to stay within RPC limits
        const chunkSize = 8000;
        const totalBlocksToSearch = 100000; // Search last 100k blocks in chunks to find older purchases
        let allEvents = [];
        
        for (let i = 0; i < totalBlocksToSearch; i += chunkSize) {
          const fromBlock = Math.max(0, currentBlock - totalBlocksToSearch + i);
          const toBlock = Math.min(currentBlock, currentBlock - totalBlocksToSearch + i + chunkSize);
          
          if (fromBlock >= toBlock) break;
          
          try {
            console.log(`🔍 Querying events chunk: blocks ${fromBlock} to ${toBlock}`);
            const events = await this.marketplace.queryFilter(filter, fromBlock, toBlock);
            allEvents.push(...events);
            console.log(`📦 Found ${events.length} events in this chunk`);
            
            // Small delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (chunkError) {
            console.warn(`⚠️ Failed to query chunk ${fromBlock}-${toBlock}:`, chunkError.message);
          }
        }
        
        console.log(`📊 Found ${allEvents.length} total IdeaPurchased events for user ${userAddress}`);
        
        // DEBUGGING: Check for ANY purchases of idea #2 in smaller chunks
        try {
          console.log(`🔍 [DEBUG] Searching for ANY purchases of idea #2 in last 8k blocks...`);
          const debugFromBlock = Math.max(0, currentBlock - 8000);
          const idea2Events = await this.marketplace.queryFilter(idea2Filter, debugFromBlock, currentBlock);
          console.log(`🔍 [DEBUG] Found ${idea2Events.length} purchases of idea #2 by anyone in recent blocks`);
          
          for (const event of idea2Events) {
            const { ideaId, buyer, seller, price } = event.args;
            console.log(`🔍 [DEBUG] Idea #2 purchase: buyer=${buyer}, seller=${seller}, price=${ethers.utils.formatUnits(price, 6)} USDC, block=${event.blockNumber}`);
          }
          
          // Also check an older range to see if there are older purchases
          if (currentBlock > 50000) {
            const olderFromBlock = currentBlock - 50000;
            const olderToBlock = currentBlock - 42000;
            console.log(`🔍 [DEBUG] Checking older range for idea #2: blocks ${olderFromBlock} to ${olderToBlock}`);
            const olderEvents = await this.marketplace.queryFilter(idea2Filter, olderFromBlock, olderToBlock);
            console.log(`🔍 [DEBUG] Found ${olderEvents.length} purchases of idea #2 in older blocks`);
            
            for (const event of olderEvents) {
              const { ideaId, buyer, seller, price } = event.args;
              console.log(`🔍 [DEBUG] OLD Idea #2 purchase: buyer=${buyer}, seller=${seller}, price=${ethers.utils.formatUnits(price, 6)} USDC, block=${event.blockNumber}`);
            }
          }
        } catch (debugError) {
          console.warn(`⚠️ [DEBUG] Failed to check idea #2 purchases:`, debugError.message);
        }
        
        for (const event of allEvents) {
          console.log(`📦 Processing purchase event:`, event.args);
          
          const { ideaId, buyer, seller, price, marketplaceFee, timestamp } = event.args;
          const block = await event.getBlock();
          
          purchases.push({
            ideaId: ideaId.toNumber(),
            buyer: buyer,
            seller: seller,
            price: ethers.utils.formatUnits(price, 6), // USDC has 6 decimals
            marketplaceFee: ethers.utils.formatUnits(marketplaceFee, 6),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            eventTimestamp: timestamp.toNumber()
          });
          
          console.log(`✅ Added purchase: Idea ${ideaId} bought by ${buyer} for ${ethers.utils.formatUnits(price, 6)} USDC`);
        }
      } catch (eventError) {
        console.warn('⚠️ Failed to query IdeaPurchased events:', eventError.message);
        console.warn('⚠️ Falling back to Transfer events...');
        
        // Fallback: Check for Transfer events where the user received NFTs
        try {
          const transferFilter = this.ideaRegistry.filters.Transfer(null, userAddress, null);
          const transferEvents = await this.ideaRegistry.queryFilter(transferFilter);
          
          console.log(`🔍 Found ${transferEvents.length} transfer events to user ${userAddress}`);
          
          for (const event of transferEvents) {
            const { from, to, tokenId } = event.args;
            const block = await event.getBlock();
            
            // Skip minting events (from zero address)
            if (from === ethers.constants.AddressZero) continue;
            
            purchases.push({
              ideaId: tokenId.toNumber(),
              buyer: to,
              seller: from,
              price: '0', // Unknown price from transfer event
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: new Date(block.timestamp * 1000).toISOString()
            });
          }
        } catch (transferError) {
          console.warn('⚠️ No transfer events found either');
        }
      }
      
      // If no blockchain events found, the user has no purchase history
      if (purchases.length === 0) {
        console.log(`📋 No IdeaPurchased events found for ${userAddress} - no purchase history available`);
      }
      
      console.log(`✅ Processed ${purchases.length} purchase transactions`);
      return purchases;
      
    } catch (error) {
      console.error('❌ Failed to get purchase history:', error);
      return [];
    }
  }


  // Team operations
  async createTeam(data: {
    teamName: string;
    projectName: string;
    description: string;
    requiredMembers: number;
    requiredStake: number; // in USDC
    roles: string[];
    tags: string[];
    userAddress: string;
  }) {
    try {
      // Check if user is a superhero
      const isSuperhero = await this.isSuperhero(data.userAddress);
      if (!isSuperhero) {
        throw new Error('Only superheroes can create teams');
      }

      // Convert stake to wei
      const stakeWei = ethers.utils.parseUnits(data.requiredStake.toString(), 6);

      // Create team transaction
      const tx = await this.teamCore.createTeam(
        data.requiredMembers,
        stakeWei,
        data.teamName,
        data.description,
        data.projectName,
        data.roles,
        data.tags
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to create team: ${error}`);
    }
  }

  // Utility functions
  async getBlockNumber(): Promise<number> {
    const rpcUrls = [
      "https://lisk-sepolia.drpc.org",
      "https://endpoints.omniatech.io/v1/lisk/sepolia/public",
      "https://rpc.sepolia-api.lisk.com"
    ];
    
    for (const rpcUrl of rpcUrls) {
      try {
        const tempProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const blockNumber = await Promise.race([
          tempProvider.getBlockNumber(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 2000)
          )
        ]);
        console.log(`✅ Connected to RPC: ${rpcUrl}`);
        return blockNumber;
      } catch (error) {
        console.warn(`❌ Failed RPC: ${rpcUrl}`);
        continue;
      }
    }
    
    throw new Error(`Network connection failed: All RPC endpoints unreachable`);
  }

  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  // Transaction status
  async getTransactionStatus(txHash: string) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        confirmations: await receipt.confirmations
      };
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }

  // USDC operations
  async getUSDCBalance(address: string): Promise<string> {
    try {
      const balance = await this.mockUSDC.balanceOf(address);
      return ethers.utils.formatUnits(balance, 6); // USDC has 6 decimals
    } catch (error) {
      throw new Error(`Failed to get USDC balance: ${error}`);
    }
  }

  async approveUSDC(spender: string, amount: number): Promise<any> {
    try {
      const amountWei = ethers.utils.parseUnits(amount.toString(), 6);
      const tx = await this.mockUSDC.approve(spender, amountWei);
      return await tx.wait();
    } catch (error) {
      throw new Error(`Failed to approve USDC: ${error}`);
    }
  }

  // Marketplace operations
  async purchaseIdea(ideaId: number, userAddress: string) {
    try {
      // Check if user is a superhero
      const isSuperhero = await this.isSuperhero(userAddress);
      if (!isSuperhero) {
        throw new Error('Only superheroes can purchase ideas');
      }

      // Purchase idea through marketplace
      const tx = await this.marketplace.purchaseIdea(ideaId);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to purchase idea: ${error}`);
    }
  }

  async getMarketplaceStats() {
    try {
      const [totalIdeas, totalPurchases] = await Promise.all([
        this.ideaRegistry.totalIdeas(),
        // Add marketplace total purchases if available
        Promise.resolve(0) // Placeholder
      ]);

      return {
        totalIdeas: totalIdeas.toString(),
        totalPurchases: totalPurchases.toString()
      };
    } catch (error) {
      throw new Error(`Failed to get marketplace stats: ${error}`);
    }
  }

  // Event listening (for real-time updates)
  setupEventListeners(callbacks: {
    onSuperheroCreated?: (event: any) => void;
    onIdeaCreated?: (event: any) => void;
    onTeamCreated?: (event: any) => void;
    onIdeaPurchased?: (event: any) => void;
  }) {
    if (callbacks.onSuperheroCreated) {
      this.superheroNFT.on('CreateSuperhero', callbacks.onSuperheroCreated);
    }

    if (callbacks.onIdeaCreated) {
      this.ideaRegistry.on('CreateIdea', callbacks.onIdeaCreated);
    }

    if (callbacks.onTeamCreated) {
      this.teamCore.on('TeamCreated', callbacks.onTeamCreated);
    }

    if (callbacks.onIdeaPurchased) {
      this.marketplace.on('IdeaPurchased', callbacks.onIdeaPurchased);
    }
  }

  // Get all available functions from contracts (for debugging)
  getContractMethods() {
    return {
      superheroNFT: Object.keys(this.superheroNFT.functions),
      ideaRegistry: Object.keys(this.ideaRegistry.functions),
      teamCore: Object.keys(this.teamCore.functions),
      marketplace: Object.keys(this.marketplace.functions),
      mockUSDC: Object.keys(this.mockUSDC.functions)
    };
  }
}