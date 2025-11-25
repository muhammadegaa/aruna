"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import { getBusinessesByOwner } from "@/lib/firestore/business";

export function useBusinesses(user: User | null) {
  const queryClient = useQueryClient();

  const {
    data: businesses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["businesses", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      return await getBusinessesByOwner(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 30 * 1000, // 30 seconds
  });

  const refreshBusinesses = async () => {
    if (user?.uid) {
      await queryClient.invalidateQueries({ queryKey: ["businesses", user.uid] });
    }
  };

  return {
    businesses,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load businesses") : null,
    refreshBusinesses,
  };
}

