import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient } from "./client";
import type { RequestStatus, ServiceRequest } from "./types";

export function useRequests(status: RequestStatus | "ALLE" = "NEU") {
  const client = useApiClient();
  return useQuery({
    queryKey: ["requests", status],
    queryFn: () => client<ServiceRequest[]>(`/requests?status=${status}`),
  });
}

export function useSetRequestStatus() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      client<ServiceRequest>(`/requests/${id}/status`, jsonInit("PATCH", { status })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });
}
