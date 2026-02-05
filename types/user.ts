// app/lib/types.ts (or inside your DB file)
import { Prisma } from '@prisma/client';

// 1. Define the Selection Pattern
// We use 'satisfies' to ensure we only select valid fields from the User model
export const userDashboardSelect = {
  firstName: true,
  phoneNumber: true,
  subscriptionExpiresAt: true,
  notifyTelegram: true,
  notifyWeb: true, // or notifyApp based on your schema
} satisfies Prisma.UserSelect;

// 2. Generate the Type automatically based on that selection
export type DashboardUser = Prisma.UserGetPayload<{
  select: typeof userDashboardSelect;
}>;
