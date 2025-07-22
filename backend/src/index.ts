// Pure indexer entry point for Ponder
// This file is loaded by Ponder indexer and should not contain API server code

import 'dotenv/config';

// Initialize services for indexer use
import { DatabaseService } from '@/services/database';
import { IPFSService } from '@/services/ipfs';
import { BlockchainService } from '@/services/blockchain';

// Log indexer startup
console.log(`🔍 Ponder indexer entry point loaded`);
console.log(`📊 Initializing services for blockchain event processing...`);

// Initialize services
const db = new DatabaseService();
const ipfs = new IPFSService();
const blockchain = new BlockchainService();