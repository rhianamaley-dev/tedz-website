import { NextResponse } from "next/server";

/* ────────────────────────────────────────────
   TWO-STAGE LEAD ALERT SYSTEM
   
   STAGE 1 — IMMEDIATE ALERT
   Fires the moment name + phone are captured.
   Subject: "[NEW LEAD] Name (Phone)"
   Purpose: act fast, call them back NOW.
   
   STAGE 2 — FINAL TRANSCRIPT
   Fires when the conversation appears finished:
     - Visitor has been idle for 2+ minutes (frontend detects, sends "finalize" signal)
     - Visitor says goodbye/thanks/done (server-side keyword detection)
     - Conversation reaches 8+ total messages
   Subject: "[FINAL] Name (Business) - Full transcript"
   Purpose: complete record with context for follow-up.
   
   Each stage fires only ONCE per conversation, tracked by flags from the frontend.
   ──────────────────────────────────────────── */

// Recipients — supports comma-separated env var or hardcoded fallback
const ALERT_TO_EMAIL = process.env.LEAD_ALERT_EMAIL
  ? process.env.LEAD_ALERT_EMAIL.split(",").map(e => e.trim())
  : [
      "rhiana@tedzintegrativesystems.com",
      "christian@tedzintegrativesystems.com",
    ];
const ALERT_FROM_EMAIL = process.env.LEAD_ALERT_FROM || "leads@tedzintegrativesystems.com";

/* Trigger thresholds */
const FINAL_EMAIL_MESSAGE_COUNT_THRESHOLD = 8;
// Frontend detects idle (2+ min) and sends a finalize signal — see page.js

/* ────────────────────────────────────────────
   EXTRACTORS
   ──────────────────────────────────────────── */

