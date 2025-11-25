"use client";

import { useState, useEffect } from "react";
import { createBusiness } from "@/lib/data/businesses";
import Workspace from "@/components/workspace/Workspace";
import { seedPadelBusiness, seedFnbBusiness } from "@/lib/seed";
import { Plus, Loader2, LogOut, Sparkles, TrendingUp, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useRouter } from "next/navigation";
import { getBusinessMetrics } from "@/lib/data/metrics";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { getKpiSummary } from "@/lib/agent/tools";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError, signOut } = useAuth();
  const { organizations, isLoading: orgsLoading, createOrg } = useOrganizations(user);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const { businesses, isLoading: businessesLoading, refreshBusinesses } = useBusinesses(user, selectedOrgId);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted orgId immediately from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !selectedOrgId) {
      const persistedOrgId = localStorage.getItem("selectedOrgId");
      if (persistedOrgId) {
        setSelectedOrgId(persistedOrgId);
      }
    }
  }, []);

  // Auto-create organization if user has none
  useEffect(() => {
    if (!orgsLoading && organizations.length === 0 && user && !selectedOrgId && !isCreating) {
      const orgName = user.email?.split("@")[0] || "My";
      createOrg(`${orgName}'s Organization`, "free")
        .then((orgId) => {
          setSelectedOrgId(orgId);
          if (typeof window !== "undefined") {
            localStorage.setItem("selectedOrgId", orgId);
          }
        })
        .catch((err) => {
          console.error("Failed to create organization:", err);
          setError("Failed to initialize organization. Please refresh.");
        });
    } else if (organizations.length > 0 && !selectedOrgId && !isCreating) {
      const firstOrg = organizations[0];
      setSelectedOrgId(firstOrg.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedOrgId", firstOrg.id);
      }
    }
  }, [orgsLoading, organizations, user, selectedOrgId, createOrg, isCreating]);

  // PRODUCT SENSE: Auto-redirect single business users to workspace
  useEffect(() => {
    if (!businessesLoading && businesses.length === 1 && !selectedBusinessId && !isCreating) {
      const business = businesses[0];
      setSelectedBusinessId(business.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedBusinessId", business.id);
      }
    }
  }, [businessesLoading, businesses, selectedBusinessId, isCreating]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [authLoading, user, router]);

  const handleCreateDemoBusiness = async (type: "padel" | "fnb") => {
    if (!user || !selectedOrgId) {
      setError("Please wait for authentication to complete");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const businessId = await createBusiness({
        name: type === "padel" ? "Demo Padel Court" : "Demo F&B Restaurant",
        type,
        currency: "IDR",
        ownerUid: user.uid,
        orgId: selectedOrgId,
      });

      // Redirect immediately - seed in background
      setSelectedBusinessId(businessId);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedBusinessId", businessId);
      }
      await refreshBusinesses();

      // Seed in background (non-blocking)
      if (type === "padel") {
        seedPadelBusiness(businessId, selectedOrgId).catch((err) => {
          console.error("Background seeding failed:", err);
        });
      } else {
        seedFnbBusiness(businessId, selectedOrgId).catch((err) => {
          console.error("Background seeding failed:", err);
        });
      }
    } catch (error) {
      console.error("Failed to create demo business:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create demo business. Please try again."
      );
      setIsCreating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Loading state
  if (authLoading || businessesLoading || orgsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-neutral-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
          />
          <p className="text-neutral-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!authLoading && !user) {
    return null; // Will redirect via useEffect
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-neutral-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-8 bg-white rounded-xl border border-error-200 shadow-medium"
        >
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Error</h2>
          <p className="text-neutral-600 mb-6">{authError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/auth/signin")}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // PRODUCT SENSE: If single business, go straight to workspace
  if (selectedBusinessId) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedBusinessId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Workspace
            businessId={selectedBusinessId}
            onBack={() => {
              setSelectedBusinessId(null);
              if (typeof window !== "undefined") {
                localStorage.removeItem("selectedBusinessId");
              }
            }}
            onBusinessChange={refreshBusinesses}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // EMPTY STATE: No businesses - show onboarding
  if (businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div
                className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
                onClick={() => router.push("/")}
              >
                Aruna
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <div className="text-sm text-neutral-600 hidden sm:block">{user.email}</div>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
              Welcome to Aruna
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto">
              Get started by creating a demo business. Explore AI-powered analytics in seconds.
            </p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm max-w-2xl mx-auto"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCreateDemoBusiness("padel")}
              disabled={isCreating}
              className="p-8 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <span className="text-2xl">🏸</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Padel Court</h3>
                <p className="text-neutral-600 mb-4">
                  Track occupancy rates, court performance, and revenue analytics
                </p>
                {isCreating ? (
                  <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                ) : (
                  <div className="flex items-center text-primary-600 font-medium">
                    Get started <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCreateDemoBusiness("fnb")}
              disabled={isCreating}
              className="p-8 border-2 border-neutral-200 rounded-xl hover:border-success-500 hover:bg-success-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-success-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-success-200 transition-colors">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Food & Beverage</h3>
                <p className="text-neutral-600 mb-4">
                  Monitor sales, profit margins, and menu item performance
                </p>
                {isCreating ? (
                  <Loader2 className="w-5 h-5 text-success-600 animate-spin" />
                ) : (
                  <div className="flex items-center text-success-600 font-medium">
                    Get started <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // MULTIPLE BUSINESSES: Show business switcher with real metrics
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
              onClick={() => router.push("/")}
            >
              Aruna
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-neutral-600 hidden sm:block">{user.email}</div>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Your Businesses</h1>
          <p className="text-neutral-600">Select a business to view analytics and insights</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {businesses.map((business) => (
            <BusinessDashboardCard
              key={business.id}
              business={business}
              onClick={() => {
                setSelectedBusinessId(business.id);
                if (typeof window !== "undefined") {
                  localStorage.setItem("selectedBusinessId", business.id);
                }
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-neutral-200 p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Create Another Business</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => handleCreateDemoBusiness("padel")}
              disabled={isCreating}
              className="p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏸</span>
                </div>
                <div>
                  <div className="font-medium text-neutral-900">Padel Court</div>
                  <div className="text-sm text-neutral-600">Track occupancy & revenue</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleCreateDemoBusiness("fnb")}
              disabled={isCreating}
              className="p-4 border-2 border-neutral-200 rounded-lg hover:border-success-500 hover:bg-success-50 transition-all text-left disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🍽️</span>
                </div>
                <div>
                  <div className="font-medium text-neutral-900">Food & Beverage</div>
                  <div className="text-sm text-neutral-600">Monitor sales & margins</div>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Business Dashboard Card with real metrics
function BusinessDashboardCard({ business, onClick }: { business: any; onClick: () => void }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["businessMetrics", business.id],
    queryFn: () => getBusinessMetrics(business.id),
    staleTime: 30 * 1000,
  });

  const { data: kpis } = useQuery({
    queryKey: ["businessKPIs", business.id],
    queryFn: async () => {
      const result = await getKpiSummary(business.id, "month");
      return result.success && result.data ? (result.data as any).kpis : [];
    },
    enabled: !!business.id,
    staleTime: 60 * 1000,
  });

  const revenueKpi = kpis?.find((k: any) => k.id === "revenue_total");
  const occupancyKpi = kpis?.find((k: any) => k.id === "occupancy_rate");
  const marginKpi = kpis?.find((k: any) => k.id === "gross_margin");

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-neutral-200 p-6 shadow-soft hover:shadow-medium hover:border-primary-300 transition-all text-left w-full group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1 truncate">{business.name}</h3>
          <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md capitalize inline-block">
            {business.type}
          </span>
        </div>
        <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
          <div className="h-4 bg-neutral-200 rounded animate-pulse w-2/3"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {revenueKpi && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <DollarSign className="w-4 h-4" />
                <span>Revenue</span>
              </div>
              <div className="text-lg font-bold text-neutral-900">
                {formatCurrency(revenueKpi.value, business.currency)}
              </div>
            </div>
          )}
          
          {business.type === "padel" && occupancyKpi && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <TrendingUp className="w-4 h-4" />
                <span>Occupancy</span>
              </div>
              <div className="text-lg font-bold text-neutral-900">
                {occupancyKpi.value.toFixed(1)}%
              </div>
            </div>
          )}

          {business.type === "fnb" && marginKpi && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <TrendingUp className="w-4 h-4" />
                <span>Gross Margin</span>
              </div>
              <div className="text-lg font-bold text-neutral-900">
                {marginKpi.value.toFixed(1)}%
              </div>
            </div>
          )}

          {metrics && metrics.lastTransactionDate && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100">
              <Calendar className="w-3 h-3" />
              <span>
                Last activity: {new Date(metrics.lastTransactionDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
}
