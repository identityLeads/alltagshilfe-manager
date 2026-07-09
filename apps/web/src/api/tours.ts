import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient } from "./client";
import type { TourAssignment } from "./types";

export function useTourAssignments(date: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ["tours", date],
    queryFn: () => client<TourAssignment[]>(`/tours?date=${date}`),
  });
}

export interface TourAssignmentInput {
  staffId: string;
  customerId: string;
  serviceLabel: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
}

export function useCreateTourAssignment() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TourAssignmentInput) => client<TourAssignment>("/tours", jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tours"] }),
  });
}

export function useUpdateTourAssignment() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TourAssignmentInput> }) =>
      client<TourAssignment>(`/tours/${id}`, jsonInit("PUT", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tours"] }),
  });
}

export function useDeleteTourAssignment() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<void>(`/tours/${id}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tours"] }),
  });
}
