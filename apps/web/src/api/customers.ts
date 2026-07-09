import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient, useAuthorizedFetch } from "./client";
import type { Contact, Customer, CustomerDocument, CustomerStatus, ServiceRecord } from "./types";

export function useCustomers(status?: CustomerStatus | "ALLE") {
  const client = useApiClient();
  return useQuery({
    queryKey: ["customers", status],
    queryFn: () => client<Customer[]>(`/customers${status && status !== "ALLE" ? `?status=${status}` : ""}`),
  });
}

export function useCustomer(id: string | undefined) {
  const client = useApiClient();
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => client<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

export type CustomerInput = Omit<
  Customer,
  "id" | "insurer" | "contacts" | "documents" | "serviceRecords" | "reliefBudgetUsedCents" | "reliefBudgetMonthlyCents"
>;

export function useCreateCustomer() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CustomerInput>) => client<Customer>("/customers", jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerInput> }) =>
      client<Customer>(`/customers/${id}`, jsonInit("PUT", data)),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", vars.id] });
    },
  });
}

export function useDeleteCustomer() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<void>(`/customers/${id}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export type ContactInput = Omit<Contact, "id" | "customerId">;

export function useCreateContact(customerId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactInput) => client<Contact>(`/customers/${customerId}/contacts`, jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", customerId] }),
  });
}

export function useDeleteContact(customerId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) =>
      client<void>(`/customers/${customerId}/contacts/${contactId}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", customerId] }),
  });
}

export function useUploadDocument(customerId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return client<CustomerDocument>(`/customers/${customerId}/documents`, { method: "POST", body: form });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", customerId] }),
  });
}

export function useDeleteDocument(customerId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) =>
      client<void>(`/customers/${customerId}/documents/${documentId}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", customerId] }),
  });
}

export type ServiceRecordInput = {
  serviceId?: string | null;
  staffId?: string | null;
  date: string;
  amountCents: number;
  billedToReliefBudget: boolean;
};

export function useCreateServiceRecord(customerId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceRecordInput) =>
      client<ServiceRecord>(`/customers/${customerId}/service-records`, jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", customerId] }),
  });
}

export function useDeleteServiceRecord(customerId: string) {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) =>
      client<void>(`/customers/${customerId}/service-records/${recordId}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers", customerId] }),
  });
}

export function useDownloadDocument(customerId: string) {
  const authorizedFetch = useAuthorizedFetch();
  return async (doc: CustomerDocument) => {
    const res = await authorizedFetch(`/customers/${customerId}/documents/${doc.id}/download`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = doc.name;
    link.click();
    URL.revokeObjectURL(url);
  };
}
