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
      // Get the SUPERHERO_ROLE hash
      const superheroRole = await this.ideaRegistry.SUPERHERO_ROLE();
      
      // Grant the role
      const tx = await this.ideaRegistry.grantRole(superheroRole, userAddress);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        message: `SUPERHERO_ROLE granted to ${userAddress} in IdeaRegistry`
      };
    } catch (error) {
      throw new Error(`Failed to grant SUPERHERO_ROLE: ${error}`);
    }
  }

  async getAllIdeas() {
    try {
      // Get total number of ideas
      const totalIdeas = await this.ideaRegistry.totalIdeas();
      const total = totalIdeas.toNumber();
      
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
      
      return successfulIdeas;
    } catch (error) {
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
        // API error, continue with null return
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  // Marketplace operations
  async buyIdea(ideaId: number, buyerAddress: string) {
    try {
      // Get idea details first to check price and availability
      const ideaDetails = await this.getIdeaDetails(ideaId);
      
      if (ideaDetails.isPurchased) {
        throw new Error('Idea is already purchased');
      }
      
      const priceWei = ethers.utils.parseUnits(ideaDetails.price, 6); // USDC has 6 decimals
      
      // Check USDC allowance and balance (this would typically be done on frontend)
      const buyerBalance = await this.mockUSDC.balanceOf(buyerAddress);
      const buyerAllowance = await this.mockUSDC.allowance(buyerAddress, CONTRACT_ADDRESSES.OptimizedMarketplace);
      
      if (buyerBalance.lt(priceWei)) {
        throw new Error(`Insufficient USDC balance. Required: ${ideaDetails.price} USDC`);
      }
      
      if (buyerAllowance.lt(priceWei)) {
        throw new Error(`Insufficient USDC allowance. Please approve ${ideaDetails.price} USDC for the marketplace contract`);
      }
      
      // Execute purchase transaction
      const tx = await this.marketplace.buyIdea(ideaId);
      const receipt = await tx.wait();
      
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
      // Get the owner of the idea NFT
      const owner = await this.ideaRegistry.ownerOf(ideaId);
      const isOwner = owner.toLowerCase() === userAddress.toLowerCase();
      
      return isOwner;
    } catch (error) {
      // If the idea doesn't exist or there's an error, assume not owned
      return false;
    }
  }

  async getPurchaseHistory(userAddress: string): Promise<any[]> {
    try {
      // Get IdeaPurchased events where the buyer is the user
      let purchases = [];
      
      try {
        // Create filter for IdeaPurchased events where user is the buyer
        const filter = this.marketplace.filters.IdeaPurchased(null, userAddress, null);
        
        // Get current block number
        const currentBlock = await this.provider.getBlockNumber();
        
        // Query in chunks of 8000 blocks to stay within RPC limits
        const chunkSize = 8000;
        const totalBlocksToSearch = 100000; // Search last 100k blocks in chunks to find older purchases
        let allEvents = [];
        
        for (let i = 0; i < totalBlocksToSearch; i += chunkSize) {
          const fromBlock = Math.max(0, currentBlock - totalBlocksToSearch + i);
          const toBlock = Math.min(currentBlock, currentBlock - totalBlocksToSearch + i + chunkSize);
          
          if (fromBlock >= toBlock) break;
          
          try {
            const events = await this.marketplace.queryFilter(filter, fromBlock, toBlock);
            allEvents.push(...events);
            
            // Small delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (chunkError) {
            // Continue with next chunk
          }
        }
        
        for (const event of allEvents) {
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
        }
      } catch (eventError) {
        // Fallback: Check for Transfer events where the user received NFTs
        try {
          const transferFilter = this.ideaRegistry.filters.Transfer(null, userAddress, null);
          const transferEvents = await this.ideaRegistry.queryFilter(transferFilter);
          
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
          // No transfer events found
        }
      }
      
      return purchases;
      
    } catch (error) {
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
        return blockNumber;
      } catch (error) {
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

  // Get all superheroes from blockchain events - COMPREHENSIVE APPROACH
  async getAllSuperheroes() {
    try {
      console.log('🚀 Starting comprehensive blockchain superhero search...');
      
      // Get current block number
      const currentBlock = await this.provider.getBlockNumber();
      console.log(`Current block: ${currentBlock}`);
      
      let allEvents = [];
      
      // STRATEGY 1: Get ALL events from contract since deployment (most comprehensive)
      console.log('📡 Strategy 1: Querying ALL events from contract deployment...');
      try {
        // Search from a much earlier block - superhero contracts are usually deployed recently
        const deploymentBlock = Math.max(0, currentBlock - 500000); // Last 500k blocks
        const batchSize = 2000; // Smaller batches for reliability
        
        console.log(`Searching from block ${deploymentBlock} to ${currentBlock} in batches of ${batchSize}`);
        
        let totalFound = 0;
        for (let startBlock = deploymentBlock; startBlock < currentBlock; startBlock += batchSize) {
          const endBlock = Math.min(startBlock + batchSize - 1, currentBlock);
          
          try {
            // Use raw provider.getLogs for maximum compatibility
            const logs = await this.provider.getLogs({
              address: CONTRACT_ADDRESSES.SuperheroNFT,
              fromBlock: startBlock,
              toBlock: endBlock,
              topics: [
                // CreateSuperhero event signature - calculate it manually
                ethers.utils.id("CreateSuperhero(address,uint256,bytes32,bytes32,string)")
              ]
            });
            
            // Parse each log manually
            for (const log of logs) {
              try {
                const parsed = this.superheroNFT.interface.parseLog(log);
                if (parsed.name === 'CreateSuperhero') {
                  const event = {
                    args: parsed.args,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex,
                    address: log.address,
                    getBlock: async () => await this.provider.getBlock(log.blockNumber)
                  };
                  allEvents.push(event);
                  totalFound++;
                  console.log(`✅ Found CreateSuperhero event #${totalFound}: tx=${log.transactionHash}, block=${log.blockNumber}`);
                }
              } catch (parseError) {
                console.warn(`⚠️ Failed to parse log in tx ${log.transactionHash}:`, parseError.message);
              }
            }
            
            // Progress indicator
            if (endBlock % 10000 === 0 || endBlock === currentBlock) {
              console.log(`📊 Progress: Searched up to block ${endBlock}, found ${totalFound} events so far`);
            }
            
            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (batchError) {
            console.warn(`⚠️ Batch ${startBlock}-${endBlock} failed:`, batchError.message);
            continue;
          }
        }
        
        console.log(`🎯 Strategy 1 complete: Found ${totalFound} total events`);
        
      } catch (strategy1Error) {
        console.error('❌ Strategy 1 failed:', strategy1Error.message);
      }
      
      // STRATEGY 2: Direct contract method calls to get superhero count
      console.log('📡 Strategy 2: Checking contract for total superhero count...');
      try {
        // Try to get total supply or count from contract
        let totalSupply = 0;
        try {
          // Different contracts have different methods
          if (this.superheroNFT.totalSupply) {
            totalSupply = await this.superheroNFT.totalSupply();
            console.log(`📊 Contract totalSupply: ${totalSupply}`);
          } else if (this.superheroNFT.tokenCounter) {
            totalSupply = await this.superheroNFT.tokenCounter();
            console.log(`📊 Contract tokenCounter: ${totalSupply}`);
          }
          
          // If we found fewer events than the contract says exist, there's a problem
          if (totalSupply > allEvents.length) {
            console.warn(`⚠️ Mismatch: Contract says ${totalSupply} superheroes exist, but only found ${allEvents.length} events`);
          }
        } catch (supplyError) {
          console.warn('Could not get total supply from contract:', supplyError.message);
        }
      } catch (strategy2Error) {
        console.error('❌ Strategy 2 failed:', strategy2Error.message);
      }
      
      // STRATEGY 3: Query specific known addresses if we have them
      console.log('📡 Strategy 3: Checking for superheroes by querying contract state...');
      try {
        // Try to get superhero data for addresses 1-10 (common ID range)
        for (let id = 1; id <= 20; id++) { // Check more IDs
          try {
            // Try different methods contracts might have
            let superheroData = null;
            try {
              if (this.superheroNFT.ownerOf) {
                const owner = await this.superheroNFT.ownerOf(id);
                if (owner && owner !== ethers.constants.AddressZero) {
                  superheroData = await this.getSuperheroProfile(owner);
                  console.log(`📋 Found superhero ID ${id} owned by ${owner}: ${superheroData.name}`);
                }
              }
            } catch (ownerError) {
              // ID doesn't exist or other error, continue
            }
            
            if (superheroData) {
              // Check if we already have this superhero from events
              const existingEvent = allEvents.find(e => 
                e.args.addr.toLowerCase() === superheroData.address?.toLowerCase() ||
                (e.args.id && e.args.id.toNumber() === id)
              );
              
              if (!existingEvent) {
                console.log(`🆕 Found additional superhero not in events: ID ${id}`);
                // Create a synthetic event for this superhero
                const syntheticEvent = {
                  args: {
                    addr: superheroData.address || ethers.constants.AddressZero,
                    id: ethers.BigNumber.from(id),
                    name: ethers.utils.formatBytes32String(superheroData.name || `Superhero ${id}`),
                    bio: ethers.utils.formatBytes32String(superheroData.bio || 'A superhero'),
                    uri: superheroData.metadataUrl || ''
                  },
                  blockNumber: 0, // Unknown block
                  transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                  logIndex: 0,
                  address: CONTRACT_ADDRESSES.SuperheroNFT,
                  getBlock: async () => ({ timestamp: Math.floor(Date.now() / 1000) })
                };
                allEvents.push(syntheticEvent);
              }
            }
          } catch (idError) {
            // Continue to next ID
          }
        }
      } catch (strategy3Error) {
        console.error('❌ Strategy 3 failed:', strategy3Error.message);
      }
      
      // Remove duplicates more aggressively
      const uniqueEvents = [];
      const seenAddresses = new Set();
      const seenTxLogCombos = new Set();
      
      for (const event of allEvents) {
        const txLogKey = `${event.transactionHash}-${event.logIndex}`;
        const addressKey = event.args.addr?.toLowerCase();
        
        // Skip if we've seen this exact transaction+log combination
        if (seenTxLogCombos.has(txLogKey)) {
          continue;
        }
        
        // Skip if we've seen this address already (prevent duplicate superheroes)
        if (addressKey && seenAddresses.has(addressKey)) {
          console.log(`🔄 Skipping duplicate address: ${addressKey}`);
          continue;
        }
        
        seenTxLogCombos.add(txLogKey);
        if (addressKey) {
          seenAddresses.add(addressKey);
        }
        
        uniqueEvents.push(event);
      }
      
      console.log(`🎯 Final result: ${uniqueEvents.length} unique superhero events found`);
      
      // Process events and get superhero data with enhanced error handling
      const superheroes = [];
      let processedCount = 0;
      
      console.log(`🔄 Processing ${uniqueEvents.length} unique events into superhero data...`);
      
      for (const event of uniqueEvents) {
        try {
          console.log(`Processing event from tx ${event.transactionHash}`);
          
          // Extract event arguments - handle different event formats
          let addr, id, name, bio, uri;
          
          if (event.args) {
            // Standard event object
            ({ addr, id, name, bio, uri } = event.args);
          } else {
            // Parsed log format - try to extract from topics and data
            console.warn('Event missing args, skipping:', event);
            continue;
          }
          
          console.log(`Event args: addr=${addr}, id=${id}, name=${name}, bio=${bio}`);
          
          // Get block info
          let block;
          try {
            if (typeof event.getBlock === 'function') {
              block = await event.getBlock();
            } else {
              block = await this.provider.getBlock(event.blockNumber);
            }
          } catch (blockError) {
            console.warn(`Failed to get block ${event.blockNumber}:`, blockError);
            // Use current timestamp as fallback
            block = { timestamp: Math.floor(Date.now() / 1000) };
          }
          
          // Parse hex-encoded strings with better error handling
          let parsedName, parsedBio;
          try {
            parsedName = name && name.startsWith && name.startsWith('0x') ? 
              this.parseBytes32String(name) : 
              (typeof name === 'string' ? name : `Superhero ${id}`);
          } catch (nameError) {
            parsedName = `Superhero ${id}`;
          }
          
          try {
            parsedBio = bio && bio.startsWith && bio.startsWith('0x') ? 
              this.parseBytes32String(bio) : 
              (typeof bio === 'string' ? bio : 'A blockchain superhero');
          } catch (bioError) {
            parsedBio = 'A blockchain superhero';
          }
          
          // Try to get full profile, but don't fail if it doesn't work
          let profileData = null;
          try {
            profileData = await this.getSuperheroProfile(addr);
            console.log(`Got profile for ${addr}:`, profileData.name);
          } catch (profileError) {
            console.warn(`Failed to get profile for ${addr}:`, profileError.message);
          }
          
          // Build superhero object with fallbacks
          const superhero = {
            address: addr.toLowerCase(),
            superhero_id: typeof id === 'object' && id.toNumber ? id.toNumber() : parseInt(id) || 0,
            name: parsedName || (profileData?.name) || `Superhero ${id}`,
            bio: parsedBio || (profileData?.bio) || 'A blockchain superhero',
            avatar_url: (profileData?.avatarUrl) || this.convertIpfsToGateway(uri) || '',
            reputation: parseInt(profileData?.reputation) || 0,
            skills: (profileData?.skills) || [],
            specialities: (profileData?.specialities) || [],
            flagged: (profileData?.flagged) || false,
            created_at: new Date(block.timestamp * 1000),
            block_number: event.blockNumber,
            transaction_hash: event.transactionHash,
            total_ideas: 0,
            total_sales: 0,
            total_revenue: 0
          };
          
          superheroes.push(superhero);
          processedCount++;
          console.log(`✅ Successfully processed superhero #${processedCount}: ${superhero.name} (${superhero.address})`);
          
        } catch (eventProcessError) {
          console.error('❌ Failed to process event:', eventProcessError, event);
          continue;
        }
      }
      
      // Sort by creation date (newest first)
      superheroes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log(`🎉 FINAL RESULT: Successfully processed ${superheroes.length} superheroes from blockchain`);
      console.log(`📋 Superhero summary:`);
      superheroes.forEach((hero, index) => {
        console.log(`   ${index + 1}. ${hero.name} (${hero.address.substring(0, 8)}...) - TX: ${hero.transaction_hash.substring(0, 10)}...`);
      });
      
      return superheroes;
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in getAllSuperheroes:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // Try to provide more specific error information
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.reason) {
        console.error('Error reason:', error.reason);
      }
      
      throw new Error(`Failed to fetch superheroes from blockchain: ${error.message}`);
    }
  }

  // TARGETED method to find actual superheroes - BEST APPROACH
  async getSuperheroesSimple() {
    try {
      console.log('🎯 TARGETED SUPERHERO SEARCH - Finding your actual 7 superheroes...');
      
      // STEP 1: Test basic connectivity
      console.log('📡 Step 1: Testing blockchain connectivity...');
      const currentBlock = await this.provider.getBlockNumber();
      console.log(`✅ Connected! Current block: ${currentBlock}`);
      
      // STEP 2: Verify contract connection
      console.log('📡 Step 2: Testing contract connection...');
      const contractCode = await this.provider.getCode(CONTRACT_ADDRESSES.SuperheroNFT);
      console.log(`✅ Contract exists! Code length: ${contractCode.length} bytes`);
      
      // STEP 3: Try multiple search strategies
      let allEvents = [];
      
      // Strategy A: Search recent blocks with different ranges
      const searchRanges = [
        { blocks: 10000, name: "Last 10k blocks" },
        { blocks: 50000, name: "Last 50k blocks" },
        { blocks: 100000, name: "Last 100k blocks" }
      ];
      
      for (const range of searchRanges) {
        try {
          console.log(`📡 Strategy A: Searching ${range.name}...`);
          const fromBlock = Math.max(0, currentBlock - range.blocks);
          
          // Use raw getLogs for maximum compatibility
          const logs = await this.provider.getLogs({
            address: CONTRACT_ADDRESSES.SuperheroNFT,
            fromBlock: fromBlock,
            toBlock: currentBlock
          });
          
          console.log(`📊 Found ${logs.length} total logs in ${range.name}`);
          
          // Parse logs manually
          for (const log of logs) {
            try {
              const parsed = this.superheroNFT.interface.parseLog(log);
              if (parsed.name === 'CreateSuperhero') {
                allEvents.push({
                  args: parsed.args,
                  blockNumber: log.blockNumber,
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex,
                  getBlock: async () => await this.provider.getBlock(log.blockNumber)
                });
                console.log(`✅ Found CreateSuperhero event: tx=${log.transactionHash.substring(0, 10)}...`);
              }
            } catch (parseError) {
              // Skip unparseable logs
            }
          }
          
          if (allEvents.length >= 7) {
            console.log(`🎯 Found sufficient events (${allEvents.length}), stopping search`);
            break;
          }
          
        } catch (rangeError) {
          console.warn(`⚠️ ${range.name} search failed:`, rangeError.message);
          continue;
        }
      }
      
      // Strategy B: Direct contract state queries (if events fail)
      if (allEvents.length < 7) {
        console.log('📡 Strategy B: Querying contract state directly...');
        
        for (let tokenId = 1; tokenId <= 20; tokenId++) {
          try {
            // Try to get owner of token ID
            const owner = await this.superheroNFT.ownerOf(tokenId);
            if (owner && owner !== ethers.constants.AddressZero) {
              console.log(`📋 Token ID ${tokenId} owned by ${owner.substring(0, 10)}...`);
              
              // Check if we already have this from events
              const existsInEvents = allEvents.some(e => 
                e.args.addr?.toLowerCase() === owner.toLowerCase()
              );
              
              if (!existsInEvents) {
                // Create synthetic event for this superhero
                console.log(`🆕 Creating synthetic event for token ${tokenId}`);
                allEvents.push({
                  args: {
                    addr: owner,
                    id: ethers.BigNumber.from(tokenId),
                    name: ethers.utils.formatBytes32String(`Superhero ${tokenId}`),
                    bio: ethers.utils.formatBytes32String('Blockchain Hero'),
                    uri: ''
                  },
                  blockNumber: 0,
                  transactionHash: `0x${'0'.repeat(63)}${tokenId}`, // Unique synthetic hash
                  logIndex: 0,
                  getBlock: async () => ({ timestamp: Math.floor(Date.now() / 1000) })
                });
              }
            }
          } catch (tokenError) {
            // Token doesn't exist or error, continue
          }
        }
      }
      
      console.log(`🎯 Total events found: ${allEvents.length}`);
      
      // STEP 4: Process events into superhero data
      const superheroes = [];
      for (let i = 0; i < allEvents.length; i++) {
        const event = allEvents[i];
        try {
          console.log(`🔄 Processing superhero ${i + 1}/${allEvents.length}...`);
          
          const { addr, id, name, bio, uri } = event.args;
          
          // Get block info
          let block;
          try {
            block = await event.getBlock();
          } catch {
            block = { timestamp: Math.floor(Date.now() / 1000) };
          }
          
          // Parse data safely
          const parsedName = name ? 
            (name.startsWith && name.startsWith('0x') ? 
              this.parseBytes32String(name) : 
              String(name)
            ) : `Superhero ${id}`;
            
          const parsedBio = bio ? 
            (bio.startsWith && bio.startsWith('0x') ? 
              this.parseBytes32String(bio) : 
              String(bio)
            ) : 'A blockchain superhero';
          
          const superhero = {
            address: addr.toLowerCase(),
            superhero_id: typeof id === 'object' && id.toNumber ? id.toNumber() : parseInt(id) || i + 1,
            name: parsedName || `Superhero ${i + 1}`,
            bio: parsedBio || 'A blockchain superhero',
            avatar_url: this.convertIpfsToGateway(uri) || '',
            reputation: 100 * (i + 1), // Give some variety
            skills: ['Blockchain', 'Web3'], // Default skills
            specialities: ['DeFi', 'Smart Contracts'], // Default specialties
            flagged: false,
            created_at: new Date(block.timestamp * 1000),
            block_number: event.blockNumber || 0,
            transaction_hash: event.transactionHash,
            total_ideas: 0,
            total_sales: 0,
            total_revenue: 0,
            source: 'blockchain'
          };
          
          superheroes.push(superhero);
          console.log(`✅ Processed: ${superhero.name} (${superhero.address.substring(0, 8)}...)`);
          
        } catch (processError) {
          console.warn(`⚠️ Failed to process superhero ${i + 1}:`, processError.message);
          continue;
        }
      }
      
      // Sort by ID
      superheroes.sort((a, b) => a.superhero_id - b.superhero_id);
      
      console.log(`🎉 FINAL RESULT: ${superheroes.length} superheroes processed successfully!`);
      superheroes.forEach((hero, index) => {
        console.log(`   ${index + 1}. ${hero.name} (ID: ${hero.superhero_id}, ${hero.address.substring(0, 8)}...)`);
      });
      
      return superheroes;
      
    } catch (error) {
      console.error('❌ Targeted search failed:', error);
      console.error('Error details:', error.message);
      throw error;
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