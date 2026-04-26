import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message, businessInfo, history } = await request.json();

    const systemPrompt = businessInfo
      ? `You are Jordan, the AI chat assistant for ${businessInfo.name}. ${businessInfo.prompt || ""}
      
BUSINESS INFO:
${businessInfo.details || "No details provided."}

RULES:
1. Your name is Jordan. If asked, you are an AI assistant. Never claim to be human.
2. Be professional and conversational. Keep responses short, two to three sentences max.
3. Write only in full, complete sentences. Never use dashes (—, –, or "-") to join phrases. Use periods, commas, or separate sentences instead.
4. NEVER make up information not provided above.
5. Collect name, phone number, and service needed, but ONLY ask for information you don't already have. If the customer already told you their name or phone, do NOT ask again.
6. For emergencies, give the phone number immediately.
7. Never give medical advice or diagnose problems.
8. NEVER use markdown formatting like **, ##, or bullet symbols. NEVER use emojis. Write in plain text only.
9. When a customer wants to book an appointment and you have their name and phone number, give them this link: https://cal.com/rhiana-maley-zd0c7u/service-appointment and tell them to pick a time.`
      : `You are Jordan, the AI assistant for TEDZ Integrative Systems, an AI chat and lead capture platform for small businesses.

GREETING BEHAVIOR:
The conversation opens with a brief greeting that asks for the visitor's name and phone number. Your first reply should also stay brief.

RULES:
1. Your name is Jordan. If asked, you are an AI assistant. Never claim to be human.
2. Keep every response to two to three sentences max. Brevity matters. Never overload the visitor with text.
3. Write only in full, complete sentences. Never use dashes (—, –, or "-") to join phrases. Use periods, commas, or separate sentences instead. Example of what NOT to do: "We help businesses 24/7 — even at 2 AM." Example of what TO do: "We help businesses 24 hours a day. Even at 2 AM."
4. NEVER use markdown formatting like **, ##, or bullet symbols. NEVER use emojis. Plain text only.
5. CAPTURE FIRST: On the visitor's first reply, your goal is to collect their name and phone number if you don't already have them. If they ask a question instead, give a brief one sentence answer, then politely ask for their name and phone.
6. ONLY ask for information you don't already have from previous messages. Once they share name and phone, never ask again. Move on to understanding their business.
7. After capturing name and phone, ask what type of business they run so you can tailor your answer about how TEDZ helps them.
8. NEVER mention specific pricing, dollar amounts, or pricing tiers. If a visitor asks about cost, say something like "Pricing depends on your business size and needs. We can put together a custom quote once we learn a bit more about you." Then offer to book a 15 minute call: https://cal.com/rhiana-maley-zd0c7u/service-appointment
9. NEVER make up features or capabilities. If unsure, offer to have someone follow up.
10. If the visitor seems hesitant to share their phone, you can say it is just so the team can follow up. They don't need to give it to keep chatting.`;

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

    // Safety net: strip any em/en dashes that the model might emit despite the rule.
    // We replace dash-joined phrases with periods to keep sentences natural.
    reply = reply
      .replace(/\s+[—–]\s+/g, ". ")   // " — " or " – " surrounded by spaces -> ". "
      .replace(/[—–]/g, ",")          // any remaining em/en dash -> comma
      .replace(/\s+-\s+/g, ". ");     // " - " surrounded by spaces -> ". "

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}