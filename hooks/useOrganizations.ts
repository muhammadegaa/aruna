"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import {
  getOrganizationsByUser,
  createOrganization,
  getOrganization,
  getUserRole,
} from "@/lib/data/organizations";
import { Organization } from "@/lib/firestore/types";

export function useOrganizations(user: User | null) {
  const queryClient = useQueryClient();

  const {
    data: organizations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organizations", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      return await getOrganizationsByUser(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 60 * 1000, // 1 minute
  });

  const refreshOrganizations = async () => {
    if (user?.uid) {
      await queryClient.invalidateQueries({ queryKey: ["organizations", user.uid] });
    }
  };

  const createOrg = async (name: string, plan: "free" | "pro" = "free") => {
    if (!user?.uid) throw new Error("User not authenticated");
    const orgId = await createOrganization(name, user.uid, plan);
    await refreshOrganizations();
    return orgId;
  };

  return {
    organizations,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load organizations") : null,
    refreshOrganizations,
    createOrg,
  };
}

export function useOrganization(orgId: string | null) {
  const {
    data: organization,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      return await getOrganization(orgId);
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  return {
    organization,
    isLoading,
    error: error ? (error instanceof Error ? error.message : null) : null,
  };
}

export function useUserRole(orgId: string | null, userId: string | null) {
  const {
    data: role,
    isLoading,
  } = useQuery({
    queryKey: ["userRole", orgId, userId],
    queryFn: async () => {
      if (!orgId || !userId) return null;
      return await getUserRole(orgId, userId);
    },
    enabled: !!orgId && !!userId,
    staleTime: 60 * 1000,
  });

  return { role, isLoading };
}

