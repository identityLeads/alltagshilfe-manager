import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "./client";
import type { DashboardData } from "./types";

export function useDashboard() {
  const client = useApiClient();
  return useQuery({ queryKey: ["dashboard"], queryFn: () => client<DashboardData>("/dashboard") });
}
