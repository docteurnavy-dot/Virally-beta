"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { runReboltActionHelper } from "./rebolt";

// Send a message to the AI and get a response
export const chat = action({
  args: {
    workspaceId: v.id("workspaces"),
    message: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // Get workspace info for context
    const workspace = await ctx.runQuery(api.workspaces.getWorkspace, {
      workspaceId: args.workspaceId,
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Get recent chat history for context
    const messages = await ctx.runQuery(api.chat.getMessages, {
      workspaceId: args.workspaceId,
      limit: 10,
    });

    // Build conversation history
    const conversationHistory = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
      .join("\n");

    // Create system prompt for content creator assistant
    const systemPrompt = `Eres un asistente experto en creación de contenido viral para redes sociales. 
Tu nombre es Virally AI.

Contexto del workspace:
- Nombre: ${workspace.name}
- Nicho: ${workspace.niche}

Tu rol es ayudar al creador de contenido con:
1. Generar ideas de contenido viral
2. Escribir hooks atractivos
3. Crear guiones para videos cortos (TikTok, Reels, Shorts)
4. Sugerir estrategias de contenido
5. Analizar tendencias
6. Optimizar CTAs y lead magnets

Responde siempre en español, de forma concisa y práctica.
Usa emojis ocasionalmente para hacer las respuestas más amigables.

Historial de conversación reciente:
${conversationHistory}`;

    // Save user message first
    await ctx.runMutation(api.chat.addUserMessage, {
      workspaceId: args.workspaceId,
      content: args.message,
    });

    // Call the AI
    const result = await runReboltActionHelper(ctx, "RUN_REBOLT_AGENT", {
      system_prompt: systemPrompt,
      user_prompt: args.message,
    });

    if (!result.success || !result.output) {
      const errorResponse = "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.";
      await ctx.runMutation(api.chat.addAssistantMessage, {
        workspaceId: args.workspaceId,
        content: errorResponse,
      });
      return errorResponse;
    }

    const aiResponse = result.output.response;

    // Save assistant response
    await ctx.runMutation(api.chat.addAssistantMessage, {
      workspaceId: args.workspaceId,
      content: aiResponse,
    });

    return aiResponse;
  },
});
