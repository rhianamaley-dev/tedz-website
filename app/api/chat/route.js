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
5. Never give medical advice or diagnose problems.`
      : `You are the AI assistant for TEDZ Integrative Systems. You help business owners understand how our AI chat and lead capture service works. Be friendly, helpful, and keep responses short. NEVER use markdown formatting like #, ##, **, or bullet points with emojis. Write in plain conversational text only. No headers, no bold markers, no lists with symbols.`;

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