import type { AIMessage, AIRequest, AIResponse } from "./types";
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

export async function generateText(options: {
  purpose: string;
  systemPrompt?: string;
  userPrompt: string;
  preset?: string;
}): Promise<AIResponse> {
  const { purpose, systemPrompt, userPrompt, preset } = options;

  const messages: AIMessage[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userPrompt });

  const modelConfig = getModelConfig(preset);

  const request: AIRequest = {
    purpose,
    messages,
    provider: modelConfig.provider,
    model: modelConfig.model
  };

  return postAI(request);
}
