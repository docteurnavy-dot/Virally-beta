"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { runReboltActionHelper } from "./rebolt";

// Send workspace invitation email
export const sendInvitationEmail = action({
  args: {
    workspaceId: v.id("workspaces"),
    recipientEmail: v.string(),
    role: v.union(v.literal("editor"), v.literal("viewer")),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get workspace info
    const workspace = await ctx.runQuery(api.workspaces.getWorkspace, {
      workspaceId: args.workspaceId,
    });

    if (!workspace) {
      return { success: false, message: "Workspace not found" };
    }

    // Create the invitation in the database first
    try {
      await ctx.runMutation(api.workspaces.inviteToWorkspace, {
        workspaceId: args.workspaceId,
        email: args.recipientEmail,
        role: args.role,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error creating invitation";
      return { success: false, message: errorMessage };
    }

    // Send the email
    const roleText = args.role === "editor" ? "Editor" : "Viewer";
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0A0D; color: #ffffff; padding: 40px 20px; margin: 0;">
          <div style="max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, rgba(39, 39, 45, 0.9) 0%, rgba(39, 39, 45, 0.7) 100%); border-radius: 24px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); width: 56px; height: 56px; border-radius: 16px; line-height: 56px; font-size: 24px;">⚡</div>
            </div>
            <h1 style="font-size: 24px; font-weight: 600; text-align: center; margin: 0 0 16px 0; color: #ffffff;">Te han invitado a Virally</h1>
            <p style="font-size: 16px; color: #A0A0AB; text-align: center; margin: 0 0 32px 0; line-height: 1.5;">
              Has sido invitado a unirte al workspace <strong style="color: #ffffff;">${workspace.name}</strong> como <strong style="color: #8B5CF6;">${roleText}</strong>.
            </p>
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; margin-bottom: 32px;">
              <p style="font-size: 14px; color: #6B6B78; margin: 0 0 8px 0;">Workspace</p>
              <p style="font-size: 18px; color: #ffffff; margin: 0 0 16px 0; font-weight: 500;">${workspace.name}</p>
              <p style="font-size: 14px; color: #6B6B78; margin: 0 0 8px 0;">Nicho</p>
              <p style="font-size: 16px; color: #ffffff; margin: 0;">${workspace.niche}</p>
            </div>
            <a href="https://virally.app" style="display: block; background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 500; text-align: center;">
              Aceptar Invitación
            </a>
            <p style="font-size: 12px; color: #6B6B78; text-align: center; margin: 24px 0 0 0;">
              Si no esperabas esta invitación, puedes ignorar este email.
            </p>
          </div>
        </body>
      </html>
    `;

    const result = await runReboltActionHelper(ctx, "RESEND_SEND_EMAIL", {
      subject: `Te han invitado a ${workspace.name} en Virally`,
      recipients: [args.recipientEmail],
      content: emailContent,
    });

    if (!result.success) {
      return { 
        success: false, 
        message: "Invitación creada pero no se pudo enviar el email. El usuario verá la invitación al iniciar sesión." 
      };
    }

    return { success: true, message: "Invitación enviada correctamente" };
  },
});
