import { ponder } from "@/generated";

// Handle idea purchases
ponder.on("OptimizedMarketplace:IdeaPurchased", async ({ event, context }) => {
  const { Purchase, Idea, EventLog } = context.db;

  // Create purchase record
  await Purchase.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      ideaId: event.args.ideaId.toString(),
      buyer: event.args.buyer,
      seller: event.args.seller,
      price: event.args.price,
      purchaseTimestamp: Number(event.block.timestamp),
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
    },
  });

  // Mark idea as purchased
  await Idea.update({
    id: event.args.ideaId.toString(),
    data: {
      isPurchased: true,
    },
  });

  // Log the event
  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "IdeaPurchased",
      eventData: {
        ideaId: event.args.ideaId.toString(),
        buyer: event.args.buyer,
        seller: event.args.seller,
        price: event.args.price.toString(),
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});

// Handle price updates - DISABLED: PriceUpdated event not available in contract
// ponder.on("OptimizedMarketplace:PriceUpdated", async ({ event, context }) => {
//   const { Idea, EventLog } = context.db;

//   // Update idea price
//   await Idea.update({
//     id: event.args.ideaId.toString(),
//     data: {
//       price: event.args.newPrice,
//     },
//   });

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "PriceUpdated",
//       eventData: {
//         ideaId: event.args.ideaId.toString(),
//         oldPrice: event.args.oldPrice.toString(),
//         newPrice: event.args.newPrice.toString(),
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle marketplace fee updates - DISABLED: FeeUpdated event not available in contract
// ponder.on("OptimizedMarketplace:FeeUpdated", async ({ event, context }) => {
//   const { EventLog } = context.db;

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "FeeUpdated",
//       eventData: {
//         oldFee: event.args.oldFee.toString(),
//         newFee: event.args.newFee.toString(),
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle idea listing - DISABLED: IdeaListed event not available in contract
// ponder.on("OptimizedMarketplace:IdeaListed", async ({ event, context }) => {
//   const { EventLog } = context.db;

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "IdeaListed",
//       eventData: {
//         ideaId: event.args.ideaId.toString(),
//         seller: event.args.seller,
//         price: event.args.price.toString(),
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle idea unlisting - DISABLED: IdeaUnlisted event not available in contract
// ponder.on("OptimizedMarketplace:IdeaUnlisted", async ({ event, context }) => {
//   const { EventLog } = context.db;

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "IdeaUnlisted",
//       eventData: {
//         ideaId: event.args.ideaId.toString(),
//         seller: event.args.seller,
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle marketplace pause/unpause - DISABLED: MarketplacePaused event not available in contract
// ponder.on("OptimizedMarketplace:MarketplacePaused", async ({ event, context }) => {
//   const { EventLog } = context.db;

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "MarketplacePaused",
//       eventData: {
//         paused: true,
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// DISABLED: MarketplaceUnpaused event not available in contract
// ponder.on("OptimizedMarketplace:MarketplaceUnpaused", async ({ event, context }) => {
//   const { EventLog } = context.db;

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "MarketplaceUnpaused",
//       eventData: {
//         paused: false,
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });