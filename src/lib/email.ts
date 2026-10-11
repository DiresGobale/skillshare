import nodemailer from "nodemailer";

// ============================================================
// EMAIL SERVICE — sends transactional emails via SMTP
// ============================================================
// Configuration via environment variables:
//   SMTP_HOST       — e.g. smtp.gmail.com, smtp.sendgrid.net
//   SMTP_PORT       — 587 (TLS) or 465 (SSL)
//   SMTP_USER       — SMTP username
//   SMTP_PASS       — SMTP password / API key
//   SMTP_FROM       — From email address (e.g. noreply@skillmatch.ai)
//   APP_BASE_URL    — e.g. http://localhost:3000 or https://skillmatch.ai
//
// If SMTP_HOST is not set, emails are logged to the console (dev mode)
// and the verification/reset tokens are shown in the log so you can
// still complete the flows during development.

const APP_NAME = "SkillMatch AI";
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null; // dev mode — no SMTP configured

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: parseInt(process.env.SMTP_PORT || "587", 10) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
      : undefined,
  });
  return transporter;
}

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailParams): Promise<{ sent: boolean; devPreview?: string }> {
  const transport = getTransporter();
  const from = process.env.SMTP_FROM || `noreply@${APP_BASE_URL.replace(/^https?:\/\//, "").split("/")[0]}`;

  if (!transport) {
    // Dev mode — log the email to the console
    console.log("\n ========== EMAIL (DEV MODE — no SMTP configured) ==========");
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("---");
    console.log(text || html.replace(/<[^>]*>/g, "").trim());
    console.log("============================================================\n");
    return { sent: false, devPreview: "Email logged to console (dev mode)" };
  }

  try {
    await transport.sendMail({
      from: `"${APP_NAME}" <${from}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, "").trim(),
    });
    return { sent: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { sent: false };
  }
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

function emailWrapper(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${APP_NAME}</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Skill-based hiring for the African talent market</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600;">${title}</h2>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #e4e4e7;">
            <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center;">
              © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
              This email was sent to ${"{{to}}"}. If you didn't request this, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ============================================================
// SPECIFIC EMAIL TEMPLATES
// ============================================================

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const verifyUrl = `${APP_BASE_URL}/?view=verify-email&token=${token}&email=${encodeURIComponent(to)}`;
  const body = `
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Welcome to ${APP_NAME}! Please verify your email address to activate your account and start applying for jobs.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">Verify Email Address</a>
    </div>
    <p style="margin:0 0 8px;color:#71717a;font-size:13px;">Or copy this link into your browser:</p>
    <p style="margin:0 0 16px;color:#3b82f6;font-size:12px;word-break:break-all;">${verifyUrl}</p>
    <p style="margin:0;color:#a1a1aa;font-size:12px;">This verification link expires in 24 hours.</p>`;
  await sendEmail({ to, subject: `Verify your email — ${APP_NAME}`, html: emailWrapper("Verify Your Email Address", body) });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const resetUrl = `${APP_BASE_URL}/?view=reset-password&token=${token}&email=${encodeURIComponent(to)}`;
  const body = `
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">We received a request to reset your password. Click the button below to choose a new password.</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">Reset Password</a>
    </div>
    <p style="margin:0 0 8px;color:#71717a;font-size:13px;">Or copy this link into your browser:</p>
    <p style="margin:0 0 16px;color:#3b82f6;font-size:12px;word-break:break-all;">${resetUrl}</p>
    <p style="margin:0;color:#a1a1aa;font-size:12px;">This password reset link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>`;
  await sendEmail({ to, subject: `Reset your password — ${APP_NAME}`, html: emailWrapper("Password Reset Request", body) });
}

export async function sendApplicationConfirmationEmail(to: string, name: string, jobTitle: string, company: string): Promise<void> {
  const body = `
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been submitted successfully.</p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">The employer will review your application and notify you at each stage of the recruitment process. You can track your application status anytime from your dashboard.</p>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#71717a;font-size:13px;"><strong>Next steps:</strong> The employer will review your application. If selected, you'll receive a notification to prepare for the written examination.</p>
    </div>`;
  await sendEmail({ to, subject: `Application submitted — ${jobTitle} at ${company}`, html: emailWrapper("Application Received", body) });
}

export async function sendStageUpdateEmail(to: string, name: string, jobTitle: string, company: string, stageMessage: string): Promise<void> {
  const body = `
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">There's an update on your application for <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
    <div style="background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#1e3a5f;font-size:14px;line-height:1.6;">${stageMessage}</p>
    </div>
    <p style="margin:0;color:#71717a;font-size:13px;">Log in to your dashboard to view the full details.</p>`;
  await sendEmail({ to, subject: `Application update — ${jobTitle} at ${company}`, html: emailWrapper("Application Status Update", body) });
}

export async function sendNewMessageEmail(to: string, name: string, fromName: string, preview: string): Promise<void> {
  const body = `
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">You have a new message from <strong>${fromName}</strong>:</p>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#3f3f46;font-size:14px;line-height:1.6;font-style:italic;">"${preview}"</p>
    </div>
    <p style="margin:0;color:#71717a;font-size:13px;">Log in to read and reply to this message.</p>`;
  await sendEmail({ to, subject: `New message from ${fromName}`, html: emailWrapper("New Message", body) });
}
