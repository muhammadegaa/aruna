"use client";

import Link from "next/link";
import { Business } from "@/lib/firestore/types";
import { BarChart3, Settings, ArrowLeft, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

type SidebarProps = {
  business: Business | null;
  onBack?: () => void;
};

export default function Sidebar({ business, onBack }: SidebarProps) {
  return (
    <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-neutral-200">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Aruna
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
        )}

        {/* Main Navigation */}
        <div className="space-y-1 mb-6">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Analytics
          </div>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-semibold text-primary-900">Overview</span>
            </div>
          </div>
        </div>

        {/* Business Info */}
        {business && (
          <div className="mb-6">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Business
            </div>
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard className="w-5 h-5 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-neutral-900 text-sm truncate mb-1">
                    {business.name}
                  </div>
                  <div className="text-xs text-neutral-500 capitalize">{business.type}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-neutral-600 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-colors group">
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
