

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { runReboltActionHelper } from "./rebolt";

// Attachment validator
const attachmentValidator = v.object({
  mime_type: v.string(),
  file_url: v.optional(v.string()),
  base64_encoded_data: v.optional(v.string()),
});

// Helper to extract JSON from AI response
function extractJSON(text: string): Record<string, unknown> | null {
  // Try to find JSON in the response
  const jsonPatterns = [
    /```json\s*([\s\S]*?)\s*```/,  // ```json ... ```
    /```\s*([\s\S]*?)\s*```/,       // ``` ... ```
    /(\{[\s\S]*\})/,                // Raw JSON object
  ];

  for (const pattern of jsonPatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const jsonStr = match[1] || match[0];
        return JSON.parse(jsonStr.trim());
      } catch {
        continue;
      }
    }
  }
  return null;
}

// Send a message to the AI and get a response with full context
export const chat = action({
  args: {
    workspaceId: v.id("workspaces"),
    message: v.string(),
    context: v.optional(v.union(
      v.literal("general"),
      v.literal("calendar"),
      v.literal("ideas"),
      v.literal("scripts")
    )),
    attachments: v.optional(v.array(attachmentValidator)),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const contextType = args.context ?? "general";

    // Get workspace info
    const workspace = await ctx.runQuery(api.workspaces.getWorkspace, {
      workspaceId: args.workspaceId,
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Get workspace content for context
    const [ideas, scripts, events, messages] = await Promise.all([
      ctx.runQuery(api.ideas.getIdeas, { workspaceId: args.workspaceId }),
      ctx.runQuery(api.scripts.getScripts, { workspaceId: args.workspaceId }),
      ctx.runQuery(api.calendar.getEvents, { workspaceId: args.workspaceId }),
      ctx.runQuery(api.chat.getMessages, { workspaceId: args.workspaceId, limit: 5 }),
    ]);

    // Build context summaries
    const ideasSummary = ideas.slice(0, 10).map(i => `- ${i.title} (${i.viralScore})`).join("\n") || "Sin ideas aún";
    const scriptsSummary = scripts.slice(0, 10).map(s => `- ${s.title} (${s.status})`).join("\n") || "Sin guiones aún";
    const eventsSummary = events.slice(0, 10).map(e => `- ${e.title} el ${e.date}`).join("\n") || "Sin eventos aún";

    const conversationHistory = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Virally"}: ${m.content}`)
      .join("\n");

    // Get current date for context
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Context-specific instructions
    const contextInstructions: Record<string, string> = {
      general: `Puedes ayudar con ideas, guiones y calendario.
Si el usuario pide crear IDEAS, responde con: {"action": "create_ideas", "ideas": [...]}
Si el usuario pide crear EVENTOS o programar contenido, responde con: {"action": "create_events", "events": [...]}
Si el usuario pide crear GUIONES, responde con: {"action": "create_scripts", "scripts": [...]}`,
      calendar: `MODO CALENDARIO: El usuario quiere gestionar su calendario de contenido.
Cuando el usuario pida crear eventos o programar contenido, responde ÚNICAMENTE con este JSON:
{"action": "create_events", "events": [{"title": "Título descriptivo", "date": "YYYY-MM-DD", "type": "reel", "description": "Descripción"}]}

IMPORTANTE sobre fechas:
- Hoy es ${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}
- Si dicen "23 de diciembre", usa "${currentYear}-12-23"
- Si dicen "para julio", genera eventos en "${currentYear}-07-XX"
- Siempre usa formato YYYY-MM-DD`,
      ideas: `MODO IDEAS: El usuario quiere crear ideas de contenido viral.
Cuando el usuario pida crear ideas, responde ÚNICAMENTE con este JSON:
{"action": "create_ideas", "ideas": [{"title": "Título viral de la idea", "description": "Descripción detallada con el concepto", "category": "reel"}]}

IMPORTANTE:
- Genera ideas VIRALES y creativas para el nicho "${workspace.niche}"
- Si mencionan una fecha (ej: "para el 23 de diciembre"), incluye esa fecha en el título o descripción
- category puede ser: video, reel, tiktok, post, story, live`,
      scripts: `MODO GUIONES: El usuario quiere crear guiones para videos.
Cuando el usuario pida crear guiones, responde ÚNICAMENTE con este JSON:
{"action": "create_scripts", "scripts": [{"title": "Título", "hook": "Hook potente (primeros 3 segundos)", "content": "Guión completo", "cta": "Call to action"}]}`,
    };

    const systemPrompt = `Eres Virally AI, asistente experto en contenido viral. Responde en español.

WORKSPACE: ${workspace.name} | NICHO: ${workspace.niche}
FECHA ACTUAL: ${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}

CONTENIDO EXISTENTE:
Ideas: ${ideasSummary}
Guiones: ${scriptsSummary}
Calendario: ${eventsSummary}

${contextInstructions[contextType]}

REGLAS CRÍTICAS:
1. Si el usuario pide CREAR algo (ideas, eventos, guiones), responde SOLO con el JSON correspondiente, sin texto adicional.
2. NO incluyas explicaciones antes o después del JSON cuando crees contenido.
3. Si el usuario hace una PREGUNTA o pide AYUDA, responde en texto normal.
4. Cuando crees contenido, hazlo relevante para el nicho "${workspace.niche}".

Historial:
${conversationHistory}`;

    // Save user message
    await ctx.runMutation(api.chat.addUserMessage, {
      workspaceId: args.workspaceId,
      content: args.message,
    });

    // Prepare attachments for the AI
    const aiAttachments = args.attachments?.map(att => ({
      mime_type: att.mime_type,
      file_url: att.file_url ?? null,
      base64_encoded_data: att.base64_encoded_data ?? null,
    }));

    // Call the AI
    const result = await runReboltActionHelper(ctx, "RUN_REBOLT_AGENT", {
      system_prompt: systemPrompt,
      user_prompt: args.message,
      attachments: aiAttachments,
    });

    if (!result.success || !result.output) {
      const errorResponse = "❌ Error al procesar tu mensaje. Intenta de nuevo.";
      await ctx.runMutation(api.chat.addAssistantMessage, {
        workspaceId: args.workspaceId,
        content: errorResponse,
      });
      return errorResponse;
    }

    const aiResponse = result.output.response;

    // Try to parse and execute actions from the response
    const parsed = extractJSON(aiResponse);

    if (parsed && parsed.action) {
      try {
        if (parsed.action === "create_events" && Array.isArray(parsed.events)) {
          let createdCount = 0;
          for (const event of parsed.events as Array<{ title?: string; date?: string; type?: string; description?: string }>) {
            if (!event.title || !event.date) continue;
            await ctx.runMutation(api.calendar.createEvent, {
              workspaceId: args.workspaceId,
              title: event.title,
              date: event.date,
              description: event.description || undefined,
              funnelStage: "tofu",
              status: "draft",
              contentType: event.type || "Reel",
            });
            createdCount++;
          }
          if (createdCount > 0) {
            const successMsg = `✅ He creado ${createdCount} evento(s) en tu calendario. ¡Revísalos en la pestaña Calendario!`;
            await ctx.runMutation(api.chat.addAssistantMessage, {
              workspaceId: args.workspaceId,
              content: successMsg,
            });
            return successMsg;
          }
        }

        if (parsed.action === "create_ideas" && Array.isArray(parsed.ideas)) {
          let createdCount = 0;
          for (const idea of parsed.ideas as Array<{ title?: string; description?: string; category?: string }>) {
            if (!idea.title) continue;
            await ctx.runMutation(api.ideas.createIdea, {
              workspaceId: args.workspaceId,
              title: idea.title,
              description: idea.description || "",
              source: "ai",
              viralScore: "trending",
              contentType: idea.category || "Reel",
              hooks: [],
            });
            createdCount++;
          }
          if (createdCount > 0) {
            const successMsg = `✅ He creado ${createdCount} idea(s). ¡Revísalas en la pestaña Ideas!`;
            await ctx.runMutation(api.chat.addAssistantMessage, {
              workspaceId: args.workspaceId,
              content: successMsg,
            });
            return successMsg;
          }
        }

        if (parsed.action === "create_scripts" && Array.isArray(parsed.scripts)) {
          let createdCount = 0;
          for (const script of parsed.scripts as Array<{ title?: string; hook?: string; content?: string; cta?: string }>) {
            if (!script.title) continue;
            await ctx.runMutation(api.scripts.createScript, {
              workspaceId: args.workspaceId,
              title: script.title,
              hook: script.hook || "",
              body: script.content || "",
              cta: script.cta || "",
              status: "draft",
            });
            createdCount++;
          }
          if (createdCount > 0) {
            const successMsg = `✅ He creado ${createdCount} guión(es). ¡Revísalos en la pestaña Guiones!`;
            await ctx.runMutation(api.chat.addAssistantMessage, {
              workspaceId: args.workspaceId,
              content: successMsg,
            });
            return successMsg;
          }
        }
      } catch (error) {
        console.error("Error processing AI action:", error);
        // Fall through to save the raw response
      }
    }

    // Save normal text response
    await ctx.runMutation(api.chat.addAssistantMessage, {
      workspaceId: args.workspaceId,
      content: aiResponse,
    });

    return aiResponse;
  },
});
