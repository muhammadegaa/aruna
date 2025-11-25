"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import { getBusinessesByOrg } from "@/lib/data/businesses";
import { Business } from "@/lib/firestore/types";

export function useBusinesses(user: User | null, orgId: string | null) {
  const queryClient = useQueryClient();

  const {
    data: businesses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["businesses", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      return await getBusinessesByOrg(orgId);
    },
    enabled: !!orgId,
    staleTime: 30 * 1000, // 30 seconds
  });

  const refreshBusinesses = async () => {
    if (orgId) {
      await queryClient.invalidateQueries({ queryKey: ["businesses", orgId] });
    }
  };

  return {
    businesses,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load businesses") : null,
    refreshBusinesses,
  };
}
