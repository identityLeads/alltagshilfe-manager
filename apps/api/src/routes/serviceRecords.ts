import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";

const recordInput = z.object({
  serviceId: z.string().min(1).optional().nullable(),
  staffId: z.string().min(1).optional().nullable(),
  date: z.coerce.date(),
  amountCents: z.number().int().nonnegative(),
  billedToReliefBudget: z.boolean().default(true),
});

export const serviceRecordsRouter = Router({ mergeParams: true });

serviceRecordsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = recordInput.parse(req.body);
    const record = await prisma.serviceRecord.create({
      data: { ...data, customerId: req.params.customerId },
      include: { service: true, staff: true },
    });
    res.status(201).json(record);
  })
);

serviceRecordsRouter.delete(
  "/:recordId",
  asyncHandler(async (req, res) => {
    const record = await prisma.serviceRecord.findUnique({ where: { id: req.params.recordId } });
    if (!record || record.customerId !== req.params.customerId) throw new AppError(404, "Eintrag nicht gefunden");
    await prisma.serviceRecord.delete({ where: { id: req.params.recordId } });
    res.status(204).send();
  })
);
