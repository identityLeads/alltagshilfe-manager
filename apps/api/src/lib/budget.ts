import { prisma } from "./prisma.js";
import { startOfMonth, endOfMonth } from "./dates.js";

export const RELIEF_BUDGET_MONTHLY_CENTS = 12500;

export async function reliefBudgetUsedCents(customerId: string, reference: Date = new Date()) {
  const result = await prisma.serviceRecord.aggregate({
    where: {
      customerId,
      billedToReliefBudget: true,
      date: { gte: startOfMonth(reference), lt: endOfMonth(reference) },
    },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}

export async function reliefBudgetUsedCentsBulk(customerIds: string[], reference: Date = new Date()) {
  if (customerIds.length === 0) return new Map<string, number>();
  const rows = await prisma.serviceRecord.groupBy({
    by: ["customerId"],
    where: {
      customerId: { in: customerIds },
      billedToReliefBudget: true,
      date: { gte: startOfMonth(reference), lt: endOfMonth(reference) },
    },
    _sum: { amountCents: true },
  });
  return new Map(rows.map((r) => [r.customerId, r._sum.amountCents ?? 0]));
}
