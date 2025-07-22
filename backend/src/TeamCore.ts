import { ponder } from "@/generated";

// Handle team creation
ponder.on("TeamCore:TeamCreated", async ({ event, context }) => {
  const { Team, TeamMember, EventLog } = context.db;

  // Create team record
  await Team.create({
    id: event.args.teamId.toString(),
    data: {
      teamId: event.args.teamId,
      leader: event.args.leader,
      teamName: event.args.teamName,
      description: "", // Will be populated from contract call
      projectName: "", // Will be populated from contract call
      requiredMembers: 0, // Will be populated from contract call
      currentMembers: 1, // Leader is the first member
      requiredStake: 0n, // Will be populated from contract call
      roles: [], // Will be populated from contract call
      tags: [], // Will be populated from contract call
      status: "active",
      createdAt: Number(event.block.timestamp),
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
    },
  });

  // Add leader as first team member
  await TeamMember.create({
    id: `${event.args.teamId}-${event.args.leader}`,
    data: {
      teamId: event.args.teamId.toString(),
      memberAddress: event.args.leader,
      role: "leader",
      joinedAt: Number(event.block.timestamp),
      stakeAmount: 0n,
      isActive: true,
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
    },
  });

  // Log the event
  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "TeamCreated",
      eventData: {
        teamId: event.args.teamId.toString(),
        leader: event.args.leader,
        teamName: event.args.teamName,
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});

// Handle team member joining
ponder.on("TeamCore:JoinTeam", async ({ event, context }) => {
  const { TeamMember, Team, EventLog } = context.db;

  // Add new team member
  await TeamMember.create({
    id: `${event.args.teamId}-${event.args.member}`,
    data: {
      teamId: event.args.teamId.toString(),
      memberAddress: event.args.member,
      role: event.args.role || "member",
      joinedAt: Number(event.block.timestamp),
      stakeAmount: event.args.stakeAmount || 0n,
      isActive: true,
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
    },
  });

  // Update team's current member count
  const team = await Team.findUnique({
    id: event.args.teamId.toString(),
  });

  if (team) {
    await Team.update({
      id: event.args.teamId.toString(),
      data: {
        currentMembers: team.currentMembers + 1,
      },
    });
  }

  // Log the event
  await EventLog.create({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    data: {
      contractAddress: event.log.address,
      eventName: "JoinTeam",
      eventData: {
        teamId: event.args.teamId.toString(),
        member: event.args.member,
        role: event.args.role || "member",
        stakeAmount: event.args.stakeAmount?.toString() || "0",
      },
      transactionHash: event.transaction.hash,
      blockNumber: event.block.number,
      timestamp: Number(event.block.timestamp),
    },
  });
});

// Handle team member leaving - DISABLED: MemberLeft event not available in contract
// ponder.on("TeamCore:MemberLeft", async ({ event, context }) => {
//   const { TeamMember, Team, EventLog } = context.db;

//   // Mark member as inactive
//   await TeamMember.update({
//     id: `${event.args.teamId}-${event.args.member}`,
//     data: {
//       isActive: false,
//     },
//   });

//   // Update team's current member count
//   const team = await Team.findUnique({
//     id: event.args.teamId.toString(),
//   });

//   if (team) {
//     await Team.update({
//       id: event.args.teamId.toString(),
//       data: {
//         currentMembers: Math.max(0, team.currentMembers - 1),
//       },
//     });
//   }

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "MemberLeft",
//       eventData: {
//         teamId: event.args.teamId.toString(),
//         member: event.args.member,
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle team status updates - DISABLED: TeamStatusUpdated event not available in contract
// ponder.on("TeamCore:TeamStatusUpdated", async ({ event, context }) => {
//   const { Team, EventLog } = context.db;

//   await Team.update({
//     id: event.args.teamId.toString(),
//     data: {
//       status: event.args.status,
//     },
//   });

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "TeamStatusUpdated",
//       eventData: {
//         teamId: event.args.teamId.toString(),
//         status: event.args.status,
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// Handle stake deposits - DISABLED: StakeDeposited event not available in contract
// ponder.on("TeamCore:StakeDeposited", async ({ event, context }) => {
//   const { TeamMember, EventLog } = context.db;

//   // Update member's stake amount
//   const member = await TeamMember.findUnique({
//     id: `${event.args.teamId}-${event.args.member}`,
//   });

//   if (member) {
//     await TeamMember.update({
//       id: `${event.args.teamId}-${event.args.member}`,
//       data: {
//         stakeAmount: member.stakeAmount + event.args.amount,
//       },
//     });
//   }

//   // Log the event
//   await EventLog.create({
//     id: `${event.transaction.hash}-${event.log.logIndex}`,
//     data: {
//       contractAddress: event.log.address,
//       eventName: "StakeDeposited",
//       eventData: {
//         teamId: event.args.teamId.toString(),
//         member: event.args.member,
//         amount: event.args.amount.toString(),
//       },
//       transactionHash: event.transaction.hash,
//       blockNumber: event.block.number,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });