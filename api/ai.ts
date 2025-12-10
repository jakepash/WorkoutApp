import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import type { AIRequest, AIResponse } from "../src/ai/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function callOpenAI(req: AIRequest): Promise<AIResponse> {
  const model = req.model || "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    messages: req.messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    temperature: req.temperature ?? 0.7,
    max_tokens: req.maxTokens ?? 800
  });

  const content = completion.choices[0]?.message?.content ?? "";

  return {
    content,
    raw: completion
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const aiRequest = req.body as AIRequest;
    const provider = aiRequest.provider ?? "openai";

    let result: AIResponse;

    switch (provider) {
      case "openai":
        result = await callOpenAI(aiRequest);
        break;
      default:
        res.status(400).json({ error: `Unsupported provider: ${provider}` });
        return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("AI API error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
}
