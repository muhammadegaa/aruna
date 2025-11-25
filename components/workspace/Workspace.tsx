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
import { X } from "lucide-react";

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
        if (businessData === null && onBack) {
          onBack();
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
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar business={business} onBack={onBack} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-neutral-900 truncate">
                {business?.name || "Workspace"}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-neutral-500 capitalize">{business?.type}</span>
                <span className="text-neutral-300">•</span>
                <span className="text-sm text-neutral-500">
                  {business?.currency || "IDR"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dashboardWidgets.length > 0 && (
                <button
                  onClick={handleClearDashboard}
                  className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Visual Panel */}
          <div className="flex-1 overflow-hidden min-w-0">
            <VisualPanel widgets={dashboardWidgets} />
          </div>

          {/* Chat Panel */}
          <div className="w-full lg:w-[420px] xl:w-[480px] border-l border-neutral-200 bg-white flex-shrink-0 flex flex-col">
            <ChatPanel
              businessId={businessId}
              userId={user?.uid}
              onDashboardUpdate={handleDashboardUpdate}
              businessType={business?.type}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
