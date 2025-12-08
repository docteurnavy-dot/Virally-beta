import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { toast } from "sonner";

interface AIChatProps {
  workspaceId: Id<"workspaces">;
}

export function AIChat({ workspaceId }: AIChatProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.chat.getMessages, { workspaceId, limit: 50 });
  const sendMessage = useAction(api.ai.chat);
  const clearChat = useMutation(api.chat.clearChat);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await sendMessage({ workspaceId, message: userMessage });
    } catch (error) {
      toast.error("Error al enviar mensaje");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearChat({ workspaceId });
      toast.success("Chat limpiado");
    } catch {
      toast.error("Error al limpiar chat");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(39, 39, 45, 0.5) 0%, rgba(39, 39, 45, 0.3) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
            }}
          >
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Virally AI</h3>
            <p className="text-xs text-[#6B6B78]">Tu asistente de contenido</p>
          </div>
        </div>
        {messages && messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 text-[#6B6B78] hover:text-white hover:bg-white/5"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {(!messages || messages.length === 0) && !isLoading && (
            <div className="text-center py-12">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                }}
              >
                <Bot className="size-8 text-[#8B5CF6]" />
              </div>
              <p className="text-sm text-white mb-2">¡Hola! Soy Virally AI</p>
              <p className="text-xs text-[#6B6B78] max-w-xs mx-auto">
                Puedo ayudarte a generar ideas, escribir hooks, crear guiones y
                más. ¿En qué te puedo ayudar?
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages?.map((msg, index) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                    }}
                  >
                    <Bot className="size-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-[#8B5CF6] text-white rounded-br-md"
                      : "bg-white/5 text-white rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255, 255, 255, 0.1)" }}
                  >
                    <User className="size-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
                }}
              >
                <Bot className="size-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/5">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 text-[#8B5CF6] animate-spin" />
                  <span className="text-sm text-[#6B6B78]">Pensando...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl border-0 text-white placeholder:text-[#6B6B78]"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="h-11 w-11 rounded-xl p-0"
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
            }}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
