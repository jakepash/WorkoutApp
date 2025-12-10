export type AIProvider = "openai" | "anthropic" | "custom";

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  purpose: string;
  messages: AIMessage[];
  model?: string;
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  parsedJson?: unknown;
  raw?: unknown;
}
