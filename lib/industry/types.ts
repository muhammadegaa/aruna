export type Period = "today" | "week" | "month" | "custom";

export type KpiResult = {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  trend?: "up" | "down" | "flat";
  trendPercent?: number;
};

export type VisualDefinition = {
  id: string;
  type: "card" | "line" | "bar" | "heatmap" | "table";
  label: string;
  description: string;
  defaultVisible: boolean;
};

export type KpiDefinition = {
  id: string;
  label: string;
  description: string;
  compute: (args: {
    businessId: string;
    period: Period;
    from?: string;
    to?: string;
  }) => Promise<KpiResult>;
};

export type IndustryModule = {
  id: string;
  label: string;
  kpis: KpiDefinition[];
  visuals: VisualDefinition[];
  agentContext: string;
};

