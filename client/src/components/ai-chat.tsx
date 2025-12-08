import { useState, useRef, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Sparkles, Trash2, Paperclip, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { toast } from "sonner";

type ChatContext = "general" | "calendar" | "ideas" | "scripts";

interface FileAttachment {
  name: string;
  mime_type: string;
  base64_encoded_data: string;
}

interface AIChatProps {
  workspaceId: Id<"workspaces">;
  context?: ChatContext;
  onContentCreated?: () => void;
}

const contextPlaceholders: Record<ChatContext, string> = {
  general: "Escribe tu mensaje...",
  calendar: "Ej: 'Crea 10 videos para julio' o sube un PDF con tu plan...",
  ideas: "Ej: 'Dame 5 ideas virales sobre fitness'...",
  scripts: "Ej: 'Crea un guión sobre productividad'...",
};

const contextTips: Record<ChatContext, string> = {
  general: "Puedo ayudarte con ideas, guiones y más",
  calendar: "Puedo crear eventos desde texto o archivos PDF",
  ideas: "Puedo generar ideas virales para tu nicho",
  scripts: "Puedo escribir guiones con hooks potentes",
};

export function AIChat({ workspaceId, context = "general", onContentCreated }: AIChatProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = useQuery(api.chat.getMessages, { workspaceId, limit: 50 });
  const sendMessage = useAction(api.ai.chat);
  const clearChat = useMutation(api.chat.clearChat);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    
    for (const file of Array.from(files)) {
      if (attachments.length + newAttachments.length >= 5) {
        toast.error("Máximo 5 archivos");
        break;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande (máx 10MB)`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newAttachments.push({
          name: file.name,
          mime_type: file.type || "application/octet-stream",
          base64_encoded_data: base64,
        });
      } catch {
        toast.error(`Error al leer ${file.name}`);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) return;

    const userMessage = message.trim() || "Analiza estos archivos y crea el contenido correspondiente";
    setMessage("");
    const currentAttachments = [...attachments];
    setAttachments([]);
    setIsLoading(true);

    try {
      const response = await sendMessage({ 
        workspaceId, 
        message: userMessage,
        context,
        attachments: currentAttachments.length > 0 ? currentAttachments.map(a => ({
          mime_type: a.mime_type,
          base64_encoded_data: a.base64_encoded_data,
        })) : undefined,
      });
      
      // Check if content was created
      if (response.includes("✅")) {
        onContentCreated?.();
      }
    } catch {
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
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30"
              >
                <FileText className="size-3 text-[#8B5CF6]" />
                <span className="text-xs text-white truncate max-w-[100px]">{att.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-[#6B6B78] hover:text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Context tip */}
        {context !== "general" && (
          <p className="text-xs text-[#6B6B78] mb-2 flex items-center gap-1">
            <Sparkles className="size-3 text-[#8B5CF6]" />
            {contextTips[context]}
          </p>
        )}

        <div className="flex gap-2">
          {/* File input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || attachments.length >= 5}
            className="h-11 w-11 rounded-xl p-0 text-[#6B6B78] hover:text-white hover:bg-white/5"
          >
            <Paperclip className="size-4" />
          </Button>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={contextPlaceholders[context]}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl border-0 text-white placeholder:text-[#6B6B78]"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          />
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachments.length === 0) || isLoading}
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
