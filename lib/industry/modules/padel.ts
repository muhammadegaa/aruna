import { IndustryModule, KpiDefinition, VisualDefinition, Period } from "../types";
import { getTransactions, getEntities } from "../../firestore/business";

const computeRevenueTotal = async (args: {
  businessId: string;
  period: Period;
  from?: string;
  to?: string;
}): Promise<{ value: number; unit: string; trend?: "up" | "down" | "flat"; trendPercent?: number }> => {
  const { businessId, period, from, to } = args;
  
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  
  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    endDate = to ? new Date(to) : now;
  }

  const transactions = await getTransactions(businessId, {
    kind: "revenue",
    from: startDate,
    to: endDate,
  });

  const revenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate previous period for trend
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const prevStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const prevTransactions = await getTransactions(businessId, {
    kind: "revenue",
    from: prevStartDate,
    to: startDate,
  });
  const prevRevenue = prevTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const trendPercent = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
  const trend: "up" | "down" | "flat" = Math.abs(trendPercent) < 1 ? "flat" : trendPercent > 0 ? "up" : "down";

  return {
    value: Math.round(revenue * 100) / 100,
    unit: "IDR",
    trend,
    trendPercent: Math.round(trendPercent * 100) / 100,
  };
};

const computeOccupancyRate = async (args: {
  businessId: string;
  period: Period;
  from?: string;
  to?: string;
}): Promise<{ value: number; unit: string; trend?: "up" | "down" | "flat"; trendPercent?: number }> => {
  const { businessId, period, from, to } = args;
  
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  
  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    endDate = to ? new Date(to) : now;
  }

  const entities = await getEntities(businessId);
  const courts = entities.filter((e) => e.type === "court");
  const numCourts = courts.length;
  
  if (numCourts === 0) {
    return { value: 0, unit: "%" };
  }

  const transactions = await getTransactions(businessId, {
    kind: "revenue",
    from: startDate,
    to: endDate,
  });

  // Calculate total possible hours (courts * hours per day * days)
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const hoursPerDay = 12; // Assume 12 operating hours per day
  const totalPossibleHours = numCourts * hoursPerDay * days;
  
  // Count booked hours from transactions
  const bookedHours = transactions.reduce((sum, t) => {
    const hours = (t.metadata as any)?.hours || 1;
    return sum + hours;
  }, 0);
  
  const occupancyRate = totalPossibleHours > 0 ? (bookedHours / totalPossibleHours) * 100 : 0;

  return {
    value: Math.round(occupancyRate * 100) / 100,
    unit: "%",
  };
};

const computeAverageBookingValue = async (args: {
  businessId: string;
  period: Period;
  from?: string;
  to?: string;
}): Promise<{ value: number; unit: string; trend?: "up" | "down" | "flat"; trendPercent?: number }> => {
  const { businessId, period, from, to } = args;
  
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  
  if (period === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    endDate = to ? new Date(to) : now;
  }

  const transactions = await getTransactions(businessId, {
    kind: "revenue",
    from: startDate,
    to: endDate,
  });

  if (transactions.length === 0) {
    return { value: 0, unit: "IDR" };
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgBookingValue = totalRevenue / transactions.length;

  return {
    value: Math.round(avgBookingValue * 100) / 100,
    unit: "IDR",
  };
};

const kpis: KpiDefinition[] = [
  {
    id: "revenue_total",
    label: "Total Revenue",
    description: "Total revenue from court bookings",
    compute: async (args) => {
      const result = await computeRevenueTotal(args);
      return {
        id: "revenue_total",
        label: "Total Revenue",
        ...result,
      };
    },
  },
  {
    id: "occupancy_rate",
    label: "Occupancy Rate",
    description: "Percentage of court hours booked",
    compute: async (args) => {
      const result = await computeOccupancyRate(args);
      return {
        id: "occupancy_rate",
        label: "Occupancy Rate",
        ...result,
      };
    },
  },
  {
    id: "avg_booking_value",
    label: "Average Booking Value",
    description: "Average revenue per booking",
    compute: async (args) => {
      const result = await computeAverageBookingValue(args);
      return {
        id: "avg_booking_value",
        label: "Average Booking Value",
        ...result,
      };
    },
  },
];

const visuals: VisualDefinition[] = [
  {
    id: "kpi_cards",
    type: "card",
    label: "KPI Cards",
    description: "Key performance indicators",
    defaultVisible: true,
  },
  {
    id: "revenue_timeseries",
    type: "line",
    label: "Revenue Over Time",
    description: "Revenue trends",
    defaultVisible: true,
  },
  {
    id: "occupancy_heatmap",
    type: "heatmap",
    label: "Occupancy Heatmap",
    description: "Court occupancy by hour",
    defaultVisible: true,
  },
];

export const padelModule: IndustryModule = {
  id: "padel",
  label: "Padel Courts",
  kpis,
  visuals,
  agentContext: `You are an AI assistant for a padel court business. The business tracks:
- Revenue from court bookings
- Court occupancy rates
- Booking patterns by time and court

Key metrics: total revenue, occupancy rate, average booking value.
You can analyze booking trends, identify peak hours, optimize court utilization, and provide insights on pricing strategies.`,
};

