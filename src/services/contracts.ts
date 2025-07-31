import { ethers } from 'ethers';

// Contract addresses from your deployment
export const CONTRACT_ADDRESSES = {
  SuperheroNFT: '0xd8EcF5D6D77bF2852c5e9313F87f31cc99c38dE9',
  IdeaRegistry: '0xecB93f03515DE67EA43272797Ea8eDa059985894',
  TeamCore: '0xed852d3Ef6a5B57005acDf1054d15af1CF09489c',
  TeamMilestones: '0xf31e7B8E0a820DCd1a283315DB0aD641dFe7Db84',
  OptimizedMarketplace: '0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF',
  MockUSDC: '0x47B320A4ED999989AE3065Be28B208f177a7546D'
};

// Contract ABIs (simplified for key functions)
const IDEA_REGISTRY_ABI = [
  "function createIdea(bytes32 _title, bytes32[] _category, string _ipfsHash, uint256 _price)",
  "function getIdea(uint256 _ideaId) view returns (tuple(uint256 ideaId, address creator, bytes32 title, bytes32[] category, string ipfsHash, uint256 price, uint256 ratingTotal, uint256 numRaters, bool isPurchased, uint256 created))",
  "function totalIdeas() view returns (uint256)",
  "event CreateIdea(address indexed creator, uint256 indexed ideaId, bytes32 title, uint256 price)"
];

const SUPERHERO_NFT_ABI = [
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function SUPERHERO_ROLE() view returns (bytes32)"
];

export class ContractService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private ideaRegistry: ethers.Contract | null = null;
  private superheroNFT: ethers.Contract | null = null;

  constructor() {
    // Initialize provider in connect() method instead
  }

  async connect(): Promise<{ address: string; chainId: number }> {
    // Check if MetaMask is available
    if (!window.ethereum) {
      throw new Error('No Web3 provider found. Please install MetaMask.');
    }

    try {
      // Initialize provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      // Request account access
      await this.provider.send('eth_requestAccounts', []);
      
      this.signer = this.provider.getSigner();
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();

      // Check if we're on Lisk Sepolia
      if (network.chainId !== 4202) {
        throw new Error('Please switch to Lisk Sepolia network (Chain ID: 4202)');
      }

      // Initialize contracts
      this.ideaRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.IdeaRegistry,
        IDEA_REGISTRY_ABI,
        this.signer
      );

      this.superheroNFT = new ethers.Contract(
        CONTRACT_ADDRESSES.SuperheroNFT,
        SUPERHERO_NFT_ABI,
        this.signer
      );

      return { address, chainId: network.chainId };

    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Please connect your wallet to continue.');
      } else if (error.code === -32002) {
        throw new Error('Please check MetaMask - there may be a pending connection request.');
      } else {
        throw new Error(`Failed to connect: ${error.message || error}`);
      }
    }
  }

  private formatBytes32String(str: string): string {
    return ethers.utils.formatBytes32String(str);
  }

  async isSuperhero(address: string): Promise<boolean> {
    if (!this.superheroNFT) {
      throw new Error('Superhero contract not initialized');
    }

    try {
      const superheroRole = await this.superheroNFT.SUPERHERO_ROLE();
      return await this.superheroNFT.hasRole(superheroRole, address);
    } catch (error) {
      return false;
    }
  }

  async createIdea(data: {
    title: string;
    categories: string[];
    ipfsHash: string;
    price: number; // in USDC
  }): Promise<{
    transactionHash: string;
    blockNumber: number;
    ideaId?: number;
  }> {
    if (!this.ideaRegistry || !this.signer) {
      throw new Error('Contract not initialized. Call connect() first.');
    }

    // Validate user is superhero
    const userAddress = await this.signer.getAddress();
    const isSuperhero = await this.isSuperhero(userAddress);
    if (!isSuperhero) {
      throw new Error('Only superheroes can create ideas');
    }

    try {
      // Convert data to contract format
      const titleBytes32 = this.formatBytes32String(data.title);
      const categoriesBytes32 = data.categories.map(cat => this.formatBytes32String(cat));
      const priceWei = ethers.utils.parseUnits(data.price.toString(), 6); // USDC has 6 decimals

      // Call contract
      const tx = await this.ideaRegistry.createIdea(
        titleBytes32,
        categoriesBytes32,
        data.ipfsHash,
        priceWei
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      // Extract idea ID from event logs
      let ideaId: number | undefined;
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.ideaRegistry.interface.parseLog(log);
          if (parsedLog.name === 'CreateIdea') {
            ideaId = parsedLog.args.ideaId.toNumber();
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
        }
      }

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        ideaId
      };

    } catch (error: any) {
      console.error('❌ Contract call failed:', error);
      
      // Handle common errors
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction would fail. Please check your superhero status and try again.');
      } else if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user.');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient ETH for gas fees.');
      } else {
        throw new Error(`Contract call failed: ${error.message || error}`);
      }
    }
  }

  async getIdeaDetails(ideaId: number) {
    if (!this.ideaRegistry) {
      throw new Error('Contract not initialized');
    }

    try {
      const idea = await this.ideaRegistry.getIdea(ideaId);
      
      return {
        ideaId: idea.ideaId.toString(),
        creator: idea.creator,
        title: ethers.utils.parseBytes32String(idea.title),
        categories: idea.category
          .map((cat: string) => ethers.utils.parseBytes32String(cat))
          .filter((c: string) => c.length > 0),
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

  async getTotalIdeas(): Promise<number> {
    if (!this.ideaRegistry) {
      throw new Error('Contract not initialized');
    }

    try {
      const total = await this.ideaRegistry.totalIdeas();
      return total.toNumber();
    } catch (error) {
      throw new Error(`Failed to get total ideas: ${error}`);
    }
  }

  // Utility function to check if MetaMask is installed
  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Utility function to request network switch
  async switchToLiskSepolia(): Promise<void> {
    if (!this.provider) {
      throw new Error('No Web3 provider found');
    }

    try {
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: '0x106A' } // 4202 in hex
      ]);
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await this.provider.send('wallet_addEthereumChain', [
          {
            chainId: '0x106A',
            chainName: 'Lisk Sepolia',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://rpc.sepolia-api.lisk.com'],
            blockExplorerUrls: ['https://sepolia-blockscout.lisk.com']
          }
        ]);
      } else {
        throw switchError;
      }
    }
  }
}

// Create singleton instance
export const contractService = new ContractService();