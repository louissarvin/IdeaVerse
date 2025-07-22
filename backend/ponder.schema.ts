import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  // Superhero entity
  Superhero: p.createTable({
    id: p.string(), // Address of the superhero
    superheroId: p.bigint(),
    name: p.string(),
    bio: p.string(),
    avatarUrl: p.string().optional(),
    reputation: p.bigint(),
    skills: p.json(),
    specialities: p.json(),
    flagged: p.boolean(),
    createdAt: p.int(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
  }),

  // Idea entity
  Idea: p.createTable({
    id: p.string(), // tokenId as string
    ideaId: p.bigint(),
    creator: p.string().references("Superhero.id"),
    title: p.string(),
    categories: p.json(),
    ipfsHash: p.string(),
    price: p.bigint(),
    ratingTotal: p.bigint(),
    numRaters: p.bigint(),
    isPurchased: p.boolean(),
    createdAt: p.int(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
  }),

  // Team entity
  Team: p.createTable({
    id: p.string(), // teamId as string
    teamId: p.bigint(),
    leader: p.string().references("Superhero.id"),
    teamName: p.string(),
    description: p.string(),
    projectName: p.string(),
    requiredMembers: p.int(),
    currentMembers: p.int(),
    requiredStake: p.bigint(),
    roles: p.json(),
    tags: p.json(),
    status: p.string(), // active, completed, cancelled
    createdAt: p.int(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
  }),

  // Team member entity (for many-to-many relationship)
  TeamMember: p.createTable({
    id: p.string(), // teamId-memberAddress
    teamId: p.string().references("Team.id"),
    memberAddress: p.string().references("Superhero.id"),
    role: p.string().optional(),
    joinedAt: p.int(),
    stakeAmount: p.bigint(),
    isActive: p.boolean(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
  }),

  // Purchase entity
  Purchase: p.createTable({
    id: p.string(), // purchaseId or hash
    ideaId: p.string().references("Idea.id"),
    buyer: p.string().references("Superhero.id"),
    seller: p.string().references("Superhero.id"),
    price: p.bigint(),
    purchaseTimestamp: p.int(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
  }),

  // Rating entity (for idea ratings)
  Rating: p.createTable({
    id: p.string(), // ideaId-raterAddress
    ideaId: p.string().references("Idea.id"),
    raterAddress: p.string().references("Superhero.id"),
    rating: p.int(), // 1-5 stars
    comment: p.string().optional(),
    createdAt: p.int(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
  }),

  // Transfer entity (for NFT transfers)
  Transfer: p.createTable({
    id: p.string(), // transactionHash-logIndex
    contractAddress: p.string(),
    tokenId: p.bigint(),
    from: p.string(),
    to: p.string(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
    timestamp: p.int(),
    transferType: p.string(), // "mint", "transfer", "burn"
  }),

  // USDC Transaction entity (for tracking payments)
  USDCTransaction: p.createTable({
    id: p.string(), // transactionHash-logIndex
    from: p.string(),
    to: p.string(),
    amount: p.bigint(),
    purpose: p.string().optional(), // "idea_purchase", "team_stake", etc.
    relatedEntityId: p.string().optional(), // ideaId, teamId, etc.
    transactionHash: p.string(),
    blockNumber: p.bigint(),
    timestamp: p.int(),
  }),

  // Approval entity (for USDC approvals)
  Approval: p.createTable({
    id: p.string(), // owner-spender
    owner: p.string(),
    spender: p.string(),
    amount: p.bigint(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
    timestamp: p.int(),
  }),

  // Platform statistics (aggregated data)
  PlatformStats: p.createTable({
    id: p.string(), // "daily", "weekly", "monthly", "all_time"
    totalSuperheroes: p.bigint(),
    totalIdeas: p.bigint(),
    totalTeams: p.bigint(),
    totalPurchases: p.bigint(),
    totalVolume: p.bigint(),
    activeUsers: p.bigint(),
    lastUpdated: p.int(),
  }),

  // Event log (for debugging and analytics)
  EventLog: p.createTable({
    id: p.string(), // transactionHash-logIndex
    contractAddress: p.string(),
    eventName: p.string(),
    eventData: p.json(),
    transactionHash: p.string(),
    blockNumber: p.bigint(),
    timestamp: p.int(),
  }),
}));