"use client";

import Link from "next/link";
import { Business } from "@/lib/firestore/types";
import { BarChart3, Settings, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type SidebarProps = {
  business: Business | null;
  onBack?: () => void;
};

export default function Sidebar({ business, onBack }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white border-r border-neutral-200 flex flex-col shadow-soft"
    >
      {/* Logo */}
      <div className="p-6 border-b border-neutral-200">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Aruna
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {onBack ? (
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
              <span className="font-medium">Back to Dashboard</span>
            </motion.button>
          ) : (
            <motion.div whileHover={{ x: 4 }}>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </motion.div>
          )}
        </div>

        <div className="mt-8">
          <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Workspace
          </div>
          <div className="mt-2 space-y-1">
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-primary-600 bg-primary-50 rounded-lg font-medium border border-primary-100"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </motion.button>
          </div>
        </div>

        {business && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Business
            </div>
            <div className="mt-2 space-y-1">
              <div className="px-4 py-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="font-medium text-neutral-900">{business.name}</div>
                <div className="text-sm text-neutral-500 capitalize mt-1">{business.type}</div>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <motion.button
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}






