import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient } from "./client";
import type { Service, ServiceCategory } from "./types";

export function useServices(category?: ServiceCategory) {
  const client = useApiClient();
  return useQuery({
    queryKey: ["services", category],
    queryFn: () => client<Service[]>(`/services${category ? `?category=${category}` : ""}`),
  });
}

export type ServiceInput = Omit<Service, "id">;

export function useCreateService() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ServiceInput) => client<Service>("/services", jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceInput> }) =>
      client<Service>(`/services/${id}`, jsonInit("PUT", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<void>(`/services/${id}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}
