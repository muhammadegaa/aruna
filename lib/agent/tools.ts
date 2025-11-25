import { getIndustryModule } from "../industry/registry";
import { getBusiness, getTransactions, getFinancialConfig, getEntities } from "../data/businesses";
import { Period } from "../industry/types";
import { Timestamp } from "firebase/firestore";

export type ToolResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export const getKpiSummary = async (
  businessId: string,
  period: Period,
  from?: string,
  to?: string
): Promise<ToolResult> => {
  try {
    console.log("TOOL:get_kpi_summary", { businessId, period, from, to });
    
    if (!businessId || businessId.trim() === "") {
      return { success: false, error: "Business ID is required" };
    }

    const business = await getBusiness(businessId);
    if (!business) {
      console.error("TOOL ERROR: Business not found", { businessId });
      return { success: false, error: "Business not found" };
    }

    const industryModule = getIndustryModule(business.type);
    if (!industryModule) {
      return { success: false, error: `No module found for business type: ${business.type}` };
    }

    const kpiResults = await Promise.all(
      industryModule.kpis.map((kpi) => kpi.compute({ businessId, period, from, to }))
    );

    console.log("TOOL:get_kpi_summary result", {
      businessId,
      kpiCount: kpiResults.length,
      hasData: kpiResults.some((k) => k.value !== 0),
    });

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

    return {
      success: true,
      data: {
        period: {
          from: startDate.toISOString(),
          to: endDate.toISOString(),
        },
        kpis: kpiResults,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getPaybackProjection = async (businessId: string): Promise<ToolResult> => {
  try {
    console.log("TOOL:get_payback_projection", { businessId });
    
    if (!businessId || businessId.trim() === "") {
      return { success: false, error: "Business ID is required" };
    }

    const config = await getFinancialConfig(businessId);
    const initialCapex = config?.initialCapex;
    if (!config || !initialCapex || typeof initialCapex !== "number") {
      return {
        success: true,
        data: {
          currentProgressRatio: 0,
          estimatedMonthsToPayback: null,
          assumptions: ["No financial configuration found"],
        },
      };
    }

    const revenueTransactions = await getTransactions(businessId, { kind: "revenue" });
    const expenseTransactions = await getTransactions(businessId, { kind: "expense" });

    const totalRevenue = revenueTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalNetProfit = totalRevenue - totalExpenses;

    const currentProgressRatio = Math.min(1, Math.max(0, totalNetProfit / initialCapex));

    // Estimate months to payback based on average monthly net profit
    let estimatedMonthsToPayback: number | null = null;
    const assumptions: string[] = [];

    if (revenueTransactions.length > 0) {
      const firstTransaction = revenueTransactions.reduce((earliest, t) => {
        const tDate = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        const eDate = earliest.date instanceof Timestamp ? earliest.date.toDate() : new Date(earliest.date);
        return tDate < eDate ? t : earliest;
      }, revenueTransactions[0]);

      const firstDate = firstTransaction.date instanceof Timestamp 
        ? firstTransaction.date.toDate() 
        : new Date(firstTransaction.date);
      const monthsElapsed = (now.getTime() - firstDate.getTime()) / (30 * 24 * 60 * 60 * 1000);
      
      if (monthsElapsed > 0) {
        const avgMonthlyProfit = totalNetProfit / monthsElapsed;
        if (avgMonthlyProfit > 0) {
          const remainingCapex = initialCapex - totalNetProfit;
          estimatedMonthsToPayback = remainingCapex / avgMonthlyProfit;
          assumptions.push(`Based on average monthly profit of ${avgMonthlyProfit.toFixed(0)} IDR`);
        } else {
          assumptions.push("Average monthly profit is negative or zero");
        }
      }
    }

    return {
      success: true,
      data: {
        currentProgressRatio,
        estimatedMonthsToPayback: estimatedMonthsToPayback ? Math.ceil(estimatedMonthsToPayback) : null,
        assumptions,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const now = new Date();

export const getOccupancySummary = async (
  businessId: string,
  period: Period,
  from?: string,
  to?: string
): Promise<ToolResult> => {
  try {
    console.log("TOOL:get_occupancy_summary", { businessId, period, from, to });
    
    if (!businessId || businessId.trim() === "") {
      return { success: false, error: "Business ID is required" };
    }

    const business = await getBusiness(businessId);
    if (!business || business.type !== "padel") {
      return { success: false, error: "Occupancy summary only available for padel businesses" };
    }

    const courts = await getEntities(businessId);
    const padelCourts = courts.filter((e) => e.type === "court");
    
    if (padelCourts.length === 0) {
      return {
        success: true,
        data: {
          courts: [],
          hours: [],
          matrix: [],
        },
      };
    }

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

    // Generate hour range (e.g., 8 AM to 10 PM = 8-22)
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 to 22
    const courtIds = padelCourts.map((c) => c.id);
    
    // Initialize matrix: [courtIndex][hourIndex] = count of bookings
    const matrix: number[][] = courtIds.map(() => hours.map(() => 0));

    // Calculate occupancy: for each court and hour, count bookings
    transactions.forEach((transaction) => {
      const courtId = (transaction.metadata as any)?.courtId as string | undefined;
      const courtName = (transaction.metadata as any)?.court as string | undefined;
      const hour = (transaction.metadata as any)?.hour as number | undefined;
      const bookingHours = ((transaction.metadata as any)?.hours as number) || 1;
      
      // Find court by ID or name
      let courtIndex = -1;
      if (courtId) {
        courtIndex = courtIds.indexOf(courtId);
      } else if (courtName) {
        const court = padelCourts.find((c) => c.name === courtName || c.id === courtName);
        if (court) {
          courtIndex = courtIds.indexOf(court.id);
        }
      }
      
      if (courtIndex >= 0 && hour !== undefined && hour >= 8 && hour <= 22) {
        const hourIndex = hours.indexOf(hour);
        if (hourIndex >= 0) {
          // Add booking hours to the matrix
          for (let h = 0; h < bookingHours && hour + h <= 22; h++) {
            const currentHourIndex = hours.indexOf(hour + h);
            if (currentHourIndex >= 0) {
              matrix[courtIndex][currentHourIndex] += 1;
            }
          }
        }
      }
    });

    // Calculate occupancy percentage: bookings per hour slot / total possible slots for that hour
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    // For each hour slot, total possible = number of days (each court can be booked once per day per hour)
    // So occupancy = (count of bookings for this court+hour) / (days in period) * 100
    const occupancyMatrix = matrix.map((courtRow) =>
      courtRow.map((count) => {
        // Occupancy = (number of bookings for this court+hour) / (days in period) * 100
        const occupancyPercent = days > 0 ? (count / days) * 100 : 0;
        return Math.min(100, Math.max(0, Math.round(occupancyPercent * 10) / 10)); // Round to 1 decimal
      })
    );

    return {
      success: true,
      data: {
        courts: padelCourts.map((c) => c.name || c.id),
        hours,
        matrix: occupancyMatrix,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export type WidgetConfig = {
  visualId: string;
  props: Record<string, unknown>;
};

export type DashboardUpdatePayload = {
  widgets: WidgetConfig[];
};

export const updateDashboardView = (widgets: WidgetConfig[]): ToolResult => {
  // This is a virtual tool - it doesn't mutate DB, just returns widget config
  return {
    success: true,
    data: {
      widgets,
    } as DashboardUpdatePayload,
  };
};







