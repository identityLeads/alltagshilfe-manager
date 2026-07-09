import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/http.js";

const requestInput = z.object({
  name: z.string().min(1),
  info: z.string().min(1),
});

export const requestsRouter = Router();

requestsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = (req.query.status as string | undefined) ?? "NEU";
    const requests = await prisma.request.findMany({
      where: status === "ALLE" ? undefined : { status: status as never },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  })
);

requestsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = requestInput.parse(req.body);
    const request = await prisma.request.create({ data });
    res.status(201).json(request);
  })
);

requestsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const status = z.enum(["NEU", "ANGENOMMEN", "ABGELEHNT"]).parse(req.body.status);
    const request = await prisma.request.update({ where: { id: req.params.id }, data: { status } });
    res.json(request);
  })
);

requestsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.request.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
