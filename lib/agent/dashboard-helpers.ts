import { WidgetConfig } from "./tools";
import { KpiResult } from "../industry/types";
import { Timestamp } from "firebase/firestore";
import { getTransactions } from "../data/businesses";

/**
 * Build widgets from KPI summary results
 */
export function buildWidgetsFromKpiSummary(kpis: KpiResult[]): WidgetConfig[] {
  const widgets: WidgetConfig[] = [];

  // Always add KPI cards if we have KPIs
  if (kpis && kpis.length > 0) {
    widgets.push({
      visualId: "kpi_cards",
      props: {
        kpis: kpis.map((kpi) => ({
          id: kpi.id,
          label: kpi.label,
          value: kpi.value,
          unit: kpi.unit,
          trend: kpi.trend,
          trendPercent: kpi.trendPercent,
        })),
      },
    });
  }

  return widgets;
}

/**
 * Build revenue timeseries widget from transactions
 */
export async function buildRevenueTimeseriesWidget(
  businessId: string,
  period: { from: string; to: string }
): Promise<WidgetConfig | null> {
  try {
    const transactions = await getTransactions(businessId, {
      kind: "revenue",
      from: new Date(period.from),
      to: new Date(period.to),
    });

    if (transactions.length === 0) {
      return null;
    }

    // Group by date
    const dailyRevenue = new Map<string, number>();
    transactions.forEach((t) => {
      const date = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
      const dateKey = date.toISOString().split("T")[0];
      dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) || 0) + t.amount);
    });

    const points = Array.from(dailyRevenue.entries())
      .map(([date, value]) => ({
        date,
        value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      visualId: "revenue_timeseries",
      props: {
        points,
        title: "Revenue Over Time",
      },
    };
  } catch (error) {
    console.error("Failed to build revenue timeseries:", error);
    return null;
  }
}

/**
 * Build widgets from occupancy summary
 */
export function buildWidgetsFromOccupancySummary(data: {
  courts: string[];
  hours: number[];
  matrix: number[][];
}): WidgetConfig[] {
  return [
    {
      visualId: "occupancy_heatmap",
      props: {
        courts: data.courts,
        hours: data.hours,
        matrix: data.matrix,
        title: "Court Occupancy Heatmap",
      },
    },
  ];
}

