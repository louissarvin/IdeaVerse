import { ponder } from "@/generated";

// Handle USDC transfers
ponder.on("MockUSDC:Transfer", async ({ event, context }) => {
  const { USDCTransaction, EventLog } = context.db;

  // Skip zero transfers
  if (event.args.value === 0n) return;

  // Determine transfer purpose and related entity
  let purpose = "transfer";
  let relatedEntityId = "";

  // Check if this is a marketplace-related transfer
  if (event.args.to === "0xEEEdca533402B75dDF338ECF3EF1E1136C8f20cF") {
    purpose = "marketplace_payment";
    // You might want to derive ideaId from transaction data
  }

  // Create USDC transaction record
  await USDCTransaction.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      from: event.args.from,
      to: event.args.to,
      amount: event.args.value,
      purpose,
      relatedEntityId,
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });

  // Log the event
  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "Transfer",
      eventData: {
        from: event.args.from,
        to: event.args.to,
        value: event.args.value.toString(),
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});

// Handle USDC approvals
ponder.on("MockUSDC:Approval", async ({ event, context }) => {
  const { Approval, EventLog } = context.db;

  // Create or update approval record
  await Approval.upsert({
    id: `${event.args.owner}-${event.args.spender}`,
    create: {
      owner: event.args.owner,
      spender: event.args.spender,
      amount: event.args.value,
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
    update: {
      amount: event.args.value,
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });

  // Log the event
  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "Approval",
      eventData: {
        owner: event.args.owner,
        spender: event.args.spender,
        value: event.args.value.toString(),
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});

// Handle USDC minting - DISABLED: Mint event not available in contract
// ponder.on("MockUSDC:Mint", async ({ event, context }) => {
//   const { USDCTransaction, EventLog } = context.db;

//   // Create mint transaction record
//   await USDCTransaction.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       from: "0x0000000000000000000000000000000000000000",
//       to: event.args.to,
//       amount: event.args.amount,
//       purpose: "mint",
//       relatedEntityId: "",
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "Mint",
//       eventData: {
//         to: event.args.to,
//         amount: event.args.amount.toString(),
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle USDC burning - DISABLED: Burn event not available in contract
// ponder.on("MockUSDC:Burn", async ({ event, context }) => {
//   const { USDCTransaction, EventLog } = context.db;

//   // Create burn transaction record
//   await USDCTransaction.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       from: event.args.from,
//       to: "0x0000000000000000000000000000000000000000",
//       amount: event.args.amount,
//       purpose: "burn",
//       relatedEntityId: "",
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "Burn",
//       eventData: {
//         from: event.args.from,
//         amount: event.args.amount.toString(),
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });