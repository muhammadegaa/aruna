"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
  retryable?: boolean;
};

type ChatPanelProps = {
  businessId: string;
  businessType?: string;
  userId?: string;
  onDashboardUpdate?: (widgets: any[]) => void;
};

const STORAGE_KEY = (businessId: string) => `aruna_chat_${businessId}`;

export default function ChatPanel({ businessId, businessType, userId, onDashboardUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryingMessage, setRetryingMessage] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(businessId));
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }, [businessId]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY(businessId), JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    }
  }, [messages, businessId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getSuggestions = () => {
    const base = [
      "Show me this month's performance",
      "What's my revenue trend?",
    ];
    
    if (businessType === "padel") {
      return [
        ...base,
        "Show me occupancy by hour",
        "Which court is most popular?",
        "What's my payback progress?",
      ];
    } else if (businessType === "fnb") {
      return [
        ...base,
        "Show me top menu items",
        "What's my gross margin?",
        "Which items have the best margins?",
      ];
    }
    return base;
  };

  const handleSend = async (messageToSend?: string) => {
    const message = messageToSend || input.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!messageToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
          message,
          userId,
          history: newMessages.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.messages && Array.isArray(data.messages)) {
        const assistantMessages = data.messages
          .filter((m: any) => m.role === "assistant" && m.content)
          .map((m: any) => ({
            role: "assistant" as const,
            content: m.content,
            error: false,
          }));
        
        setMessages([...newMessages, ...assistantMessages]);
      } else {
        throw new Error("Invalid response format");
      }

      if (data.dashboardUpdate && data.dashboardUpdate.widgets && onDashboardUpdate) {
        onDashboardUpdate(data.dashboardUpdate.widgets);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}. Please try again.`
          : "Sorry, I encountered an error. Please try again.",
        error: true,
        retryable: true,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setRetryingMessage(null);
    }
  };

  const handleRetry = (messageIndex: number) => {
    // Find the user message before this error
    const errorMessage = messages[messageIndex];
    if (!errorMessage || !errorMessage.retryable) return;

    // Find the last user message before this error
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== "user") {
      userMessageIndex--;
    }

    if (userMessageIndex >= 0) {
      const userMessage = messages[userMessageIndex];
      // Remove error message and retry
      const messagesBeforeError = messages.slice(0, messageIndex);
      setMessages(messagesBeforeError);
      setRetryingMessage(messageIndex);
      handleSend(userMessage.content);
    }
  };

  const handleClearChat = () => {
    if (confirm("Clear all chat messages?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY(businessId));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-neutral-200 px-6 py-4 bg-gradient-subtle"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft"
            >
              <Bot className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="font-semibold text-neutral-900">Aruna AI</h2>
              <p className="text-xs text-neutral-500">Your business intelligence assistant</p>
            </div>
          </div>
          {messages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearChat}
              className="text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
            >
              Clear
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mt-8"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Bot className="w-8 h-8 text-primary-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Welcome to Aruna</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Ask me about your business metrics, KPIs, or visualizations.
              </p>
              <StaggerContainer className="space-y-2 text-left max-w-sm mx-auto">
                <div className="text-xs text-neutral-500 font-medium mb-2">Try asking:</div>
                {getSuggestions().slice(0, 3).map((suggestion, index) => (
                  <StaggerItem key={index}>
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(suggestion)}
                      className="block w-full text-left px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm"
                    >
                      &quot;{suggestion}&quot;
                    </motion.button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-soft"
                >
                  <Bot className="w-4 h-4 text-white" />
                </motion.div>
              )}
              <div className="flex flex-col gap-2 max-w-[80%]">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-primary text-white shadow-medium"
                      : message.error
                      ? "bg-error-50 text-error-700 border border-error-200"
                      : "bg-white text-neutral-900 border border-neutral-200 shadow-soft"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                </motion.div>
                {message.error && message.retryable && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRetry(index)}
                    disabled={isLoading || retryingMessage === index}
                    className="self-start flex items-center gap-2 px-3 py-1.5 text-xs text-error-600 bg-error-50 hover:bg-error-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {retryingMessage === index ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </>
                    )}
                  </motion.button>
                )}
              </div>
              {message.role === "user" && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <UserIcon className="w-4 h-4 text-neutral-600" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-soft"
            >
              <Bot className="w-4 h-4 text-white" />
            </motion.div>
            <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-soft">
              <div className="flex space-x-1">
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-neutral-200 p-4 bg-white"
      >
        <div className="flex gap-2">
          <motion.input
            ref={inputRef}
            whileFocus={{ scale: 1.01 }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Aruna about your business..."
            className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-medium shadow-primary-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}




