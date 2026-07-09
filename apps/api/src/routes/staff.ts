import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";
import { currentWeekRange } from "../lib/dates.js";

const staffInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  area: z.string().min(1),
  phone: z.string().min(1),
  qualifications: z.array(z.string()).default([]),
  availabilityLabel: z.string().min(1),
  weeklyCapacityHours: z.number().int().positive().default(30),
});

export const staffRouter = Router();

async function withUtilization<T extends { id: string; weeklyCapacityHours: number }>(members: T[]) {
  const { start, end } = currentWeekRange();
  const assignments = await prisma.tourAssignment.groupBy({
    by: ["staffId"],
    where: { date: { gte: start, lt: end } },
    _sum: { durationMinutes: true },
  });
  const minutesByStaff = new Map(assignments.map((a) => [a.staffId, a._sum.durationMinutes ?? 0]));
  return members.map((m) => {
    const minutes = minutesByStaff.get(m.id) ?? 0;
    const capacityMinutes = m.weeklyCapacityHours * 60;
    const utilizationPct = capacityMinutes > 0 ? Math.round((minutes / capacityMinutes) * 100) : 0;
    return { ...m, utilizationPct };
  });
}

staffRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const staff = await prisma.staff.findMany({ orderBy: { lastName: "asc" } });
    res.json(await withUtilization(staff));
  })
);

staffRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const member = await prisma.staff.findUnique({ where: { id: req.params.id } });
    if (!member) throw new AppError(404, "Mitarbeiter nicht gefunden");
    const [withStats] = await withUtilization([member]);
    res.json(withStats);
  })
);

staffRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = staffInput.parse(req.body);
    const member = await prisma.staff.create({ data });
    res.status(201).json({ ...member, utilizationPct: 0 });
  })
);

staffRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = staffInput.partial().parse(req.body);
    const member = await prisma.staff.update({ where: { id: req.params.id }, data });
    const [withStats] = await withUtilization([member]);
    res.json(withStats);
  })
);

staffRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.staff.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
