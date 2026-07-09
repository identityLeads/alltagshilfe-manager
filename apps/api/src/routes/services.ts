import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";

const serviceInput = z.object({
  name: z.string().min(1),
  category: z.enum(["HAUSHALTSNAHE_DL", "BETREUUNG_IM_ALLTAG", "SONSTIGES"]),
  billingType: z.enum(["KASSE_45B", "SELBSTZAHLER"]),
  priceCents: z.number().int().nonnegative(),
  unit: z.string().min(1).default("pro Stunde"),
  icon: z.string().min(1).default("ph ph-hand-heart"),
});

export const servicesRouter = Router();

servicesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const category = req.query.category as string | undefined;
    const services = await prisma.service.findMany({
      where: category ? { category: category as never } : undefined,
      orderBy: { name: "asc" },
    });
    res.json(services);
  })
);

servicesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) throw new AppError(404, "Leistung nicht gefunden");
    res.json(service);
  })
);

servicesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = serviceInput.parse(req.body);
    const service = await prisma.service.create({ data });
    res.status(201).json(service);
  })
);

servicesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = serviceInput.partial().parse(req.body);
    const service = await prisma.service.update({ where: { id: req.params.id }, data });
    res.json(service);
  })
);

servicesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
