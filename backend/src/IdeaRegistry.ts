import { ponder } from "@/generated";

// Handle idea creation
ponder.on("IdeaRegistry:CreateIdea", async ({ event, context }) => {
  const { Idea, EventLog } = context.db;

  await Idea.create({
    id: event.args.ideaId.toString(),
    data: {
      ideaId: event.args.ideaId,
      creator: event.args.creator,
      title: event.args.title,
      categories: [], // Will be populated from contract call or metadata
      ipfsHash: "", // Will be populated from contract call
      price: event.args.price,
      ratingTotal: 0n,
      numRaters: 0n,
      isPurchased: false,
      createdAt: Number(event.block.timestamp),
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
    },
  });

  // Log the event
  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "CreateIdea",
      eventData: {
        creator: event.args.creator,
        ideaId: event.args.ideaId.toString(),
        title: event.args.title,
        price: event.args.price.toString(),
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});

// Handle idea ratings - DISABLED: RateIdea event not available in contract
// ponder.on("IdeaRegistry:RateIdea", async ({ event, context }) => {
//   const { Rating, Idea, EventLog } = context.db;

//   // Create rating record
//   await Rating.create({
//     id: `${event.args.ideaId}-${event.args.rater}`,
//     data: {
//       ideaId: event.args.ideaId.toString(),
//       raterAddress: event.args.rater,
//       rating: Number(event.args.rating),
//       comment: "", // Add if your contract supports comments
//       createdAt: Number(event.block.timestamp),
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//     },
//   });

//   // Update idea's rating totals
//   const idea = await Idea.findUnique({
//     id: event.args.ideaId.toString(),
//   });

//   if (idea) {
//     await Idea.update({
//       id: event.args.ideaId.toString(),
//       data: {
//         ratingTotal: idea.ratingTotal + BigInt(event.args.rating),
//         numRaters: idea.numRaters + 1n,
//       },
//     });
//   }

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "RateIdea",
//       eventData: {
//         ideaId: event.args.ideaId.toString(),
//         rater: event.args.rater,
//         rating: event.args.rating.toString(),
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle idea transfers (NFT transfers)
ponder.on("IdeaRegistry:Transfer", async ({ event, context }) => {
  const { Transfer } = context.db;

  // Determine transfer type
  let transferType = "transfer";
  if (event.args.from === "0x0000000000000000000000000000000000000000") {
    transferType = "mint";
  } else if (event.args.to === "0x0000000000000000000000000000000000000000") {
    transferType = "burn";
  }

  await Transfer.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      tokenId: event.args.tokenId,
      from: event.args.from,
      to: event.args.to,
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
      transferType,
    },
  });
});

// Handle idea flag events - DISABLED: FlagIdea event not available in contract
// ponder.on("IdeaRegistry:FlagIdea", async ({ event, context }) => {
//   const { EventLog } = context.db;

//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "FlagIdea",
//       eventData: {
//         ideaId: event.args.ideaId.toString(),
//         flagger: event.args.flagger,
//         reason: event.args.reason || "",
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });