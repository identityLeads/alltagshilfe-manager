import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";

const taskInput = z.object({
  text: z.string().min(1),
  meta: z.string().optional().nullable(),
  priority: z.enum(["HOCH", "MITTEL", "NIEDRIG"]).default("MITTEL"),
  dueDate: z.coerce.date().optional().nullable(),
});

export const tasksRouter = Router();

tasksRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tasks = await prisma.task.findMany({ orderBy: [{ done: "asc" }, { createdAt: "asc" }] });
    res.json(tasks);
  })
);

tasksRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = taskInput.parse(req.body);
    const task = await prisma.task.create({ data });
    res.status(201).json(task);
  })
);

tasksRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = taskInput.partial().extend({ done: z.boolean().optional() }).parse(req.body);
    const task = await prisma.task.update({ where: { id: req.params.id }, data });
    res.json(task);
  })
);

tasksRouter.patch(
  "/:id/toggle",
  asyncHandler(async (req, res) => {
    const existing = await prisma.task.findUniqueOrThrow({ where: { id: req.params.id } });
    const task = await prisma.task.update({ where: { id: req.params.id }, data: { done: !existing.done } });
    res.json(task);
  })
);

tasksRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
