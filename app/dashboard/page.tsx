"use client";

import { useState, useEffect } from "react";
import { createBusiness } from "@/lib/data/businesses";
import Workspace from "@/components/workspace/Workspace";
import { seedPadelBusiness, seedFnbBusiness } from "@/lib/seed";
import { Plus, Building2, Loader2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { useAuth } from "@/hooks/useAuth";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError, signOut } = useAuth();
  const { organizations, isLoading: orgsLoading, createOrg } = useOrganizations(user);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const { businesses, isLoading: businessesLoading, refreshBusinesses } = useBusinesses(user, selectedOrgId);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-create organization if user has none (backward compatibility)
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
      // Use first organization
      const firstOrg = organizations[0];
      setSelectedOrgId(firstOrg.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedOrgId", firstOrg.id);
      }
    }
  }, [orgsLoading, organizations, user, selectedOrgId, createOrg, isCreating]);

  // Load persisted selections from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const persistedOrgId = localStorage.getItem("selectedOrgId");
      if (persistedOrgId && organizations.some((o) => o.id === persistedOrgId)) {
        setSelectedOrgId(persistedOrgId);
      }
      
      const persistedBusinessId = localStorage.getItem("selectedBusinessId");
      if (persistedBusinessId && businesses.some((b) => b.id === persistedBusinessId)) {
        setSelectedBusinessId(persistedBusinessId);
      }
    }
  }, [organizations, businesses]);

  // Redirect to sign-in if not authenticated (after loading completes)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [authLoading, user, router]);

  const handleCreateDemoBusiness = async (type: "padel" | "fnb") => {
    if (!user) {
      setError("Please wait for authentication to complete");
      return;
    }

    if (!selectedOrgId) {
      setError("Please wait for organization to load");
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
        orgId: selectedOrgId, // Associate with organization
      });

      // Seed sample data
      if (type === "padel") {
        await seedPadelBusiness(businessId, selectedOrgId);
      } else {
        await seedFnbBusiness(businessId, selectedOrgId);
      }

      // Refresh businesses list
      await refreshBusinesses();
      setSelectedBusinessId(businessId);
      
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedBusinessId", businessId);
      }
      
      console.log("Demo business created:", { businessId, type });
    } catch (error) {
      console.error("Failed to create demo business:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create demo business. Please try again."
      );
    } finally {
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

  if (authLoading) {
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-neutral-600 text-lg"
          >
            Loading...
          </motion.p>
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
            onBack={() => setSelectedBusinessId(null)}
            onBusinessChange={refreshBusinesses}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="min-h-screen bg-gradient-to-b from-neutral-50 to-white"
    >
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
              onClick={() => router.push("/")}
            >
              Aruna
            </motion.div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-neutral-600">
                  {user.email}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-neutral-900 mb-4"
            >
              Welcome to Aruna
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-neutral-600"
            >
              {businesses.length > 0
                ? "Select a business or create a new one"
                : "You're all set! Create a demo business to explore Aruna's AI-powered analytics"}
            </motion.p>
          </div>
        </ScrollReveal>

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

        {businessesLoading || orgsLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Loading your businesses...</p>
            </div>
          </div>
        ) : businesses.length > 0 ? (
          <ScrollReveal delay={0.2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 bg-white rounded-xl border border-neutral-200 p-6 shadow-soft"
            >
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Your Businesses</h2>
              <StaggerContainer className="space-y-3">
                {businesses.map((business) => (
                  <StaggerItem key={business.id}>
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBusinessId(business.id)}
                      className="w-full flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                          className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"
                        >
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </motion.div>
                        <div>
                          <div className="font-medium text-neutral-900">{business.name}</div>
                          <div className="text-sm text-neutral-500 capitalize">{business.type}</div>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Plus className="w-5 h-5 text-neutral-400" />
                      </motion.div>
                    </motion.button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </motion.div>
          </ScrollReveal>
        ) : null}

        <ScrollReveal delay={0.3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-neutral-200 p-8 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {businesses.length > 0 ? "Create Another Demo Business" : "Get Started with a Demo"}
            </h2>
            <p className="text-neutral-600 mb-6">
              {businesses.length > 0
                ? "Create another demo business to explore different industry modules"
                : "Choose a demo business type to explore Aruna's AI-powered analytics. No credit card required."}
            </p>

            <StaggerContainer className="grid md:grid-cols-2 gap-4">
              <StaggerItem>
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreateDemoBusiness("padel")}
                  disabled={isCreating}
                  className="p-6 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed w-full group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors"
                    >
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </motion.div>
                    {isCreating ? (
                      <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                    ) : (
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Plus className="w-5 h-5 text-neutral-400 group-hover:text-primary-600" />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1 relative z-10">Padel Court</h3>
                  <p className="text-sm text-neutral-600 relative z-10">
                    Track occupancy, revenue, and court performance
                  </p>
                </motion.button>
              </StaggerItem>

              <StaggerItem>
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCreateDemoBusiness("fnb")}
                  disabled={isCreating}
                  className="p-6 border-2 border-neutral-200 rounded-xl hover:border-success-500 hover:bg-success-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed w-full group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-success-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center group-hover:bg-success-200 transition-colors"
                    >
                      <Building2 className="w-6 h-6 text-success-600" />
                    </motion.div>
                    {isCreating ? (
                      <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                    ) : (
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Plus className="w-5 h-5 text-neutral-400 group-hover:text-success-600" />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1 relative z-10">Food & Beverage</h3>
                  <p className="text-sm text-neutral-600 relative z-10">
                    Monitor sales, margins, and menu performance
                  </p>
                </motion.button>
              </StaggerItem>
            </StaggerContainer>
          </motion.div>
        </ScrollReveal>
      </div>
    </motion.div>
  );
}