function extractPhone(text) {
  const cleaned = text.replace(/[^\d+]/g, "");
  const match = cleaned.match(/(\+?1)?(\d{10})/);
  if (match) {
    const digits = match[2];
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  return null;
}

function extractName(text) {
  const patterns = [
    /(?:my name is|i'?m|i am|this is|it'?s)\s+([A-Za-z][A-Za-z\s'-]{0,30})/i,
    /^([A-Za-z][A-Za-z'-]{1,20})(?:\s|$|,)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const name = m[1].trim();
      if (!/^(yes|no|hi|hey|hello|ok|okay|sure|thanks|hvac|need|want|how|what|when|where|why|who)$/i.test(name)) {
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      }
    }
  }
  return null;
}

function extractLeadInfo(history, currentMessage) {
  const userMessages = [
    ...(history || []).filter(m => m.role === "user").map(m => m.content),
    currentMessage,
  ].filter(Boolean);

  let phone = null;
  let name = null;
  let business = null;

  for (const msg of userMessages) {
    if (!phone) phone = extractPhone(msg);
    if (!name) name = extractName(msg);
  }

  // Business type: short reply that isn't the contact info or first message
  for (let i = 0; i < userMessages.length; i++) {
    const msg = userMessages[i];
    if (extractPhone(msg)) continue;
    if (msg.length > 60) continue;
    if (i === 0) continue;
    if (name && msg.trim().toLowerCase() === name.toLowerCase()) continue;
    if (msg.length > 1 && msg.length < 60) {
      business = msg.trim();
      break;
    }
  }

  return { name, phone, business };
}

/* Detect "goodbye / thanks / done" intent in user message */
function looksLikeFarewell(text) {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  // Direct farewells
  const farewells = [
    /^bye\b/, /^goodbye\b/, /^see ya\b/, /^see you\b/,
    /^thanks?(\s+(so|a))?\s*much/, /^thank you\b/, /^ty\b/,
    /^(that'?s|thats)\s+(all|it)\b/,
    /^(i'?m|im)\s+(good|done|set|all set)\b/,
    /^all set\b/, /^got it\b/, /^perfect\b/,
    /^talk (later|soon)/, /^later\b/, /^cya\b/,
    /^have a (good|great|nice)/, /^you too\b/,
  ];
  return farewells.some(p => p.test(t));
}

/* ────────────────────────────────────────────
   EMAIL TEMPLATES
   ──────────────────────────────────────────── */

function buildConversationHtml(messages) {
  return messages
    .map(m => {
      const role = m.role === "user" ? "Visitor" : "Jordan";
      const color = m.role === "user" ? "#ff5c1a" : "#9ca3af";
      return `<div style="margin-bottom:12px;"><strong style="color:${color}">${role}:</strong> ${m.content.replace(/\n/g, "<br>")}</div>`;
    })
    .join("");
}

function buildEmailHtml({ headerLabel, headerColor, lead, messages, footerNote }) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:${headerColor};padding:20px;border-radius:12px 12px 0 0;">
        <div style="font-size:11px;letter-spacing:0.15em;font-weight:700;opacity:0.9;margin-bottom:4px;color:#f5f3ee;">${headerLabel}</div>
        <h1 style="margin:0;font-size:22px;color:#ff5c1a;">${lead.name || "Unknown lead"}</h1>
      </div>
      <div style="background:#1c1f26;padding:24px;border-radius:0 0 12px 12px;border:1px solid rgba(255,255,255,0.1);border-top:none;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#9ca3af;width:120px;">Name</td><td style="padding:8px 0;font-weight:700;color:#f5f3ee;">${lead.name || "(not captured)"}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;">Phone</td><td style="padding:8px 0;font-weight:700;color:#f5f3ee;">${lead.phone || "(not captured)"}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;">Business</td><td style="padding:8px 0;font-weight:700;color:#f5f3ee;">${lead.business || "(not captured yet)"}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;">Captured</td><td style="padding:8px 0;color:#f5f3ee;">${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CT</td></tr>
        </table>
        <h2 style="margin:24px 0 12px;font-size:16px;color:#f5f3ee;">Full conversation (${messages.length} messages)</h2>
        <div style="background:#0a0a0a;padding:16px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);font-size:14px;line-height:1.6;color:#d1d5db;">
          ${buildConversationHtml(messages)}
        </div>
        ${footerNote ? `<div style="margin-top:16px;padding:12px;background:rgba(255,92,26,0.1);border-left:3px solid #ff5c1a;border-radius:6px;font-size:13px;color:#f5f3ee;">${footerNote}</div>` : ""}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);color:#6b7280;font-size:12px;">
          Sent automatically by Jordan, your TEDZ AI assistant.
        </div>
      </div>
    </div>
  `;
}

/* ────────────────────────────────────────────
   SEND FUNCTIONS
   ──────────────────────────────────────────── */

async function sendImmediateAlert(lead, messages) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping immediate alert");
    return;
  }
  const html = buildEmailHtml({
    headerLabel: "NEW LEAD — CALL ASAP",
    headerColor: "#0a0a0a",
    lead,
    messages,
    footerNote: "This lead was just captured. The conversation may continue, you'll receive a final transcript when it ends.",
  });
  const subject = `[NEW LEAD] ${lead.name || "Unknown"}${lead.phone ? ` (${lead.phone})` : ""}`;
  await sendEmail(subject, html, "immediate");
}

async function sendFinalTranscript(lead, messages, reason) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping final transcript");
    return;
  }
  const reasonText = {
    farewell: "Visitor said goodbye or thank you.",
    idle: "Visitor was idle for over 2 minutes.",
    threshold: `Conversation reached ${FINAL_EMAIL_MESSAGE_COUNT_THRESHOLD}+ messages.`,
  }[reason] || "Conversation completed.";

  const html = buildEmailHtml({
    headerLabel: "FINAL TRANSCRIPT",
    headerColor: "#1c1f26",
    lead,
    messages,
    footerNote: `Conversation finalized: ${reasonText}`,
  });
  const subject = `[FINAL] ${lead.name || "Unknown"}${lead.business ? ` (${lead.business})` : ""}`;
  await sendEmail(subject, html, "final");
}

async function sendEmail(subject, html, tag) {
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
        subject,
        html,
        tags: [{ name: "stage", value: tag }],
      }),
    });
    if (!res.ok) {
      console.error(`Resend ${tag} error:`, await res.text());
    } else {
      console.log(`${tag} alert sent:`, subject);
    }
  } catch (err) {
    console.error(`Failed to send ${tag} alert:`, err);
  }
}

/* ────────────────────────────────────────────
   MAIN HANDLER
   ──────────────────────────────────────────── */

export async function POST(request) {
  try {
    const {
      message,
      businessInfo,
      history,
      leadAlertSent,        // immediate-alert flag from frontend
      finalTranscriptSent,  // final-transcript flag from frontend
      finalize,             // signal from frontend that idle timer fired
    } = await request.json();

    const userMessages = (history || []).filter(m => m.role === "user");
    const totalMessageCount = (history || []).length + (message ? 1 : 0);

    // ────────────────────────────────────────────
    // FINALIZE-ONLY REQUEST (no chat reply needed)
    // Frontend sends this when the idle timer fires.
    // ────────────────────────────────────────────
    if (finalize === true && !finalTranscriptSent && !businessInfo) {
      const lead = extractLeadInfo(history, "");
      if (lead.name && lead.phone) {
        await sendFinalTranscript(lead, history || [], "idle");
        return NextResponse.json({ finalTranscriptSent: true });
      }
      return NextResponse.json({ finalTranscriptSent: false });
    }

    // ────────────────────────────────────────────
    // SYSTEM PROMPT
    // ────────────────────────────────────────────
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
9. When a customer wants to book an appointment and you have their name and phone number, give them this link: https://cal.com/tedz-integrative-systems/service-appointment and tell them to pick a time.`
      : `You are Jordan, the AI assistant for TEDZ Integrative Systems, an AI chat and lead capture platform for small businesses.

CONVERSATION STAGES:
You move through three stages. Track which info you already have and never re-ask.

STAGE 1 — CAPTURE NAME AND PHONE
Goal: Collect the visitor's name and phone number on their first reply.
- Whatever they tell you their name is, that IS their name. Even if it's short like "Rhi", "Jay", or just first name only. Never ask for a "full name" or "complete name" once they've given any name.
- If they ask a question instead of giving info, give a brief one-sentence answer, then ask for name and phone.
- If the visitor's FIRST message mentions their industry or business type (like "I run a plumbing business" or "I run a HVAC companies business"), confirm the industry in one short sentence, then immediately ask for their name and phone number. Do NOT ask what type of business they run since they already told you. Move directly to capturing name and phone.
- Once you have BOTH a name and a phone number, move to Stage 2 immediately.

STAGE 2 — UNDERSTAND THEIR BUSINESS
Goal: Ask what type of business they run, ONCE.
- SKIP this stage entirely if the visitor already mentioned their business type in an earlier message. Go straight to Stage 3.
- If you do need to ask, acknowledge their answer briefly. One short sentence about how TEDZ helps that type of business.
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

    // ────────────────────────────────────────────
    // CALL CLAUDE API
    // ────────────────────────────────────────────
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

    // Dash stripper
    reply = reply
      .replace(/\s+[—–]\s+/g, ". ")
      .replace(/[—–]/g, ",")
      .replace(/\s+-\s+/g, ". ");

    // ────────────────────────────────────────────
    // EMAIL TRIGGERING (only on TEDZ-side bot)
    // ────────────────────────────────────────────
    let alertJustSent = false;
    let finalJustSent = false;

    if (!businessInfo) {
      const lead = extractLeadInfo(history, message);
      const fullConv = [
        ...(history || []),
        { role: "user", content: message },
        { role: "assistant", content: reply },
      ];

      // STAGE 1: Immediate alert when name + phone captured
      if (!leadAlertSent && lead.name && lead.phone) {
        sendImmediateAlert(lead, fullConv).catch(err => console.error("Immediate alert failed:", err));
        alertJustSent = true;
      }

      // STAGE 2: Final transcript triggers
      // Only fire if we have at least name+phone (otherwise nothing useful to send)
      // and we've already sent the immediate alert (or we're sending it now)
      if (!finalTranscriptSent && (leadAlertSent || alertJustSent) && lead.name && lead.phone) {
        let triggerReason = null;

        // Trigger A: visitor said goodbye/thanks
        if (looksLikeFarewell(message)) {
          triggerReason = "farewell";
        }
        // Trigger B: conversation hit message threshold
        else if (fullConv.length >= FINAL_EMAIL_MESSAGE_COUNT_THRESHOLD) {
          triggerReason = "threshold";
        }

        if (triggerReason) {
          sendFinalTranscript(lead, fullConv, triggerReason).catch(err =>
            console.error("Final transcript failed:", err)
          );
          finalJustSent = true;
        }
      }
    }

    return NextResponse.json({
      reply,
      leadAlertSent: leadAlertSent || alertJustSent,
      finalTranscriptSent: finalTranscriptSent || finalJustSent,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}