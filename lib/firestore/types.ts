import { Timestamp } from "firebase/firestore";

export type Organization = {
  id: string;
  name: string;
  ownerUid: string;
  plan: "free" | "pro";
  createdAt: Timestamp;
  stripeCustomerId?: string;
};

export type OrganizationMember = {
  id: string;
  role: "owner" | "admin" | "analyst";
  joinedAt: Timestamp;
};

export type Business = {
  id: string;
  name: string;
  type: "padel" | "fnb";
  currency: string;
  ownerUid: string;
  orgId: string; // Organization this business belongs to
  createdAt: Timestamp;
};

export type Entity = {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
};

export type Transaction = {
  id: string;
  kind: "revenue" | "expense";
  amount: number;
  date: Timestamp | Date;
  description: string;
  category?: string;
  metadata?: Record<string, unknown>;
};

export type FinancialConfig = {
  hourlyRate?: number;
  currency: string;
  defaultTaxRate?: number;
  initialCapex?: number;
  targetPaybackMonths?: number;
  [key: string]: unknown;
};

export type MetricDaily = {
  id: string;
  metricKey: string;
  date: Timestamp | Date;
  value: number;
  metadata?: Record<string, unknown>;
};

export type AgentLog = {
  id: string;
  timestamp: Timestamp;
  userMessage: string;
  agentReplySummary: string;
  toolsUsed: string[];
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  durationMs: number;
};
