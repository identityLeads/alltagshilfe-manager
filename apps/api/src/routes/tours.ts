import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";
import { startOfDay, endOfDay } from "../lib/dates.js";

const assignmentInput = z.object({
  staffId: z.string().min(1),
  customerId: z.string().min(1),
  serviceLabel: z.string().min(1),
  date: z.coerce.date(),
  startMinutes: z.number().int().min(0).max(1439),
  durationMinutes: z.number().int().positive(),
});

export const toursRouter = Router();

const assignmentInclude = {
  staff: true,
  customer: true,
};

toursRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const dateParam = req.query.date as string | undefined;
    const reference = dateParam ? new Date(dateParam) : new Date();
    const assignments = await prisma.tourAssignment.findMany({
      where: { date: { gte: startOfDay(reference), lte: endOfDay(reference) } },
      include: assignmentInclude,
      orderBy: { startMinutes: "asc" },
    });
    res.json(assignments);
  })
);

toursRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = assignmentInput.parse(req.body);
    const assignment = await prisma.tourAssignment.create({ data, include: assignmentInclude });
    res.status(201).json(assignment);
  })
);

toursRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = assignmentInput.partial().parse(req.body);
    const assignment = await prisma.tourAssignment.update({
      where: { id: req.params.id },
      data,
      include: assignmentInclude,
    });
    res.json(assignment);
  })
);

toursRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.tourAssignment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
