import { getTransactions, getEntities } from "./businesses";
import { Timestamp } from "firebase/firestore";

export interface BusinessMetrics {
  totalRevenue: number;
  transactionCount: number;
  entityCount: number;
  lastTransactionDate: Date | null;
}

export async function getBusinessMetrics(businessId: string): Promise<BusinessMetrics> {
  const [transactions, entities] = await Promise.all([
    getTransactions(businessId, { kind: "revenue" }),
    getEntities(businessId),
  ]);

  const revenueTransactions = transactions.filter((t) => t.kind === "revenue");
  const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  let lastTransactionDate: Date | null = null;
  if (revenueTransactions.length > 0) {
    const dates = revenueTransactions.map((t) => {
      return t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
    });
    lastTransactionDate = new Date(Math.max(...dates.map((d) => d.getTime())));
  }

  return {
    totalRevenue,
    transactionCount: revenueTransactions.length,
    entityCount: entities.length,
    lastTransactionDate,
  };
}

