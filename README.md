# Idea Marketplace - Superhero NFT Platform

A decentralized marketplace where users create superhero identities as Soulbound Tokens (SBT) and trade encrypted ideas as NFTs.

## 🦸‍♂️ Complete Workflow

### 1. Onboard → Connect Wallet → Mint "Superhero" Profile SBT
```solidity
// Contract: IdeaNFT.sol
function createSuperhero(string _name, string _bio, string _uri) external
```

**Steps:**
1. Connect Web3 wallet
2. Call `createSuperhero()` with unique name, bio, and avatar URI  
3. Receive soulbound NFT (non-transferable superhero identity)
4. Automatically granted `SUPERHERO_ROLE` for marketplace access

**Key Features:**
- ✅ Unique superhero names enforced
- ✅ Soulbound tokens (non-transferable)
- ✅ Reputation system integrated
- ✅ Ready to create ideas immediately (flagged: false)

---

### 2. Mint Idea → Upload Encrypted Idea JSON to IPFS → Mint NFT
```solidity
// Contract: IdeaNFT.sol  
function createIdea(string _title, string[] _category, string _uri, uint256 _price) external
```

**Frontend Encryption Flow:**
```javascript
// 1. Generate AES-256 encryption key
const encryptionKey = crypto.getRandomValues(new Uint8Array(32));

// 2. Encrypt idea JSON
const encrypted = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv: new Uint8Array(12) },
  key, 
  JSON.stringify(ideaData)
);

// 3. Upload encrypted data to IPFS
const ipfsHash = await uploadToIPFS(encrypted);

// 4. Store decryption key in secure backend
await storeDecryptionKey(ideaId, encryptionKey, creatorAddress);

// 5. Mint NFT with encrypted IPFS hash
await createIdea(title, categories, ipfsHash, price);
```

**Backend Requirements:**
- Secure key storage (encrypted at rest)
- API endpoints: `/store-key`, `/get-key`
- Access control validation

---

### 3. List Marketplace → Set Price in MockUSDC → Await Buyers
```solidity
// Contract: IdeaMarketplace.sol
function updatePriceIdea(uint256 _ideaId, uint256 _newPrice) external
```

**Steps:**
1. Ideas automatically listed when created
2. Set/update price in MockUSDC tokens
3. Ideas appear in marketplace with blurred previews
4. Buyers can view metadata but not decrypt content

---

### 4. Browse & Buy → Preview Blurred Metadata → "Buy to Unlock" → Decrypt
```solidity
// Contract: IdeaMarketplace.sol
function buyIdea(uint256 _ideaId) external
```

**Purchase Flow:**
```javascript
// 1. Browse ideas (encrypted previews only)
const ideas = await getAvailableIdeas(superheroAddress);

// 2. Purchase with MockUSDC
await mockUSDC.approve(marketplaceAddress, price);
await marketplace.buyIdea(ideaId);

// 3. Backend validates purchase and provides decryption key
const decryptionKey = await getDecryptionKey(ideaId, buyerAddress);

// 4. Fetch and decrypt idea content
const encryptedData = await fetchFromIPFS(ipfsHash);
const decrypted = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv },
  decryptionKey,
  encryptedData
);
```

**Smart Contract Features:**
- ✅ Marketplace fee (2.5% default)
- ✅ Automatic payment splitting
- ✅ Purchase history tracking
- ✅ Prevents self-purchase
- ✅ One-time purchase per idea

---

### 5. Form Team → Stake Tokens → Build Roadmap → Submit Proof
*TODO: Team formation contracts*

---

### 6. Execute & Earn → Validators Approve → Release Stake → Reputation++
*TODO: Validation and staking system*

---

### 7. Rate & Grow → Build Reputation & Relationships
```solidity
// Contract: IdeaNFT.sol
function rateSuperhero(uint256 rating, uint256 ideaId) external
```

**Rating System:**
- Buyers rate idea creators (1-5 stars)
- Ratings affect superhero reputation
- Higher reputation = better marketplace visibility
- Prevents duplicate ratings per user

---

## 🛠️ Contract Architecture

### IdeaNFT.sol
- **Purpose:** Core superhero identities and idea NFTs
- **Token Types:** 
  - Superhero SBT: IDs 100000+
  - Idea NFTs: IDs 0+
