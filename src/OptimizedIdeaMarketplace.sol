// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./SuperheroNFT.sol";
import "./IdeaRegistry.sol";

/**
 * @title OptimizedIdeaMarketplace
 * @dev Optimized marketplace for idea trading
 */
contract OptimizedIdeaMarketplace is AccessControl, ReentrancyGuard {
    SuperheroNFT public immutable superheroNFT;
    IdeaRegistry public immutable ideaRegistry;
    IERC20 public immutable USDC;

    uint256 public marketplaceFeePercentage = 250; // 2.5%
    address public feeRecipient;
    uint256 public totalVolume;
    uint256 public totalTransactions;

    struct Purchase {
        uint256 tokenId;
        address buyer;
        address seller;
        uint256 price;
        uint256 timestamp;
        uint256 marketplaceFee;
    }

    // Events (for off-chain indexing)
    event IdeaPurchased(uint256 indexed ideaId, address indexed buyer, address indexed seller, uint256 price, uint256 marketplaceFee, uint256 timestamp);
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    constructor(address _superheroNFT, address _ideaRegistry, address _mockUSDC, address _feeRecipient) {
        superheroNFT = SuperheroNFT(_superheroNFT);
        ideaRegistry = IdeaRegistry(_ideaRegistry);
        USDC = IERC20(_mockUSDC);
        feeRecipient = _feeRecipient;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlySuperhero() {
        require(superheroNFT.hasRole(superheroNFT.SUPERHERO_ROLE(), msg.sender), "Only superheroes");
        _;
    }
    
    function buyIdea(uint256 _ideaId) external onlySuperhero nonReentrant {
        IdeaRegistry.IdeaMan memory idea = ideaRegistry.getIdea(_ideaId);

        require(idea.creator != address(0), "Idea does not exist");
        require(idea.creator != msg.sender, "Cannot buy own idea");
        require(!idea.isPurchased, "Already purchased");

        uint256 totalPrice = idea.price;
        uint256 marketplaceFee = (totalPrice * marketplaceFeePercentage) / 10000;
        uint256 sellerAmount = totalPrice - marketplaceFee;

        require(USDC.transferFrom(msg.sender, idea.creator, sellerAmount), "Payment failed");
        
        if (marketplaceFee > 0) {
            require(USDC.transferFrom(msg.sender, feeRecipient, marketplaceFee), "Fee transfer failed");
        }
        
        // Mark idea as purchased
        ideaRegistry.markIdeaPurchased(_ideaId);

        totalVolume += totalPrice;
        totalTransactions++;
        
        emit IdeaPurchased(_ideaId, msg.sender, idea.creator, totalPrice, marketplaceFee, block.timestamp);
    }

    function updateMarketplaceFee(uint256 _newFeePercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newFeePercentage <= 1000, "Fee too high"); // Max 10%
        
        uint256 oldFee = marketplaceFeePercentage;
        marketplaceFeePercentage = _newFeePercentage;
        
        emit MarketplaceFeeUpdated(oldFee, _newFeePercentage);
    }

    function updateFeeRecipient(address _newFeeRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newFeeRecipient != address(0), "Invalid recipient");
        
        address oldRecipient = feeRecipient;
        feeRecipient = _newFeeRecipient;
        
        emit FeeRecipientUpdated(oldRecipient, _newFeeRecipient);
    }

    function getMarketplaceStats() external view returns (
        uint256 _totalVolume,
        uint256 _totalTransactions,
        uint256 _marketplaceFeePercentage,
        address _feeRecipient
    ) {
        return (totalVolume, totalTransactions, marketplaceFeePercentage, feeRecipient);
    }

    function calculateFees(uint256 _price) external view returns (uint256 marketplaceFee, uint256 sellerAmount) {
        marketplaceFee = (_price * marketplaceFeePercentage) / 10000;
        sellerAmount = _price - marketplaceFee;
    }

    function canUserBuyIdea(address _user, uint256 _ideaId) external view returns (bool canBuy, string memory reason) {
        if (!superheroNFT.hasRole(superheroNFT.SUPERHERO_ROLE(), _user)) {
            return (false, "Not a superhero");
        }
        
        try ideaRegistry.getIdea(_ideaId) returns (IdeaRegistry.IdeaMan memory idea) {
            if (idea.creator == _user) {
                return (false, "Cannot buy own idea");
            }
            
            if (idea.isPurchased) {
                return (false, "Already purchased");
            }
            
            if (USDC.balanceOf(_user) < idea.price) {
                return (false, "Insufficient balance");
            }
            
            if (USDC.allowance(_user, address(this)) < idea.price) {
                return (false, "Insufficient allowance");
            }
            
            return (true, "");
        } catch {
            return (false, "Idea does not exist");
        }
    }
}