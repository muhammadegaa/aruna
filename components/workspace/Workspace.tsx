"use client";

import { useState, useEffect } from "react";
import VisualPanel from "./VisualPanel";
import ChatPanel from "./ChatPanel";
import Sidebar from "./Sidebar";
import { WidgetConfig } from "@/lib/agent/tools";
import { getBusiness } from "@/lib/data/businesses";
import { Business } from "@/lib/firestore/types";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

type WorkspaceProps = {
  businessId: string;
  onBack?: () => void;
  onBusinessChange?: () => void;
};

export default function Workspace({ businessId, onBack, onBusinessChange }: WorkspaceProps) {
  const { user } = useAuth();
  const [dashboardWidgets, setDashboardWidgets] = useState<WidgetConfig[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBusiness = async () => {
      setIsLoading(true);
      try {
        const businessData = await getBusiness(businessId);
        setBusiness(businessData);
        if (businessData === null) {
          // Business not found, go back to dashboard
          if (onBack) onBack();
        }
      } catch (error) {
        console.error("Failed to load business:", error);
        if (onBack) onBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadBusiness();
  }, [businessId, onBack]);

  const handleDashboardUpdate = (widgets: WidgetConfig[]) => {
    setDashboardWidgets(widgets);
  };

  const handleClearDashboard = () => {
    setDashboardWidgets([]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
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
          <p className="text-neutral-600">Loading workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen flex flex-col lg:flex-row bg-neutral-50"
    >
      {/* Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar business={business} onBack={onBack} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-4 shadow-soft"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 truncate">
                {business?.name || "Workspace"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 capitalize mt-1">
                {business?.type} Business
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div className="text-xs sm:text-sm text-neutral-600 whitespace-nowrap">
                <span className="font-medium">Currency:</span> {business?.currency || "IDR"}
              </div>
              {dashboardWidgets.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearDashboard}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  Clear
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Workspace Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Visual Panel - Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 overflow-hidden min-w-0"
          >
            <VisualPanel widgets={dashboardWidgets} />
          </motion.div>

          {/* Chat Panel - Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-white shadow-soft flex-shrink-0"
          >
            <ChatPanel
              businessId={businessId}
              userId={user?.uid}
              onDashboardUpdate={handleDashboardUpdate}
              businessType={business?.type}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}









