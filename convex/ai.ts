"use node";

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

    // Context-specific instructions
    const contextInstructions: Record<string, string> = {
      general: "Ayuda con cualquier tarea relacionada con creación de contenido.",
      calendar: `MODO CALENDARIO: El usuario quiere gestionar su calendario de contenido.
Cuando el usuario pida crear eventos, DEBES responder con un JSON válido así:
{"action": "create_events", "events": [{"title": "Título", "date": "YYYY-MM-DD", "type": "video|reel|tiktok|post|story|live", "description": "Descripción opcional"}]}

Si el usuario sube un archivo (PDF, imagen, documento), extrae las fechas y eventos y créalos.
Si dice "todo el mes de julio" o similar, genera eventos para ese período.`,
      ideas: `MODO IDEAS: El usuario quiere gestionar ideas de contenido.
Cuando el usuario pida crear ideas, DEBES responder con un JSON válido así:
{"action": "create_ideas", "ideas": [{"title": "Título de la idea", "description": "Descripción detallada", "category": "video|reel|tiktok|post|story|live"}]}

Genera ideas virales y creativas basadas en el nicho del workspace.`,
      scripts: `MODO GUIONES: El usuario quiere crear guiones para videos.
Cuando el usuario pida crear guiones, DEBES responder con un JSON válido así:
{"action": "create_scripts", "scripts": [{"title": "Título", "hook": "Hook inicial (primeros 3 segundos)", "content": "Contenido completo del guión", "cta": "Call to action final"}]}

Crea guiones virales con hooks potentes y CTAs efectivos.`,
    };

    const systemPrompt = `Eres Virally AI, un asistente experto en creación de contenido viral.
Responde SIEMPRE en español. Sé conciso y práctico.

WORKSPACE ACTUAL:
- Nombre: ${workspace.name}
- Nicho: ${workspace.niche}

CONTENIDO EXISTENTE:
Ideas actuales:
${ideasSummary}

Guiones actuales:
${scriptsSummary}

Calendario:
${eventsSummary}

${contextInstructions[contextType]}

IMPORTANTE: 
- Si el usuario pide CREAR algo (eventos, ideas, guiones), responde SOLO con el JSON correspondiente.
- Si el usuario hace una pregunta o pide ayuda, responde normalmente en texto.
- Cuando crees contenido, hazlo relevante para el nicho "${workspace.niche}".

Historial reciente:
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
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.action === "create_events" && parsed.events) {
          let createdCount = 0;
          for (const event of parsed.events) {
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
          const successMsg = `✅ He creado ${createdCount} evento(s) en tu calendario. ¡Revísalos en la pestaña Calendario!`;
          await ctx.runMutation(api.chat.addAssistantMessage, {
            workspaceId: args.workspaceId,
            content: successMsg,
          });
          return successMsg;
        }
        
        if (parsed.action === "create_ideas" && parsed.ideas) {
          let createdCount = 0;
          for (const idea of parsed.ideas) {
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
          const successMsg = `✅ He creado ${createdCount} idea(s). ¡Revísalas en la pestaña Ideas!`;
          await ctx.runMutation(api.chat.addAssistantMessage, {
            workspaceId: args.workspaceId,
            content: successMsg,
          });
          return successMsg;
        }
        
        if (parsed.action === "create_scripts" && parsed.scripts) {
          let createdCount = 0;
          for (const script of parsed.scripts) {
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
          const successMsg = `✅ He creado ${createdCount} guión(es). ¡Revísalos en la pestaña Guiones!`;
          await ctx.runMutation(api.chat.addAssistantMessage, {
            workspaceId: args.workspaceId,
            content: successMsg,
          });
          return successMsg;
        }
      }
    } catch {
      // Not a JSON response or parsing failed, that's fine - it's a normal text response
    }

    // Save normal text response
    await ctx.runMutation(api.chat.addAssistantMessage, {
      workspaceId: args.workspaceId,
      content: aiResponse,
    });

    return aiResponse;
  },
});
