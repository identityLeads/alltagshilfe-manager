import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient } from "./client";
import type { Invoice, InvoiceStatus } from "./types";

export function useInvoices(status?: InvoiceStatus | "ALLE") {
  const client = useApiClient();
  return useQuery({
    queryKey: ["invoices", status],
    queryFn: () => client<Invoice[]>(`/invoices${status && status !== "ALLE" ? `?status=${status}` : ""}`),
  });
}

export function useInvoice(id: string | undefined) {
  const client = useApiClient();
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => client<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });
}

export interface InvoiceLineItemInput {
  serviceId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
}

export interface InvoiceInput {
  documentType: Invoice["documentType"];
  status: InvoiceStatus;
  customerId: string;
  issueDate?: string;
  period: string;
  assignedToReliefBudget: boolean;
  lineItems: InvoiceLineItemInput[];
}

export function useCreateInvoice() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceInput) => client<Invoice>("/invoices", jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoice() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceInput> }) =>
      client<Invoice>(`/invoices/${id}`, jsonInit("PUT", data)),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", vars.id] });
    },
  });
}

export function useDeleteInvoice() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<void>(`/invoices/${id}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
