import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient } from "./client";
import type { Insurer } from "./types";

export function useInsurers() {
  const client = useApiClient();
  return useQuery({ queryKey: ["insurers"], queryFn: () => client<Insurer[]>("/insurers") });
}

export function useInsurer(id: string | undefined) {
  const client = useApiClient();
  return useQuery({
    queryKey: ["insurers", id],
    queryFn: () => client<Insurer>(`/insurers/${id}`),
    enabled: !!id,
  });
}

export type InsurerInput = Omit<Insurer, "id" | "customerCount">;

export function useCreateInsurer() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsurerInput) => client<Insurer>("/insurers", jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurers"] }),
  });
}

export function useUpdateInsurer() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsurerInput> }) =>
      client<Insurer>(`/insurers/${id}`, jsonInit("PUT", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurers"] }),
  });
}

export function useDeleteInsurer() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<void>(`/insurers/${id}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurers"] }),
  });
}
