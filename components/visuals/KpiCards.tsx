"use client";

import { KpiResult } from "@/lib/industry/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";

type KpiCardsProps = {
  kpis: KpiResult[];
};

export default function KpiCards({ kpis }: KpiCardsProps) {
  if (!kpis || !Array.isArray(kpis) || kpis.length === 0) {
    return (
      <div className="p-4 text-neutral-500 text-center bg-white rounded-xl border border-neutral-200">
        No KPI data available
      </div>
    );
  }

  // Filter out invalid KPIs
  const validKpis = kpis.filter((kpi) => kpi && (kpi.value !== undefined || kpi.value !== null));
  
  if (validKpis.length === 0) {
    return (
      <div className="p-4 text-neutral-500 text-center bg-white rounded-xl border border-neutral-200">
        No valid KPI data available
      </div>
    );
  }

  const getTrendIcon = (trend?: "up" | "down" | "flat") => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend?: "up" | "down" | "flat") => {
    if (trend === "up") return "text-success-600 bg-success-50";
    if (trend === "down") return "text-error-600 bg-error-50";
    return "text-neutral-600 bg-neutral-50";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {validKpis.map((kpi, index) => {
        const formattedValue = typeof kpi.value === "number"
          ? (() => {
              const unit = kpi.unit || "";
              if (unit === "IDR" || unit === "USD" || (typeof unit === "string" && unit.includes("currency"))) {
                return formatCurrency(kpi.value, unit === "IDR" ? "IDR" : "USD");
              } else if (unit === "%") {
                return formatPercentage(kpi.value);
              } else {
                return formatNumber(kpi.value);
              }
            })()
          : String(kpi.value || "—");

        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col min-h-[140px]"
          >
            {/* Label */}
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3 truncate">
              {kpi.label}
            </div>
            
            {/* Value */}
            <div className="flex-1 flex items-end mb-3">
              <div className="w-full">
                <div className="text-2xl font-bold text-neutral-900 leading-tight break-words overflow-hidden">
                  {formattedValue}
                </div>
                {kpi.unit && kpi.unit !== "IDR" && kpi.unit !== "USD" && kpi.unit !== "%" && (
                  <div className="text-xs text-neutral-500 mt-1">{kpi.unit}</div>
                )}
              </div>
            </div>

            {/* Trend */}
            {kpi.trend && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium w-fit ${getTrendColor(kpi.trend)}`}>
                {getTrendIcon(kpi.trend)}
                <span>
                  {kpi.trendPercent !== undefined
                    ? `${kpi.trendPercent > 0 ? "+" : ""}${formatPercentage(Math.abs(kpi.trendPercent))}`
                    : ""}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}






