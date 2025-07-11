    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.26;

    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
    import "@openzeppelin/contracts/access/AccessControl.sol";
    import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
    import "./IdeaNFT.sol";

    contract IdeaMarketplace is AccessControl, ReentrancyGuard {
        IdeaNFT public immutable ideaNFT;
        IERC20 public immutable USDC;

        uint256 public marketplaceFeePercentage = 250; 
        address public feeRecipient;
        uint256 public totalVolume;
        uint256 public totalTransactions;

        bytes32 public constant SUPERHERO_ROLE = keccak256("SUPERHERO_ROLE");

        struct Purchase {
            uint256 tokenId;
            address buyer;
            address seller;
            uint256 price;
            uint256 timestamp;
            uint256 marketplaceFee;
        }

        struct MarketplaceStats {
            uint256 totalSales;
            uint256 totalRevenue;
            uint256 totalFeesCollected;
        }

        mapping(address => Purchase[]) public userPurchases;
        mapping(address => Purchase[]) public userSales;
        mapping(uint256 => Purchase[]) public ideaPurchases;
        mapping(address => MarketplaceStats) public sellerStats;

        event IdeaPurchased(uint256 indexed ideaId, address indexed buyer, address indexed seller, uint256 price, uint256 marketplaceFee, uint256 timestamp);
        event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);
        event FeeRecipientUpdated(address oldRecipient, address newRecipient);

        constructor(address _ideaNFT, address _mockUSDC, address _feeRecipient) {
            ideaNFT = IdeaNFT(_ideaNFT);
            USDC = IERC20(_mockUSDC);
            feeRecipient = _feeRecipient;
        
            _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        }

        modifier onlySuperhero() {
            require(ideaNFT.hasRole(SUPERHERO_ROLE, msg.sender), "Only superheroes can use the marketplace");
            _;
        }
        
        function buyIdea(uint256 _ideaId) external onlySuperhero {
            IdeaNFT.IdeaMan memory idea = ideaNFT.getIdea(_ideaId);

            require(idea.creator != address(0), "Idea does not exist");
            require(idea.creator != msg.sender, "Cannot buy your own idea");
            require(!idea.isPurchased, "Idea have been bought");

            uint256 totalPrice = idea.price;
            uint256 marketplaceFee = (totalPrice * marketplaceFeePercentage) / 10000;
            uint256 sellerAmount = totalPrice - marketplaceFee;
            
            if(USDC.balanceOf(msg.sender) < totalPrice + marketplaceFee) {
                revert("Insufficient balance");
            }

            require(USDC.transferFrom(msg.sender, idea.creator, sellerAmount), "Payment to seller failed");
            
            if (marketplaceFee > 0) {
                require(USDC.transferFrom(msg.sender, feeRecipient, marketplaceFee), "Fee transfer failed");
            }
            
            Purchase memory purchase = Purchase({
                tokenId: _ideaId,
                buyer: msg.sender,
                seller: idea.creator,
                price: totalPrice,
                timestamp: block.timestamp,
                marketplaceFee: marketplaceFee
            });

            userPurchases[msg.sender].push(purchase);
            userSales[idea.creator].push(purchase);
            ideaPurchases[_ideaId].push(purchase);
            
            // Mark idea as purchased in the NFT contract
            ideaNFT.markIdeaPurchased(_ideaId);

            sellerStats[idea.creator].totalSales++;
            sellerStats[idea.creator].totalRevenue += sellerAmount;
            sellerStats[idea.creator].totalFeesCollected += marketplaceFee;

            totalVolume += totalPrice;
            totalTransactions++;
            
            emit IdeaPurchased(
                _ideaId,
                msg.sender,
                idea.creator,
                totalPrice,
                marketplaceFee,
                block.timestamp
            );
        }

        /**
        * @dev Get purchase history for a user
        */
        function getUserPurchases(address _user) external view returns (Purchase[] memory) {
            return userPurchases[_user];
        }

        /**
        * @dev Get sales history for a user
        */
        function getUserSales(address _user) external view returns (Purchase[] memory) {
            return userSales[_user];
        }

        /**
        * @dev Get purchase history for an idea
        */
        function getIdeaPurchases(uint256 _ideaId) external view returns (Purchase[] memory) {
            return ideaPurchases[_ideaId];
        }

        /**
        * @dev Get seller statistics
        */
        function getSellerStats(address _seller) external view returns (MarketplaceStats memory) {
            return sellerStats[_seller];
        }

        /**
        * @dev Get marketplace overview stats
        */
        function getMarketplaceStats() external view returns (
            uint256 _totalVolume,
            uint256 _totalTransactions,
            uint256 _marketplaceFeePercentage,
            address _feeRecipient
        ) {
            return (totalVolume, totalTransactions, marketplaceFeePercentage, feeRecipient);
        }

        /**
        * @dev Calculate fees for a given price
        */
        function calculateFees(uint256 _price) external view returns (uint256 marketplaceFee, uint256 sellerAmount) {
            marketplaceFee = (_price * marketplaceFeePercentage) / 10000;
            sellerAmount = _price - marketplaceFee;
        }

        /**
        * @dev Update marketplace fee percentage (only admin)
        */
        function updateMarketplaceFee(uint256 _newFeePercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
            require(_newFeePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
            
            uint256 oldFee = marketplaceFeePercentage;
            marketplaceFeePercentage = _newFeePercentage;
            
            emit MarketplaceFeeUpdated(oldFee, _newFeePercentage);
        }

        /**
        * @dev Update fee recipient (only admin)
        */
        function updateFeeRecipient(address _newFeeRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
            require(_newFeeRecipient != address(0), "Invalid fee recipient");
            
            address oldRecipient = feeRecipient;
            feeRecipient = _newFeeRecipient;
            
            emit FeeRecipientUpdated(oldRecipient, _newFeeRecipient);
        }

        // =============================================================
        //                    FRONTEND HELPER FUNCTIONS
        // =============================================================

        /**
         * @dev Get recent purchases with pagination
         */
        function getRecentPurchases(uint256 _offset, uint256 _limit) external view returns (Purchase[] memory) {
            uint256 totalPurchases = 0;
            
            // Count total purchases across all users
            // Note: This is a simplified approach - in production, you'd want to track purchases globally
            uint256 actualLimit = _limit;
            if (actualLimit > 50) actualLimit = 50; // Limit to prevent gas issues
            
            Purchase[] memory recentPurchases = new Purchase[](actualLimit);
            // Implementation would need global purchase tracking for full functionality
            
            return recentPurchases;
        }

        /**
         * @dev Get marketplace activity for a specific time period
         */
        function getMarketplaceActivity(uint256 _fromTimestamp, uint256 _toTimestamp) external view returns (
            uint256 totalSales,
            uint256 totalVolumeAmount,
            uint256 totalFees,
            uint256 uniqueBuyers,
            uint256 uniqueSellers
        ) {
            // This would require additional event tracking in production
            // For now, returning current totals
            totalSales = totalTransactions;
            totalVolumeAmount = totalVolume;
            totalFees = 0; // Would need to track separately
            uniqueBuyers = 0; // Would need to track separately
            uniqueSellers = 0; // Would need to track separately
        }

        /**
         * @dev Get user's purchase history with pagination
         */
        function getUserPurchasesPaginated(address _user, uint256 _offset, uint256 _limit) external view returns (
            Purchase[] memory purchases,
            uint256 totalCount
        ) {
            Purchase[] memory allPurchases = userPurchases[_user];
            totalCount = allPurchases.length;
            
            if (_offset >= totalCount) {
                return (new Purchase[](0), totalCount);
            }
            
            uint256 actualLimit = _limit;
            if (_offset + _limit > totalCount) {
                actualLimit = totalCount - _offset;
            }
            
            purchases = new Purchase[](actualLimit);
            for (uint256 i = 0; i < actualLimit; i++) {
                purchases[i] = allPurchases[_offset + i];
            }
        }

        /**
         * @dev Get user's sales history with pagination
         */
        function getUserSalesPaginated(address _user, uint256 _offset, uint256 _limit) external view returns (
            Purchase[] memory sales,
            uint256 totalCount
        ) {
            Purchase[] memory allSales = userSales[_user];
            totalCount = allSales.length;
            
            if (_offset >= totalCount) {
                return (new Purchase[](0), totalCount);
            }
            
            uint256 actualLimit = _limit;
            if (_offset + _limit > totalCount) {
                actualLimit = totalCount - _offset;
            }
            
            sales = new Purchase[](actualLimit);
            for (uint256 i = 0; i < actualLimit; i++) {
                sales[i] = allSales[_offset + i];
            }
        }

        /**
         * @dev Get detailed user statistics
         */
        function getUserDetailedStats(address _user) external view returns (
            uint256 totalPurchases,
            uint256 totalSales,
            uint256 totalSpent,
            uint256 totalEarned,
            uint256 totalFeesPaid,
            uint256 totalFeesEarned,
            uint256 firstPurchaseTimestamp,
            uint256 lastActivityTimestamp
        ) {
            Purchase[] memory purchases = userPurchases[_user];
            Purchase[] memory sales = userSales[_user];
            
            totalPurchases = purchases.length;
            totalSales = sales.length;
            
            // Calculate purchase stats
            for (uint256 i = 0; i < purchases.length; i++) {
                totalSpent += purchases[i].price;
                totalFeesPaid += purchases[i].marketplaceFee;
                
                if (firstPurchaseTimestamp == 0 || purchases[i].timestamp < firstPurchaseTimestamp) {
                    firstPurchaseTimestamp = purchases[i].timestamp;
                }
                
                if (purchases[i].timestamp > lastActivityTimestamp) {
                    lastActivityTimestamp = purchases[i].timestamp;
                }
            }
            
            // Calculate sales stats
            for (uint256 i = 0; i < sales.length; i++) {
                totalEarned += (sales[i].price - sales[i].marketplaceFee);
                totalFeesEarned += sales[i].marketplaceFee;
                
                if (sales[i].timestamp > lastActivityTimestamp) {
                    lastActivityTimestamp = sales[i].timestamp;
                }
            }
        }

        /**
         * @dev Check if user can buy a specific idea
         */
        function canUserBuyIdea(address _user, uint256 _ideaId) external view returns (bool canBuy, string memory reason) {
            if (!ideaNFT.hasRole(SUPERHERO_ROLE, _user)) {
                return (false, "User is not a superhero");
            }
            
            IdeaNFT.IdeaMan memory idea = ideaNFT.getIdea(_ideaId);
            
            if (idea.creator == address(0)) {
                return (false, "Idea does not exist");
            }
            
            if (idea.creator == _user) {
                return (false, "Cannot buy your own idea");
            }
            
            if (idea.isPurchased) {
                return (false, "Idea has already been purchased");
            }
            
            if (USDC.balanceOf(_user) < idea.price) {
                return (false, "Insufficient USDC balance");
            }
            
            if (USDC.allowance(_user, address(this)) < idea.price) {
                return (false, "Insufficient USDC allowance");
            }
            
            return (true, "");
        }
    }