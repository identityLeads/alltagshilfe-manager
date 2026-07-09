import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";

const insurerInput = z.object({
  name: z.string().min(1),
  type: z.string().min(1).default("Gesetzliche Pflegekasse"),
  ik: z.string().min(1),
  contactPerson: z.string().min(1),
  phone: z.string().min(1),
  billingMethod: z.enum(["DTA_302", "PAPIER_POST"]),
});

export const insurersRouter = Router();

insurersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const insurers = await prisma.insurer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { customers: true } } },
    });
    res.json(
      insurers.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        ik: i.ik,
        contactPerson: i.contactPerson,
        phone: i.phone,
        billingMethod: i.billingMethod,
        customerCount: i._count.customers,
      }))
    );
  })
);

insurersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const insurer = await prisma.insurer.findUnique({ where: { id: req.params.id } });
    if (!insurer) throw new AppError(404, "Kostenträger nicht gefunden");
    res.json(insurer);
  })
);

insurersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = insurerInput.parse(req.body);
    const insurer = await prisma.insurer.create({ data });
    res.status(201).json(insurer);
  })
);

insurersRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = insurerInput.partial().parse(req.body);
    const insurer = await prisma.insurer.update({ where: { id: req.params.id }, data });
    res.json(insurer);
  })
);

insurersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.insurer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
