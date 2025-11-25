"use client";

import { KpiResult } from "@/lib/industry/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/formatters";

type KpiCardsProps = {
  kpis: KpiResult[];
};

export default function KpiCards({ kpis }: KpiCardsProps) {
  if (!kpis || kpis.length === 0) {
    return (
      <div className="p-4 text-neutral-500 text-center bg-white rounded-xl border border-neutral-200">
        No KPI data available
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
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <StaggerItem key={kpi.id}>
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6 hover:shadow-medium hover:border-primary-200 transition-all"
          >
            <div className="text-sm font-medium text-neutral-600 mb-2">{kpi.label}</div>
            <div className="flex items-baseline gap-2 mb-3">
              <div className="text-3xl font-bold text-neutral-900">
                {typeof kpi.value === "number"
                  ? kpi.unit === "IDR" || kpi.unit === "USD" || kpi.unit.includes("currency")
                    ? formatCurrency(kpi.value, kpi.unit === "IDR" ? "IDR" : "USD")
                    : kpi.unit === "%"
                    ? formatPercentage(kpi.value)
                    : formatNumber(kpi.value)
                  : kpi.value}
              </div>
              {kpi.unit && kpi.unit !== "IDR" && kpi.unit !== "USD" && kpi.unit !== "%" && (
                <div className="text-sm text-neutral-500 font-medium">{kpi.unit}</div>
              )}
            </div>
            {kpi.trend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getTrendColor(kpi.trend)}`}
              >
                {getTrendIcon(kpi.trend)}
                {kpi.trendPercent !== undefined
                  ? formatPercentage(kpi.trendPercent > 0 ? kpi.trendPercent : -kpi.trendPercent)
                  : ""}
              </motion.div>
            )}
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}






