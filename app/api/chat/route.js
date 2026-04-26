import { NextResponse } from "next/server";

/* ────────────────────────────────────────────
   LEAD DETECTION + EMAIL ALERT
   When the conversation contains a name, phone, and business type,
   we send an email alert to the team. Detection runs on every reply
   but the alert only fires ONCE per conversation (tracked by a flag
   the frontend sends back).
   ──────────────────────────────────────────── */

// Where lead alerts get sent. Update this to your real address.
const ALERT_TO_EMAIL = process.env.LEAD_ALERT_EMAIL || "rhianamaley@tedzintegrativesystems.com";
// Who the alert appears to come from. Must be a domain you've verified in Resend.
// During testing you can use "onboarding@resend.dev" which works without verification.
const ALERT_FROM_EMAIL = process.env.LEAD_ALERT_FROM || "leads@tedzintegrativesystems.com";

/* Try to extract a phone number from text.
   Handles formats like 4695044724, 469-504-4724, (469) 504-4724, +1 469 504 4724 */
function extractPhone(text) {
  const cleaned = text.replace(/[^\d+]/g, "");
  // 10 or 11 digits is a US phone number
  const match = cleaned.match(/(\+?1)?(\d{10})/);
  if (match) {
    const digits = match[2];
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return null;
}

/* Try to extract a name from text.
   Looks at short messages or common patterns like "I'm X" or "name is X" */
function extractName(text) {
  // Common patterns
  const patterns = [
    /(?:my name is|i'?m|i am|this is|it'?s)\s+([A-Za-z][A-Za-z\s'-]{0,30})/i,
    /^([A-Za-z][A-Za-z'-]{1,20})(?:\s|$|,)/,  // first word looks like a name
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const name = m[1].trim();
      // Filter out common false positives
      if (!/^(yes|no|hi|hey|hello|ok|okay|sure|thanks|hvac|need|want)$/i.test(name)) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      }
    }
  }
  return null;
}

/* Mine the entire conversation for the lead's name, phone, and business type. */
function extractLeadInfo(history, currentMessage) {
  const userMessages = [
    ...(history || []).filter(m => m.role === "user").map(m => m.content),
    currentMessage,
  ];

  let phone = null;
  let name = null;
  let business = null;

  for (const msg of userMessages) {
    if (!phone) phone = extractPhone(msg);
    if (!name) name = extractName(msg);
  }

  // Business type is harder, the model usually asks for it directly,
  // so the user's reply right after that question is the business.
  // We look for short replies that aren't the name/phone message.
  for (let i = 0; i < userMessages.length; i++) {
    const msg = userMessages[i];
    // Skip if it contains a phone (likely the contact info reply)
    if (extractPhone(msg)) continue;
    // Skip very long messages (probably a question, not an answer)
    if (msg.length > 60) continue;
    // Skip the first message (greeting response)
    if (i === 0) continue;
    // Skip if it's just the name
    if (name && msg.trim().toLowerCase() === name.toLowerCase()) continue;
    // This is probably the business type answer
    if (msg.length > 1 && msg.length < 60) {
      business = msg.trim();
      break;
    }
  }

  return { name, phone, business };
}

/* Send the lead alert via Resend. */
async function sendLeadAlert(lead, fullConversation) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email alert");
    return;
  }

  const conversationHtml = fullConversation
    .map(m => {
      const role = m.role === "user" ? "Visitor" : "Jordan";
      const color = m.role === "user" ? "#1B2C5C" : "#64748B";
      return `<div style="margin-bottom:12px;"><strong style="color:${color}">${role}:</strong> ${m.content.replace(/\n/g, "<br>")}</div>`;
    })
    .join("");

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#1B2C5C;color:#F5B82E;padding:20px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;font-size:22px;">New Lead from TEDZ Chat</h1>
      </div>
      <div style="background:#FAF7F0;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E8ECF0;border-top:none;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#64748B;width:120px;">Name</td><td style="padding:8px 0;font-weight:700;color:#1B2C5C;">${lead.name || "(not captured)"}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">Phone</td><td style="padding:8px 0;font-weight:700;color:#1B2C5C;">${lead.phone || "(not captured)"}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">Business</td><td style="padding:8px 0;font-weight:700;color:#1B2C5C;">${lead.business || "(not captured)"}</td></tr>
          <tr><td style="padding:8px 0;color:#64748B;">Captured</td><td style="padding:8px 0;color:#1B2C5C;">${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CT</td></tr>
        </table>
        <h2 style="margin:24px 0 12px;font-size:16px;color:#1B2C5C;">Full conversation</h2>
        <div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #E8ECF0;font-size:14px;line-height:1.6;">
          ${conversationHtml}
        </div>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E8ECF0;color:#94A3B8;font-size:12px;">
          Sent automatically by Jordan, your TEDZ AI assistant.
        </div>
      </div>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: ALERT_FROM_EMAIL,
        to: ALERT_TO_EMAIL,
        subject: `New TEDZ Lead: ${lead.name || "Unknown"}${lead.business ? ` (${lead.business})` : ""}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend error:", await res.text());
    } else {
      console.log("Lead alert sent for:", lead.name);
    }
  } catch (err) {
    console.error("Failed to send lead alert:", err);
  }
}


export async function POST(request) {
  try {
    const { message, businessInfo, history, leadAlertSent } = await request.json();

    const systemPrompt = businessInfo
      ? `You are Jordan, the AI chat assistant for ${businessInfo.name}. ${businessInfo.prompt || ""}
      
BUSINESS INFO:
${businessInfo.details || "No details provided."}

RULES:
1. Your name is Jordan. If asked, you are an AI assistant. Never claim to be human.
2. Be professional and conversational. Keep responses to two to three sentences max.
3. Write only in full, complete sentences. Never use dashes (—, –, or "-") to join phrases. Use periods, commas, or separate sentences instead.
4. NEVER make up information not provided above.
5. Collect name, phone number, and service needed, but ONLY ask for information you don't already have. Whatever the customer provides as their name is their name. Do not re-ask for a "full name" or "complete name" if they have already given you a name, even a short or casual one.
6. For emergencies, give the phone number immediately.
7. Never give medical advice or diagnose problems.
8. NEVER use markdown formatting like **, ##, or bullet symbols. NEVER use emojis. Write in plain text only.
9. When a customer wants to book an appointment and you have their name and phone number, give them this link: https://cal.com/rhiana-maley-zd0c7u/service-appointment and tell them to pick a time.`
      : `You are Jordan, the AI assistant for TEDZ Integrative Systems, an AI chat and lead capture platform for small businesses.

CONVERSATION STAGES:
You move through three stages. Track which info you already have and never re-ask.

STAGE 1 — CAPTURE NAME AND PHONE
Goal: Collect the visitor's name and phone number on their first reply.
- Whatever they tell you their name is, that IS their name. Even if it's short like "Rhi", "Jay", or just first name only. Never ask for a "full name" or "complete name" once they've given any name.
- If they ask a question instead of giving info, give a brief one-sentence answer, then ask for name and phone.
- Once you have BOTH a name and a phone number, move to Stage 2 immediately.

STAGE 2 — UNDERSTAND THEIR BUSINESS
Goal: Ask what type of business they run, ONCE.
- Acknowledge their answer briefly. One short sentence about how TEDZ helps that type of business.
- Then move to Stage 3.

STAGE 3 — CONFIRM AND HAND OFF
Goal: Tell them they're set. Stop collecting info.
- Say something warm like: "Thanks [name], you're all set. Someone from our team will reach out to you at [phone] within 24 hours to walk through how TEDZ can help your [business type]."
- Offer the booking link as an option for sooner: https://cal.com/tedz-integrative-systems/service-appointment
- After this, you may answer questions about TEDZ if they keep chatting. But NEVER re-ask for name, phone, business type, or anything else they already gave you.

GENERAL RULES:
1. Your name is Jordan. If asked, you are an AI assistant. Never claim to be human.
2. Keep every response to two to three sentences max.
3. Write only in full, complete sentences. Never use dashes (—, –, or "-"). Use periods, commas, or separate sentences instead.
4. NEVER use markdown formatting like **, ##, or bullet symbols. NEVER use emojis.
5. NEVER mention specific pricing or dollar amounts. If asked about cost, say "Pricing depends on your business size and needs. We'll put together a custom quote for you."
6. NEVER make up features or capabilities. If unsure, say someone from the team will follow up with details.
7. Once name and phone are captured, NEVER re-ask. Do not ask for a "full name", "last name", or any other variation if they've already given you a name.
8. If they get hesitant about giving their phone, say it's just so the team can follow up, and assure them you won't share it.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 250,
        system: systemPrompt,
        messages: [
          ...(history || []),
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    let reply = data.content[0].text;

    // Strip dashes
    reply = reply
      .replace(/\s+[—–]\s+/g, ". ")
      .replace(/[—–]/g, ",")
      .replace(/\s+-\s+/g, ". ");

    // Lead detection and email alert
    // Only check on the TEDZ-side bot (not customer business bots), and only if alert hasn't fired
    let alertJustSent = false;
    if (!businessInfo && !leadAlertSent) {
      const lead = extractLeadInfo(history, message);
      if (lead.name && lead.phone) {
        const fullConv = [
          ...(history || []),
          { role: "user", content: message },
          { role: "assistant", content: reply },
        ];
        // Fire and forget, don't block the response
        sendLeadAlert(lead, fullConv).catch(err => console.error("Alert failed:", err));
        alertJustSent = true;
      }
    }

    return NextResponse.json({ reply, leadAlertSent: leadAlertSent || alertJustSent });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}