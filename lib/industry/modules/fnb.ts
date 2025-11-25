import { IndustryModule, KpiDefinition, VisualDefinition, Period } from "../types";
import { getTransactions, getEntities } from "../../data/businesses";

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

const computeGrossMargin = async (args: {
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

  const revenueTransactions = await getTransactions(businessId, {
    kind: "revenue",
    from: startDate,
    to: endDate,
  });
  
  // For F&B, assume cost of goods sold (COGS) is tracked in expense transactions with category "cogs"
  const allExpenseTransactions = await getTransactions(businessId, {
    kind: "expense",
    from: startDate,
    to: endDate,
  });
  const cogsTransactions = allExpenseTransactions.filter((t) => t.category === "cogs");

  const revenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
  const cogs = cogsTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return {
    value: Math.round(grossMargin * 100) / 100,
    unit: "%",
  };
};

const computeTopMenuItems = async (args: {
  businessId: string;
  period: Period;
  from?: string;
  to?: string;
}): Promise<{ value: number; unit: string; trend?: "up" | "down" | "flat"; trendPercent?: number }> => {
  // This is a placeholder - actual implementation would aggregate by menuItemId
  return { value: 0, unit: "items" };
};

const kpis: KpiDefinition[] = [
  {
    id: "revenue_total",
    label: "Total Revenue",
    description: "Total revenue from food and beverage sales",
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
    id: "gross_margin",
    label: "Gross Margin",
    description: "Gross profit margin percentage",
    compute: async (args) => {
      const result = await computeGrossMargin(args);
      return {
        id: "gross_margin",
        label: "Gross Margin",
        ...result,
      };
    },
  },
  {
    id: "top_menu_items",
    label: "Top Menu Items",
    description: "Number of top performing menu items",
    compute: async (args) => {
      const result = await computeTopMenuItems(args);
      return {
        id: "top_menu_items",
        label: "Top Menu Items",
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
    id: "menu_margin_chart",
    type: "bar",
    label: "Menu Item Margins",
    description: "Profit margin by menu item",
    defaultVisible: false,
  },
];

export const fnbModule: IndustryModule = {
  id: "fnb",
  label: "Food & Beverage",
  kpis,
  visuals,
  agentContext: `You are an AI assistant for a food and beverage business. The business tracks:
- Revenue from food and beverage sales
- Cost of goods sold (COGS)
- Gross margin and profitability
- Menu item performance

Key metrics: total revenue, gross margin, top menu items.
You can analyze sales trends, identify best-selling items, and provide insights on menu optimization and pricing strategies.`,
};