- **Key Functions:**
  - `createSuperhero()` - Mint superhero SBT
  - `createIdea()` - Mint encrypted idea NFT
  - `markIdeaPurchased()` - Update purchase status
  - `rateSuperhero()` - Reputation system

### IdeaMarketplace.sol  
- **Purpose:** Trading platform for idea NFTs
- **Payment:** MockUSDC tokens
- **Key Functions:**
  - `buyIdea()` - Purchase and unlock ideas
  - `calculateFees()` - 2.5% marketplace fee
  - Purchase tracking and analytics

### MockUSDC.sol
- **Purpose:** Test token for payments
- **Standard:** ERC20 compatible

---

## 🚀 Deployment Steps

### 1. Deploy Contracts
```bash
# Deploy in order:
forge script script/DeployIdeaMarketplace.s.sol --broadcast
```

### 2. Configure Marketplace Authorization
```solidity
// Authorize marketplace to mark ideas as purchased
ideaNFT.authorizeMarketplace(marketplaceAddress);
```

### 3. Frontend Integration
- Implement AES-256 encryption/decryption
- IPFS integration for encrypted content
- Web3 wallet connection
- Marketplace UI with blurred previews

### 4. Backend Services
- Secure decryption key management
- Purchase verification
- API endpoints for key access

---

## 🔐 Encryption Strategy (Option 1)

**Architecture:** Frontend encryption + Backend key management

**Advantages:**
- Simple implementation
- Gas efficient
- Fast decryption
- MVP ready

**Security Considerations:**
- Backend must be secure
- Keys encrypted at rest
- Access control via blockchain verification
- Future migration path to full decentralization

---

## 📋 Testing Checklist

- [ ] Deploy all contracts successfully
- [ ] Create superhero profile (SBT)
- [ ] Mint encrypted idea NFT
- [ ] List idea in marketplace
- [ ] Purchase idea with MockUSDC
- [ ] Verify idea marked as purchased
- [ ] Decrypt and access bought content
- [ ] Rate superhero creator
- [ ] Check reputation updates

---

## 🔧 Monad Development Commands

> [!NOTE]
> This project uses Monad testnet. Default chain is `monadTestnet` in `foundry.toml`

<h4 align="center">
  <a href="https://docs.monad.xyz">Monad Documentation</a> | <a href="https://book.getfoundry.sh/">Foundry Documentation</a>
</h4>

## Usage

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Format

```shell
forge fmt
```

### Gas Snapshots

```shell
forge snapshot
```

### Anvil

```shell
anvil
```

### Deploy to Monad Testnet

First, create a keystore file:

```shell
cast wallet import monad-deployer --private-key $(cast wallet new | grep 'Private key:' | awk '{print $3}')
```

Check wallet address:
```shell
cast wallet address --account monad-deployer
```

Deploy Idea Marketplace contracts:
```shell
forge script script/DeployIdeaMarketplace.s.sol --account monad-deployer --broadcast
```

After deployment, authorize marketplace:
```shell
cast send <IDEA_NFT_ADDRESS> "authorizeMarketplace(address)" <MARKETPLACE_ADDRESS> --account monad-deployer
```

### Verify Contract

```shell
forge verify-contract \
  <contract_address> \
  src/Counter.sol:Counter \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org
```

### Cast
[Cast reference](https://book.getfoundry.sh/cast/)
```shell
cast <subcommand>
```

### Help

```shell
forge --help
anvil --help
cast --help
```


## FAQ

### Error: `Error: server returned an error response: error code -32603: Signer had insufficient balance`

This error happens when you don't have enough balance to deploy your contract. You can check your balance with the following command:

```shell
cast wallet address --account monad-deployer
```

### I have constructor arguments, how do I deploy my contract?

```shell
forge create \
  src/Counter.sol:Counter \
  --account monad-deployer \
  --broadcast \
  --constructor-args <constructor_arguments>
```

---

## 📚 Next Development Phases

1. **Phase 1:** ✅ Core marketplace (Complete)
2. **Phase 2:** Team formation contracts
3. **Phase 3:** Staking and validation system  
4. **Phase 4:** Advanced reputation mechanics
5. **Phase 5:** Migrate to full decentralized encryption (Lit Protocol)

---

## 🤝 Contributing

This marketplace enables decentralized idea trading with proper encryption and reputation systems. The modular design allows for future enhancements while maintaining security and user experience.

---

Please refer to the [Foundry Book](https://book.getfoundry.sh/) for more information.