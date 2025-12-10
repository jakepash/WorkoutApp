import type { AIRequest, AIResponse } from "./types";
import { getModelConfig } from "./config";

const AI_API_URL = "/api/ai";

async function postAI(request: AIRequest): Promise<AIResponse> {
  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  return response.json();
}

export async function generateJson<T>(options: {
  purpose: string;
  systemPrompt?: string;
  userPrompt: string;
  preset?: string;
}): Promise<{ data: T; raw: AIResponse }> {
  const { purpose, systemPrompt, userPrompt, preset } = options;

  const jsonSystemHint = "Respond ONLY with valid JSON. Do not include any explanation or markdown.";

  const messages = [];
  messages.push({ role: "system", content: jsonSystemHint } as const);
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt } as const);
  }
  messages.push({ role: "user", content: userPrompt } as const);

  const modelConfig = getModelConfig(preset);

  const request: AIRequest = {
    purpose,
    messages,
    provider: modelConfig.provider,
    model: modelConfig.model
  };

  const response = await postAI(request);

  let parsed: T;
  try {
    parsed = JSON.parse(response.content) as T;
  } catch (err) {
    console.error("Failed to parse AI JSON:", err, response.content);
    throw new Error("AI returned invalid JSON");
  }

  return { data: parsed, raw: response };
}
