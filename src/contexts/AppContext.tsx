import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  reputation: number;
  walletConnected: boolean;
  balance: number;
}

interface Builder {
  id: number;
  name: string;
  username: string;
  avatar: string;
  level: number;
  reputation: number;
  specialties: string[];
  achievements: string[];
  teamsFormed: number;
  ideasMinted: number;
  bgGradient: string;
  location: string;
  joinedDate: string;
  bio: string;
  skills: string[];
  currentProjects: number;
  followers: number;
  following: number;
  isOnline: boolean;
  featured: boolean;
  pixelColor: string;
  rating: number;
  totalRatings: number;
  userRating?: number;
}

interface BuilderRating {
  builderId: number;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  creator: string;
  avatar: string;
  price: string;
  likes: number;
  views: number;
  isLocked: boolean;
  category: string;
  tags: string[];
  createdAt: string;
  featured: boolean;
  pixelColor: string;
  isLiked?: boolean;
  isOwned?: boolean;
  categories: string[]; // Multiple categories from mint form
  attachments?: string[]; // File attachments
  isSold?: boolean; // Track if idea has been sold
  soldDate?: string; // When it was sold
  soldPrice?: string; // Final sale price
}

interface SuperheroData {
  name: string;
  bio: string;
  avatarUrl: string;
  createdAt: number;
  reputation: number;
  specialties: string[];
  skills: string[];
  location: string;
}

