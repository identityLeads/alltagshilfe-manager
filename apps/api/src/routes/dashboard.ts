import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";
import { startOfDay, endOfDay, currentWeekRange } from "../lib/dates.js";
import { reliefBudgetUsedCentsBulk, RELIEF_BUDGET_MONTHLY_CENTS } from "../lib/budget.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const today = { gte: startOfDay(now), lte: endOfDay(now) };

    const [openInvoices, todaysAssignments, newRequestsCount, customers, week] = await Promise.all([
      prisma.invoice.findMany({
        where: { status: { in: ["OFFEN", "UEBERFAELLIG"] } },
        include: { lineItems: true },
      }),
      prisma.tourAssignment.findMany({
        where: { date: today },
        include: { staff: true, customer: true },
        orderBy: { startMinutes: "asc" },
      }),
      prisma.request.count({ where: { status: "NEU" } }),
      prisma.customer.findMany(),
      (async () => {
        const { start, end } = currentWeekRange(now);
        const assignments = await prisma.tourAssignment.findMany({
          where: { date: { gte: start, lt: end } },
          select: { date: true },
        });
        const counts = [0, 0, 0, 0, 0, 0, 0];
        for (const a of assignments) {
          const idx = (new Date(a.date).getDay() + 6) % 7;
          counts[idx] += 1;
        }
        return counts;
      })(),
    ]);

    const budgetMap = await reliefBudgetUsedCentsBulk(customers.map((c) => c.id));
    const avgBudgetPct =
      customers.length > 0
        ? Math.round(
            (customers.reduce((sum, c) => sum + (budgetMap.get(c.id) ?? 0) / RELIEF_BUDGET_MONTHLY_CENTS, 0) /
              customers.length) *
              100
          )
        : 0;

    const distinctStaffToday = new Set(todaysAssignments.map((a) => a.staffId)).size;
    const overdueCount = openInvoices.filter((i) => i.status === "UEBERFAELLIG").length;
    const openInvoicesTotalCents = openInvoices.reduce(
      (sum, i) => sum + i.lineItems.reduce((s, li) => s + Math.round(Number(li.quantity) * li.unitPriceCents), 0),
      0
    );

    res.json({
      openInvoicesCount: openInvoices.length,
      openInvoicesOverdueCount: overdueCount,
      toursTodayCount: todaysAssignments.length,
      staffTodayCount: distinctStaffToday,
      newRequestsCount,
      avgBudgetUsedPct: avgBudgetPct,
      week,
      upcomingToday: todaysAssignments.slice(0, 6),
      openInvoicesTotalCents,
    });
  })
);
