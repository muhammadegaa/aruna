"use client";

import { Business } from "@/lib/firestore/types";
import { getBusinessMetrics } from "@/lib/data/metrics";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/formatters";
import { Building2, TrendingUp, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type BusinessCardProps = {
  business: Business;
  onClick: () => void;
};

export default function BusinessCard({ business, onClick }: BusinessCardProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["businessMetrics", business.id],
    queryFn: () => getBusinessMetrics(business.id),
    staleTime: 30 * 1000,
  });

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-neutral-200 p-6 shadow-soft hover:shadow-medium hover:border-primary-300 transition-all text-left w-full group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <Building2 className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 mb-1">{business.name}</h3>
            <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md capitalize">
              {business.type}
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
          <div className="h-4 bg-neutral-200 rounded animate-pulse w-2/3"></div>
        </div>
      ) : metrics ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <TrendingUp className="w-4 h-4" />
              <span>Revenue</span>
            </div>
            <div className="text-lg font-bold text-neutral-900">
              {formatCurrency(metrics.totalRevenue, business.currency)}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-neutral-600">
              <Calendar className="w-4 h-4" />
              <span>{metrics.transactionCount} transactions</span>
            </div>
            {metrics.lastTransactionDate && (
              <span className="text-neutral-500">
                {new Date(metrics.lastTransactionDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-neutral-500">No data yet</div>
      )}
    </motion.button>
  );
}

