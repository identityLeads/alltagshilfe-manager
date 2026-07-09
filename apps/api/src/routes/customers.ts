import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";
import { reliefBudgetUsedCents, reliefBudgetUsedCentsBulk, RELIEF_BUDGET_MONTHLY_CENTS } from "../lib/budget.js";
import { contactsRouter } from "./contacts.js";
import { documentsRouter } from "./documents.js";
import { serviceRecordsRouter } from "./serviceRecords.js";

const customerInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  district: z.string().optional().nullable(),
  phone: z.string().min(1),
  birthDate: z.coerce.date().optional().nullable(),
  careLevel: z.number().int().min(1).max(5),
  status: z.enum(["AKTIV", "NEU", "PAUSIERT"]).default("NEU"),
  customerSince: z.coerce.date().optional(),
  insurerId: z.string().min(1).optional().nullable(),
});

export const customersRouter = Router();

customersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const customers = await prisma.customer.findMany({
      where: status ? { status: status as never } : undefined,
      include: { insurer: true },
      orderBy: { lastName: "asc" },
    });
    const budgetMap = await reliefBudgetUsedCentsBulk(customers.map((c) => c.id));
    res.json(
      customers.map((c) => ({
        ...c,
        reliefBudgetUsedCents: budgetMap.get(c.id) ?? 0,
        reliefBudgetMonthlyCents: RELIEF_BUDGET_MONTHLY_CENTS,
      }))
    );
  })
);

customersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        insurer: true,
        contacts: { orderBy: { createdAt: "asc" } },
        documents: { orderBy: { uploadedAt: "desc" } },
        serviceRecords: {
          orderBy: { date: "desc" },
          include: { service: true, staff: true },
          take: 20,
        },
      },
    });
    if (!customer) throw new AppError(404, "Kunde nicht gefunden");
    const used = await reliefBudgetUsedCents(customer.id);
    res.json({ ...customer, reliefBudgetUsedCents: used, reliefBudgetMonthlyCents: RELIEF_BUDGET_MONTHLY_CENTS });
  })
);

customersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = customerInput.parse(req.body);
    const customer = await prisma.customer.create({ data, include: { insurer: true } });
    res.status(201).json({ ...customer, reliefBudgetUsedCents: 0, reliefBudgetMonthlyCents: RELIEF_BUDGET_MONTHLY_CENTS });
  })
);

customersRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = customerInput.partial().parse(req.body);
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data, include: { insurer: true } });
    const used = await reliefBudgetUsedCents(customer.id);
    res.json({ ...customer, reliefBudgetUsedCents: used, reliefBudgetMonthlyCents: RELIEF_BUDGET_MONTHLY_CENTS });
  })
);

customersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

customersRouter.use("/:customerId/contacts", contactsRouter);
customersRouter.use("/:customerId/documents", documentsRouter);
customersRouter.use("/:customerId/service-records", serviceRecordsRouter);
