export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string; // For tool calls
  tool_call_id?: string; // For tool responses
  tool_calls?: ToolCall[]; // For assistant messages with tool calls
};

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
};

export type OpenRouterResponse = {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
  console.warn("OPENROUTER_API_KEY is not set. Agent functionality will be limited.");
}

export const callAgentModelWithTools = async (
  messages: ChatMessage[],
  tools: ToolDefinition[],
  model: string = "anthropic/claude-3.5-sonnet"
): Promise<OpenRouterResponse> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Aruna BI",
    },
    body: JSON.stringify({
      model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};



