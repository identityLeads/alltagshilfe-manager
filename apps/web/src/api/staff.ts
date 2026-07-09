import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient } from "./client";
import type { Staff } from "./types";

export function useStaffList() {
  const client = useApiClient();
  return useQuery({ queryKey: ["staff"], queryFn: () => client<Staff[]>("/staff") });
}

export function useStaffMember(id: string | undefined) {
  const client = useApiClient();
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => client<Staff>(`/staff/${id}`),
    enabled: !!id,
  });
}

export type StaffInput = Omit<Staff, "id" | "utilizationPct">;

export function useCreateStaff() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StaffInput) => client<Staff>("/staff", jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useUpdateStaff() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffInput> }) =>
      client<Staff>(`/staff/${id}`, jsonInit("PUT", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useDeleteStaff() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<void>(`/staff/${id}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}
