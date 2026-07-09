import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";

const contactInput = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  phone: z.string().min(1),
});

export const contactsRouter = Router({ mergeParams: true });

contactsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = contactInput.parse(req.body);
    const contact = await prisma.contact.create({
      data: { ...data, customerId: req.params.customerId },
    });
    res.status(201).json(contact);
  })
);

contactsRouter.put(
  "/:contactId",
  asyncHandler(async (req, res) => {
    const data = contactInput.partial().parse(req.body);
    const contact = await prisma.contact.update({ where: { id: req.params.contactId }, data });
    res.json(contact);
  })
);

contactsRouter.delete(
  "/:contactId",
  asyncHandler(async (req, res) => {
    const contact = await prisma.contact.findUnique({ where: { id: req.params.contactId } });
    if (!contact || contact.customerId !== req.params.customerId) throw new AppError(404, "Kontakt nicht gefunden");
    await prisma.contact.delete({ where: { id: req.params.contactId } });
    res.status(204).send();
  })
);
