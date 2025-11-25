import { Timestamp } from "firebase/firestore";

export type Business = {
  id: string;
  name: string;
  type: "padel" | "fnb";
  currency: string;
  ownerUid: string;
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

