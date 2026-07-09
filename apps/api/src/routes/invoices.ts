import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler, AppError } from "../lib/http.js";

const lineItemInput = z.object({
  serviceId: z.string().min(1).optional().nullable(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1).default("Std"),
  unitPriceCents: z.number().int().nonnegative(),
});

const invoiceInput = z.object({
  documentType: z.enum(["RECHNUNG", "ANGEBOT"]).default("RECHNUNG"),
  status: z.enum(["ENTWURF", "VERSENDET", "OFFEN", "BEZAHLT", "UEBERFAELLIG"]).default("ENTWURF"),
  customerId: z.string().min(1),
  issueDate: z.coerce.date().optional(),
  period: z.string().min(1),
  assignedToReliefBudget: z.boolean().default(false),
  lineItems: z.array(lineItemInput).min(1),
});

export const invoicesRouter = Router();

function withTotals(invoice: {
  lineItems: { quantity: unknown; unitPriceCents: number }[];
}) {
  const subtotalCents = invoice.lineItems.reduce(
    (sum, li) => sum + Math.round(Number(li.quantity) * li.unitPriceCents),
    0
  );
  return { ...invoice, subtotalCents, totalCents: subtotalCents };
}

async function nextInvoiceNumber(documentType: "RECHNUNG" | "ANGEBOT", status: string) {
  const prefix = status === "ENTWURF" ? "E" : documentType === "ANGEBOT" ? "A" : "R";
  const year = new Date().getFullYear();
  const latest = await prisma.invoice.findFirst({
    where: { number: { startsWith: `${prefix}-${year}-` } },
    orderBy: { number: "desc" },
  });
  const lastSeq = latest ? parseInt(latest.number.split("-")[2] ?? "0", 10) : 0;
  const nextSeq = String(lastSeq + 1).padStart(4, "0");
  return `${prefix}-${year}-${nextSeq}`;
}

const invoiceInclude = {
  customer: { include: { insurer: true } },
  lineItems: { orderBy: { sortOrder: "asc" as const }, include: { service: true } },
};

invoicesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const invoices = await prisma.invoice.findMany({
      where: status ? { status: status as never } : undefined,
      include: invoiceInclude,
      orderBy: { issueDate: "desc" },
    });
    res.json(invoices.map(withTotals));
  })
);

invoicesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id }, include: invoiceInclude });
    if (!invoice) throw new AppError(404, "Dokument nicht gefunden");
    res.json(withTotals(invoice));
  })
);

invoicesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = invoiceInput.parse(req.body);
    const number = await nextInvoiceNumber(data.documentType, data.status);
    const invoice = await prisma.invoice.create({
      data: {
        number,
        documentType: data.documentType,
        status: data.status,
        customerId: data.customerId,
        issueDate: data.issueDate ?? new Date(),
        period: data.period,
        assignedToReliefBudget: data.assignedToReliefBudget,
        lineItems: {
          create: data.lineItems.map((li, index) => ({
            serviceId: li.serviceId ?? undefined,
            description: li.description,
            quantity: li.quantity,
            unit: li.unit,
            unitPriceCents: li.unitPriceCents,
            sortOrder: index,
          })),
        },
      },
      include: invoiceInclude,
    });
    res.status(201).json(withTotals(invoice));
  })
);

invoicesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = invoiceInput.partial().parse(req.body);
    const updateData: Record<string, unknown> = {
      documentType: data.documentType,
      status: data.status,
      customerId: data.customerId,
      issueDate: data.issueDate,
      period: data.period,
      assignedToReliefBudget: data.assignedToReliefBudget,
    };
    if (data.lineItems) {
      await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: req.params.id } });
      updateData.lineItems = {
        create: data.lineItems.map((li, index) => ({
          serviceId: li.serviceId ?? undefined,
          description: li.description,
          quantity: li.quantity,
          unit: li.unit,
          unitPriceCents: li.unitPriceCents,
          sortOrder: index,
        })),
      };
    }
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: updateData,
      include: invoiceInclude,
    });
    res.json(withTotals(invoice));
  })
);

invoicesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
