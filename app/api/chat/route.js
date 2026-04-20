import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message, businessInfo } = await request.json();

    const systemPrompt = businessInfo
      ? `You are the AI chat assistant for ${businessInfo.name}. ${businessInfo.prompt || ""}
      
BUSINESS INFO:
${businessInfo.details || "No details provided."}

RULES:
1. Be friendly and conversational. Keep responses short (2-3 sentences max).
2. NEVER make up information not provided above.
3. Always try to collect: name, phone number, and what service they need.
4. For emergencies, give the phone number immediately.
5. Never give medical advice or diagnose problems.
6. NEVER use markdown formatting like **, ##, or bullet symbols. NEVER use emojis. Write in plain text only.
7. When a customer wants to book an appointment, give them this link: https://cal.com/rhiana-maley-zd0c7u/service-appointment and tell them to pick a time that works for them.`
      :`You are the AI assistant for TEDZ Integrative Systems, an AI chat and lead capture platform for small businesses. Keep responses to 2-3 sentences max. Be professional and conversational but not overly friendly. NEVER use markdown formatting. NEVER use emojis. Ask what type of business they run so you can tailor your answer. Try to collect their name, email, and business type.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.content[0].text;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}