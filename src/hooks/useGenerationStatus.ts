import { useQuery } from "@tanstack/react-query";

import { fetchGenerationStatus } from "@/services/audiobook/audiobookService";

/**
 * Polls audiobook generation status until terminal states.
 */
export function useGenerationStatus(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["audiobook-status", id],
    queryFn: () => fetchGenerationStatus(id!),
    enabled: Boolean(id) && enabled,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      if (s === "READY" || s === "FAILED") return false;
      return 2000;
    },
  });
}
