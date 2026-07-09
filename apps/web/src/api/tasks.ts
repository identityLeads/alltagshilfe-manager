import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jsonInit, useApiClient } from "./client";
import type { Task } from "./types";

export function useTasks() {
  const client = useApiClient();
  return useQuery({ queryKey: ["tasks"], queryFn: () => client<Task[]>("/tasks") });
}

export function useToggleTask() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<Task>(`/tasks/${id}/toggle`, jsonInit("PATCH")),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const previous = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(["tasks"], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export type TaskInput = Omit<Task, "id" | "done">;

export function useCreateTask() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskInput) => client<Task>("/tasks", jsonInit("POST", data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const client = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => client<void>(`/tasks/${id}`, jsonInit("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
