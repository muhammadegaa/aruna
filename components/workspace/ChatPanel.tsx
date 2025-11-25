"use client";

import { useState, useRef, useEffect } from "react";
import { WidgetConfig } from "@/lib/agent/tools";
import { Send, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ChatPanelProps = {
  businessId: string;
  userId?: string;
  onDashboardUpdate: (widgets: WidgetConfig[]) => void;
  businessType?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPanel({
  businessId,
  userId,
  onDashboardUpdate,
  businessType,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm Aruna, your AI business intelligence assistant. I can help you analyze your ${businessType || "business"} metrics, visualize data, and answer questions about your performance. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Fetch business data from client-side (where we have auth)
      const { getBusiness } = await import("@/lib/data/businesses");
      const business = await getBusiness(businessId);
      
      if (!business) {
        throw new Error("Business not found");
      }

      // Verify ownership
      if (userId && business.ownerUid !== userId) {
        throw new Error("Unauthorized: You don't own this business");
      }

      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          business, // Pass business data to avoid server-side Firestore call
          message: userMessage,
          history,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "UNKNOWN_ERROR", message: "Failed to get response" }));
        const errorMessage = errorData.message || errorData.error || "Failed to get response";
        
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `❌ Error: ${errorMessage}`,
          },
        ]);
        return;
      }

      const data = await response.json();

      // Check for error in response
      if (data.error) {
        const errorMessage = data.message || data.error || "An error occurred";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `❌ Error: ${errorMessage}`,
          },
        ]);
        return;
      }

      // Only show fallback if message is truly missing
      const responseMessage = data.message;
      if (!responseMessage || responseMessage.trim() === "") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I apologize, but I couldn't generate a response. Please try again.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responseMessage },
      ]);

      if (data.dashboardUpdate?.widgets) {
        onDashboardUpdate(data.dashboardUpdate.widgets);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response. Please try again.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-neutral-200 px-6 py-4 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900">Aruna AI</h2>
            <p className="text-xs text-neutral-500">Your business intelligence assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 break-words ${
                  message.role === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-neutral-600" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-600" />
            </div>
            <div className="bg-neutral-100 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 px-6 py-4 bg-neutral-50 flex-shrink-0">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your business metrics..."
            className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

