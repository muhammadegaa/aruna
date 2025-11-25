import { NextRequest, NextResponse } from "next/server";
import { callAgentModelWithTools, ChatMessage, ToolDefinition } from "@/lib/openrouter";
import { getBusiness, addAgentLog } from "@/lib/data/businesses";
import { getIndustryModule } from "@/lib/industry/registry";
import {
  getKpiSummary,
  getPaybackProjection,
  getOccupancySummary,
  updateDashboardView,
  DashboardUpdatePayload,
} from "@/lib/agent/tools";
import { Period } from "@/lib/industry/types";

export const runtime = "nodejs";

const TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_kpi_summary",
      description: "Get a summary of KPIs for a business over a specified period",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
          period: {
            type: "string",
            enum: ["today", "week", "month", "custom"],
            description: "Time period for the KPI summary",
          },
          from: { type: "string", description: "Start date (ISO string) for custom period" },
          to: { type: "string", description: "End date (ISO string) for custom period" },
        },
        required: ["businessId", "period"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_payback_projection",
      description: "Get payback projection based on initial investment and historical profits",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
        },
        required: ["businessId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_occupancy_summary",
      description: "Get occupancy summary for padel courts (court x hour matrix). Only available for padel businesses.",
      parameters: {
        type: "object",
        properties: {
          businessId: { type: "string", description: "The business ID" },
          period: {
            type: "string",
            enum: ["today", "week", "month", "custom"],
            description: "Time period for the occupancy summary",
          },
          from: { type: "string", description: "Start date (ISO string) for custom period" },
          to: { type: "string", description: "End date (ISO string) for custom period" },
        },
        required: ["businessId", "period"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_dashboard_view",
      description:
        "Update the dashboard visualization by specifying which widgets to show. Use this when the user asks to see specific metrics or visualizations.",
      parameters: {
        type: "object",
        properties: {
          widgets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                visualId: {
                  type: "string",
                  description:
                    "The visual ID (e.g., 'kpi_cards', 'occupancy_heatmap', 'revenue_timeseries', 'menu_margin_chart')",
                },
                props: {
                  type: "object",
                  description: "Props to pass to the visualization component",
                },
              },
              required: ["visualId"],
            },
          },
        },
        required: ["widgets"],
      },
    },
  },
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let businessId: string | undefined;
  let userMessage: string | undefined;
  
  try {
    const body = await request.json();
    const { businessId: bid, business: businessData, message, history = [], userId } = body;
    businessId = bid;
    userMessage = message;

    // Log request for debugging
    console.log("AGENT REQUEST", {
      businessId,
      hasMessage: !!message,
      messageLength: message?.length || 0,
      hasBusinessData: !!businessData,
      userId: userId?.substring(0, 8) + "...",
    });

    // Validate required fields
    if (!businessId || typeof businessId !== "string" || businessId.trim() === "") {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: "businessId is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: "message is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Use business data from client (avoids server-side Firestore auth issue)
    // If not provided, try to fetch (will fail without auth, but fallback)
    let business = businessData;
    if (!business) {
      console.warn("No business data provided, attempting server-side fetch (may fail)");
      business = await getBusiness(businessId);
      if (!business) {
        return NextResponse.json(
          {
            error: "BUSINESS_NOT_FOUND",
            message: "Business not found. Please refresh and try again.",
          },
          { status: 404 }
        );
      }
    }

    // Verify user owns the business (if userId provided)
    if (userId && business.ownerUid !== userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You don't own this business",
        },
        { status: 403 }
      );
    }

    console.log("Business verified:", { businessId, type: business.type, name: business.name });

    const industryModule = getIndustryModule(business.type);
    if (!industryModule) {
      return NextResponse.json({ error: `No module found for business type: ${business.type}` }, { status: 400 });
    }

    // Build system prompt
    const systemPrompt = `You are Aruna, an AI business intelligence assistant for ${business.name} (${industryModule.label} business).

${industryModule.agentContext}

IMPORTANT RULES:
1. NEVER invent or hallucinate numbers. ALWAYS use the provided tools to get real metrics from the database.
2. When the user asks about metrics, KPIs, or performance, you MUST call get_kpi_summary or other relevant tools first.
3. After getting data from tools, you should call update_dashboard_view to show relevant visualizations. For example:
   - If you get KPI data, create widgets with visualId "kpi_cards" and pass the kpis in props
   - If you get occupancy data, create a widget with visualId "occupancy_heatmap" and pass courts, hours, and matrix in props
   - If you get revenue data, create a widget with visualId "revenue_timeseries" and pass points array in props
4. The update_dashboard_view tool expects widgets array with { visualId: string, props: object } format.
5. Respond naturally in the user's language (Indonesian or English).
6. Be concise but helpful.`;

    // Build messages
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    let dashboardUpdate: DashboardUpdatePayload | undefined;
    let finalMessages: ChatMessage[] = [...messages];
    let maxIterations = 5;
    let iteration = 0;
    const toolsUsed: string[] = [];

    // Tool calling loop
    while (iteration < maxIterations) {
      iteration++;
      try {
        const response = await callAgentModelWithTools(finalMessages, TOOLS);

        if (response.choices.length === 0) {
          console.warn("No choices in OpenRouter response");
          break;
        }

      const choice = response.choices[0];
      const assistantMessage = choice.message;
      finalMessages.push(assistantMessage);

      // Check if model wants to call tools
      // OpenRouter may return finish_reason as "tool_calls" or include tool_calls in message
      const hasToolCalls = assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0;
      const isToolCallFinish = choice.finish_reason === "tool_calls" || choice.finish_reason === "function_call";
      
      if ((isToolCallFinish || hasToolCalls) && assistantMessage.tool_calls) {
        // Process tool calls
        const toolCalls = assistantMessage.tool_calls;

        for (const toolCall of toolCalls) {
          const { name, arguments: argsStr } = toolCall.function;
          let args: Record<string, unknown>;
          try {
            args = JSON.parse(argsStr);
          } catch (parseError) {
            console.error("Failed to parse tool arguments:", parseError);
            args = {};
          }

          // Ensure businessId is always from the request, not from args
          const toolBusinessIdFromArgs = args.businessId as string | undefined;
          if (toolBusinessIdFromArgs && toolBusinessIdFromArgs !== businessId) {
            console.warn(`Tool ${name} called with different businessId, using request businessId`);
          }

          let toolResult: { success: boolean; data?: unknown; error?: string };

          try {
            if (!toolsUsed.includes(name)) {
              toolsUsed.push(name);
            }
            
            switch (name) {
              case "get_kpi_summary":
                toolResult = await getKpiSummary(
                  businessId, // Always use request businessId
                  (args.period as Period) || "month",
                  args.from as string | undefined,
                  args.to as string | undefined
                );
                break;
              case "get_payback_projection":
                toolResult = await getPaybackProjection(businessId); // Always use request businessId
                break;
              case "get_occupancy_summary":
                toolResult = await getOccupancySummary(
                  businessId, // Always use request businessId
                  (args.period as Period) || "month",
                  args.from as string | undefined,
                  args.to as string | undefined
                );
                break;
              case "update_dashboard_view":
                const widgets = (args.widgets as Array<{ visualId: string; props?: Record<string, unknown> }>).map(
                  (w) => ({
                    visualId: w.visualId,
                    props: w.props || {},
                  })
                );
                toolResult = updateDashboardView(widgets);
                if (toolResult.success && toolResult.data) {
                  dashboardUpdate = toolResult.data as DashboardUpdatePayload;
                }
                break;
              default:
                toolResult = { success: false, error: `Unknown tool: ${name}` };
            }
          } catch (toolError) {
            console.error(`TOOL EXECUTION ERROR: ${name}`, toolError);
            toolResult = {
              success: false,
              error: toolError instanceof Error ? toolError.message : `Failed to execute tool: ${name}`,
            };
          }

          if (!toolResult.success) {
            console.warn(`Tool ${name} failed:`, toolResult.error);
          }

          // Add tool result to messages
          finalMessages.push({
            role: "tool",
            content: toolResult.success
              ? JSON.stringify(toolResult.data)
              : JSON.stringify({ error: toolResult.error }),
            tool_call_id: toolCall.id,
          });
        }

        // Continue loop to get final response
        continue;
      } else {
        // Final response received
        break;
      }
      } catch (toolError) {
        console.error("Error in tool calling loop:", toolError);
        // If we have at least one assistant message, use it
        const existingMessages = finalMessages.filter((m) => m.role === "assistant");
        if (existingMessages.length > 0) {
          break;
        }
        throw toolError;
      }
    }

    // Extract the last assistant message (final response)
    const assistantMessages = finalMessages.filter((m) => m.role === "assistant");
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
    const responseMessage = lastAssistantMessage?.content || "I apologize, but I couldn't generate a response.";
    const durationMs = Date.now() - startTime;

    // Log agent interaction (async, don't await)
    if (businessId && userMessage) {
      addAgentLog(businessId, {
        userMessage: userMessage,
        agentReplySummary: responseMessage.substring(0, 200), // First 200 chars
        toolsUsed,
        success: true,
        durationMs,
      }).catch((err) => console.error("Failed to log agent interaction:", err));
    }

    return NextResponse.json({
      message: responseMessage,
      dashboardUpdate,
    });
  } catch (error) {
    const durationMs = Date.now() - (startTime || Date.now());
    console.error("AGENT ERROR", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Determine error type
    let errorCode = "INTERNAL_ERROR";
    let errorMessage = "Failed to process request. Please try again.";

    if (error instanceof Error) {
      if (error.message.includes("OpenRouter") || error.message.includes("LLM")) {
        errorCode = "LLM_CALL_FAILED";
        errorMessage = "Failed to communicate with AI service. Please try again.";
      } else if (error.message.includes("Business") || error.message.includes("Firestore")) {
        errorCode = "DATA_ACCESS_ERROR";
        errorMessage = "Failed to access business data. Please refresh and try again.";
      } else {
        errorMessage = error.message;
      }
    }

    // Log failed interaction (async, don't await)
    if (businessId && userMessage) {
      addAgentLog(businessId, {
        userMessage: userMessage,
        agentReplySummary: errorMessage,
        toolsUsed: [],
        success: false,
        errorCode,
        errorMessage,
        durationMs,
      }).catch((err) => console.error("Failed to log agent error:", err));
    }

    return NextResponse.json(
      {
        error: errorCode,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}







