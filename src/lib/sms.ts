// ============================================================
// SMS SERVICE — sends SMS messages via Africa's Talking or Twilio
// ============================================================
// Configuration via environment variables:
//   SMS_PROVIDER       — "africas-talking" | "twilio" | (empty = dev mode)
//
//   Africa's Talking:
//     AFRICAS_TALKING_USERNAME
//     AFRICAS_TALKING_API_KEY
//     AFRICAS_TALKING_SENDER_ID (optional)
//
//   Twilio:
//     TWILIO_ACCOUNT_SID
//     TWILIO_AUTH_TOKEN
//     TWILIO_PHONE_NUMBER
//
// In dev mode (no provider configured), SMS content is logged to the console.

interface SmsResult {
  sent: boolean;
  devPreview?: string;
}

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const provider = process.env.SMS_PROVIDER;

  if (!provider) {
    // Dev mode — log to console
    console.log("\n ========== SMS (DEV MODE — no SMS provider configured) ==========");
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log("==================================================================\n");
    return { sent: false, devPreview: message };
  }

  try {
    if (provider === "africas-talking") {
      return await sendViaAfricasTalking(to, message);
    } else if (provider === "twilio") {
      return await sendViaTwilio(to, message);
    }
    console.error("Unknown SMS provider:", provider);
    return { sent: false };
  } catch (err) {
    console.error("SMS send failed:", err);
    return { sent: false };
  }
}

// Africa's Talking SMS gateway — popular in East Africa (Ethiopia, Kenya, etc.)
async function sendViaAfricasTalking(to: string, message: string): Promise<SmsResult> {
  const username = process.env.AFRICAS_TALKING_USERNAME;
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  const senderId = process.env.AFRICAS_TALKING_SENDER_ID || "SKILLMATCH";

  if (!username || !apiKey) {
    console.error("Africa's Talking credentials not configured");
    return { sent: false };
  }

  const body = new URLSearchParams({
    username,
    to,
    message,
    from: senderId,
  });

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apiKey,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    console.error("Africa's Talking API error:", res.status, await res.text());
    return { sent: false };
  }

  return { sent: true };
}

// Twilio SMS gateway
async function sendViaTwilio(to: string, message: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error("Twilio credentials not configured");
    return { sent: false };
  }

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: message,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
    },
    body: body.toString(),
  });

  if (!res.ok) {
    console.error("Twilio API error:", res.status, await res.text());
    return { sent: false };
  }

  return { sent: true };
}

// Generate a random 6-digit OTP code
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