interface AppContextType {
  user: User | null;
  ideas: Idea[];
  builders: Builder[];
  builderRatings: BuilderRating[];
  connectedWallet: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  likeIdea: (ideaId: number) => void;
  purchaseIdea: (ideaId: number) => void;
  mintNewIdea: (idea: Omit<Idea, 'id' | 'likes' | 'views' | 'createdAt'>) => void;
  rateBuilder: (builderId: number, rating: number, review?: string) => void;
  getBuilderRating: (builderId: number) => number;
  createSuperhero: (data: SuperheroData) => Promise<Builder>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const initialBuilders: Builder[] = [
  {
    id: 1,
    name: 'Alex Chen',
    username: '@alexbuilds',
    avatar: '👨‍💻',
    level: 42,
    reputation: 2850,
    specialties: ['DeFi', 'Smart Contracts', 'Solidity'],
    achievements: ['First Mint', 'Team Player', 'Innovation Leader', 'Code Master'],
    teamsFormed: 12,
    ideasMinted: 8,
    bgGradient: 'from-sunset-coral/20 to-sky-blue/20',
    location: 'San Francisco, CA',
    joinedDate: 'Jan 2024',
    bio: 'Passionate DeFi developer with 5+ years of experience building innovative blockchain solutions.',
    skills: ['Solidity', 'React', 'Node.js', 'Web3.js'],
    currentProjects: 3,
    followers: 1240,
    following: 340,
    isOnline: true,
    featured: true,
    pixelColor: 'from-blue-400 to-purple-500',
    rating: 4.8,
    totalRatings: 156,
  },
  {
    id: 2,
    name: 'Sarah Kim',
    username: '@sarahcodes',
    avatar: '👩‍🎨',
    level: 38,
    reputation: 2340,
    specialties: ['UI/UX', 'Frontend', 'Design Systems'],
    achievements: ['Design Master', 'Community Builder', 'Pixel Artist', 'Mentor'],
    teamsFormed: 9,
    ideasMinted: 15,
    bgGradient: 'from-moss-green/20 to-sunset-coral/20',
    location: 'New York, NY',
    joinedDate: 'Feb 2024',
    bio: 'Creative designer focused on making Web3 accessible through beautiful user experiences.',
    skills: ['Figma', 'React', 'Tailwind', 'Framer'],
    currentProjects: 5,
    followers: 890,
    following: 520,
    isOnline: false,
    featured: true,
    pixelColor: 'from-pink-400 to-rose-500',
    rating: 4.6,
    totalRatings: 89,
  },
  {
    id: 3,
    name: 'Marcus Johnson',
    username: '@marcusdev',
    avatar: '🚀',
    level: 55,
    reputation: 3420,
    specialties: ['Blockchain', 'Backend', 'Architecture'],
    achievements: ['Code Ninja', 'Mentor', 'Tech Lead', 'Pioneer'],
    teamsFormed: 18,
    ideasMinted: 6,
    bgGradient: 'from-sky-blue/20 to-moss-green/20',
    location: 'London, UK',
    joinedDate: 'Dec 2023',
    bio: 'Senior blockchain architect with expertise in scalable Web3 infrastructure.',
    skills: ['Rust', 'Go', 'Docker', 'Kubernetes'],
    currentProjects: 2,
    followers: 1560,
    following: 280,
    isOnline: true,
    featured: true,
    pixelColor: 'from-green-400 to-emerald-500',
    rating: 4.9,
    totalRatings: 203,
  },
  {
    id: 4,
    name: 'Luna Rodriguez',
    username: '@lunacrypto',
    avatar: '🌙',
    level: 33,
    reputation: 1890,
    specialties: ['GameFi', 'NFTs', 'Community'],
    achievements: ['Game Master', 'NFT Creator', 'Community Leader'],
    teamsFormed: 7,
    ideasMinted: 12,
    bgGradient: 'from-sunset-coral/20 to-moss-green/20',
    location: 'Barcelona, Spain',
    joinedDate: 'Mar 2024',
    bio: 'GameFi enthusiast building the future of play-to-earn experiences.',
    skills: ['Unity', 'C#', 'Solidity', 'Blender'],
    currentProjects: 4,
    followers: 670,
    following: 450,
    isOnline: true,
    featured: false,
    pixelColor: 'from-indigo-400 to-purple-500',
    rating: 4.4,
    totalRatings: 67,
  },
  {
    id: 5,
    name: 'David Park',
    username: '@davidbuilds',
    avatar: '⚡',
    level: 29,
    reputation: 1560,
    specialties: ['Mobile', 'React Native', 'Flutter'],
    achievements: ['Mobile Expert', 'Fast Learner', 'Team Builder'],
    teamsFormed: 5,
    ideasMinted: 9,
    bgGradient: 'from-sky-blue/20 to-sunset-coral/20',
    location: 'Seoul, South Korea',
    joinedDate: 'Apr 2024',
    bio: 'Mobile developer bringing Web3 to mobile platforms worldwide.',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
    currentProjects: 3,
    followers: 420,
    following: 380,
    isOnline: false,
    featured: false,
    pixelColor: 'from-yellow-400 to-orange-500',
    rating: 4.2,
    totalRatings: 34,
  },
  {
    id: 6,
    name: 'Emma Wilson',
    username: '@emmaweb3',
    avatar: '🎯',
    level: 46,
    reputation: 2680,
    specialties: ['Product', 'Strategy', 'Growth'],
    achievements: ['Product Leader', 'Growth Hacker', 'Strategist', 'Connector'],
    teamsFormed: 14,
    ideasMinted: 4,
    bgGradient: 'from-moss-green/20 to-sky-blue/20',
    location: 'Toronto, Canada',
    joinedDate: 'Jan 2024',
    bio: 'Product strategist helping Web3 projects achieve product-market fit.',
    skills: ['Product Management', 'Analytics', 'Growth', 'Strategy'],
    currentProjects: 6,
    followers: 980,
    following: 290,
    isOnline: true,
    featured: false,
    pixelColor: 'from-cyan-400 to-teal-500',
    rating: 4.7,
    totalRatings: 112,
  },
];

const initialIdeas: Idea[] = [
  {
    id: 1,
    title: 'DeFi Social Trading Platform',
    description: 'Revolutionary platform combining social media with decentralized trading. Users can follow top traders, copy their strategies, and earn rewards through social interactions.',
    creator: 'Alex Chen',
    avatar: '👨‍💻',
    price: '2.5 ETH',
    likes: 42,
    views: 1234,
    isLocked: false,
    category: 'DeFi',
    tags: ['DeFi', 'Trading', 'Social'],
    categories: ['DeFi', 'Social'],
    createdAt: '2 days ago',
    featured: true,
    pixelColor: 'from-blue-400 to-purple-500',
    isSold: true,
    soldDate: '1 day ago',
    soldPrice: '2.5 ETH',
  },
  {
    id: 2,
    title: 'NFT Fitness Gamification',
    description: 'Turn your workout routine into an engaging NFT collection game. Earn unique fitness NFTs based on your achievements and compete with friends.',
    creator: 'Luna Rodriguez',
    avatar: '🌙',
    price: '1.8 ETH',
    likes: 38,
    views: 892,
    isLocked: true,
    category: 'Gaming',
    tags: ['Gaming', 'NFTs', 'Fitness'],
    categories: ['Gaming', 'NFTs'],
    createdAt: '1 week ago',
    featured: false,
    pixelColor: 'from-green-400 to-emerald-500',
    isSold: false,
  },
  {
    id: 3,
    title: 'Carbon Credit Marketplace',
    description: 'Transparent blockchain-based carbon credit trading platform. Verify, trade, and track environmental impact with smart contracts and real-time monitoring.',
    creator: 'Emma Wilson',
    avatar: '🎯',
    price: '3.2 ETH',
    likes: 67,
    views: 1876,
    isLocked: false,
    category: 'Sustainability',
    tags: ['Sustainability', 'Trading', 'Environment'],
    categories: ['Sustainability', 'DeFi'],
    createdAt: '3 days ago',
    featured: true,
    pixelColor: 'from-orange-400 to-red-500',
    isSold: true,
    soldDate: '2 days ago',
    soldPrice: '3.2 ETH',
  },
  {
    id: 4,
    title: 'Decentralized Education Hub',
    description: 'Learn, teach, and earn with blockchain-verified educational content. Create courses, earn tokens for learning, and build your reputation as an educator.',
    creator: 'Sarah Kim',
    avatar: '👩‍🎨',
    price: '2.1 ETH',
    likes: 53,
    views: 1456,
    isLocked: false,
    category: 'Education',
    tags: ['Education', 'Learning', 'Tokens'],
    categories: ['Education', 'DeFi'],
    createdAt: '5 days ago',
    featured: false,
    pixelColor: 'from-indigo-400 to-blue-500',
    isSold: true,
    soldDate: '3 days ago',
    soldPrice: '2.1 ETH',
  },
  {
    id: 5,
    title: 'AI-Powered Smart Contracts',
    description: 'Next-generation smart contracts that adapt and optimize themselves using artificial intelligence and machine learning algorithms.',
    creator: 'Marcus Johnson',
    avatar: '🚀',
    price: '4.5 ETH',
    likes: 89,
    views: 2341,
    isLocked: false,
    category: 'DeFi',
    tags: ['DeFi', 'AI', 'Smart Contracts'],
    categories: ['DeFi', 'AI'],
    createdAt: '4 days ago',
    featured: true,
    pixelColor: 'from-purple-400 to-pink-500',
    isSold: true,
    soldDate: '1 day ago',
    soldPrice: '4.5 ETH',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [builders, setBuilders] = useState<Builder[]>(initialBuilders);
  const [builderRatings, setBuilderRatings] = useState<BuilderRating[]>([]);
  const [connectedWallet, setConnectedWallet] = useState(false);

  const connectWallet = () => {
    // Simulate wallet connection
    setConnectedWallet(true);
    setUser({
      id: '1',
      name: 'Alex Builder',
      username: '@alexbuilder',
      avatar: '🦸‍♂️',
      level: 25,
      reputation: 1850,
      walletConnected: true,
      balance: 5.2,
    });
  };

  const disconnectWallet = () => {
    setConnectedWallet(false);
    setUser(null);
  };

  const likeIdea = (ideaId: number) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            likes: idea.isLiked ? idea.likes - 1 : idea.likes + 1,
            isLiked: !idea.isLiked 
          }
        : idea
    ));
  };

  const purchaseIdea = (ideaId: number) => {
    if (!user) return;
    
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId 
        ? { 
            ...idea, 
            isOwned: true,
            isSold: true,
            soldDate: 'Just now',
            soldPrice: idea.price
          }
        : idea
    ));
    
    // Simulate balance deduction
    setUser(prev => prev ? { ...prev, balance: prev.balance - parseFloat(ideas.find(i => i.id === ideaId)?.price.split(' ')[0] || '0') } : null);
  };

  const mintNewIdea = (newIdea: Omit<Idea, 'id' | 'likes' | 'views' | 'createdAt'>) => {
    // Generate pixel color based on primary category
    const getPixelColor = (category: string) => {
      const colorMap: Record<string, string> = {
        'DeFi': 'from-blue-400 to-purple-500',
        'Gaming': 'from-green-400 to-emerald-500',
        'Sustainability': 'from-orange-400 to-red-500',
        'Education': 'from-indigo-400 to-blue-500',
        'Art': 'from-pink-400 to-rose-500',
        'Metaverse': 'from-cyan-400 to-teal-500',
      };
      return colorMap[category] || 'from-gray-400 to-gray-600';
    };

    const idea: Idea = {
      ...newIdea,
      id: ideas.length + 1,
      likes: 0,
      views: 0,
      createdAt: 'Just now',
      pixelColor: getPixelColor(newIdea.category),
      tags: newIdea.categories || [], // Use categories as tags
      isSold: false, // New ideas start as unsold
    };
    
    setIdeas(prev => [idea, ...prev]);

    // Update user's ideas minted count
    if (user) {
      const userBuilder = builders.find(b => b.name === user.name);
      if (userBuilder) {
        setBuilders(prev => prev.map(builder => 
          builder.id === userBuilder.id 
            ? { ...builder, ideasMinted: builder.ideasMinted + 1 }
            : builder
        ));
      }
    }
  };

  const rateBuilder = (builderId: number, rating: number, review?: string) => {
    if (!user) return;

    // Remove existing rating from this user for this builder
    setBuilderRatings(prev => prev.filter(r => !(r.builderId === builderId && r.userId === user.id)));

    // Add new rating
    const newRating: BuilderRating = {
      builderId,
      userId: user.id,
      rating,
      review,
      createdAt: new Date().toISOString(),
    };
    setBuilderRatings(prev => [...prev, newRating]);

    // Update builder's rating and total ratings
    setBuilders(prev => prev.map(builder => {
      if (builder.id === builderId) {
        const builderRatings = [...builderRatings.filter(r => r.builderId === builderId), newRating];
        const avgRating = builderRatings.reduce((sum, r) => sum + r.rating, 0) / builderRatings.length;
        return {
          ...builder,
          rating: Math.round(avgRating * 10) / 10,
          totalRatings: builderRatings.length,
          userRating: rating,
        };
      }
      return builder;
    }));
  };

  const getBuilderRating = (builderId: number): number => {
    if (!user) return 0;
    const userRating = builderRatings.find(r => r.builderId === builderId && r.userId === user.id);
    return userRating?.rating || 0;
  };

  const createSuperhero = async (data: SuperheroData): Promise<Builder> => {
    const newId = Math.max(...builders.map(b => b.id)) + 1;
    
    const newSuperhero: Builder = {
      id: newId,
      name: data.name,
      username: `@${data.name.toLowerCase().replace(/\s+/g, '')}`,
      avatar: data.avatarUrl,
      level: 1,
      reputation: data.reputation,
      specialties: data.specialties,
      achievements: ['New Superhero'],
      teamsFormed: 0,
      ideasMinted: 0,
      bgGradient: 'from-sunset-coral/20 to-sky-blue/20',
      location: data.location,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      bio: data.bio,
      skills: data.skills,
      currentProjects: 0,
      followers: 0,
      following: 0,
      isOnline: true,
      featured: false,
      pixelColor: 'from-green-400 to-emerald-500',
      rating: 0,
      totalRatings: 0,
    };

    setBuilders(prev => [...prev, newSuperhero]);
    
    // Update user to reflect the new superhero
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        name: data.name,
        avatar: data.avatarUrl,
        level: 1,
        reputation: data.reputation,
      } : null);
    }

    return newSuperhero;
  };

  return (
    <AppContext.Provider value={{
      user,
      ideas,
      builders,
      builderRatings,
      connectedWallet,
      connectWallet,
      disconnectWallet,
      likeIdea,
      purchaseIdea,
      mintNewIdea,
      rateBuilder,
      getBuilderRating,
      createSuperhero,
    }}>
      {children}
    </AppContext.Provider>
  );
};