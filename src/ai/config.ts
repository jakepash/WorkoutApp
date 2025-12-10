import type { AIModelConfig, AIProvider } from "./types";

export const DEFAULT_PROVIDER: AIProvider = "openai";

export const MODEL_PRESETS: Record<string, AIModelConfig> = {
  default: {
    provider: "openai",
    model: "gpt-4o-mini"
  },
  fast: {
    provider: "openai",
    model: "gpt-4o-mini"
  }
};

export function getModelConfig(preset: string = "default"): AIModelConfig {
  return MODEL_PRESETS[preset] ?? MODEL_PRESETS.default;
}
