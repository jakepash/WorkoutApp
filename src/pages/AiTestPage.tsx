import React, { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { generateText } from "../ai/aiClient";

const AiTestPage: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await generateText({
        purpose: "test",
        systemPrompt: "You are a helpful AI fitness coach.",
        userPrompt: input || "Say hello and confirm AI plumbing works.",
        preset: "default"
      });
      setOutput(res.content);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <h1 className="text-xl font-semibold text-ink">AI Test</h1>
        <p className="text-sm text-slate-600">
          Send a quick prompt to /api/ai via the frontend client. Requires OPENAI_API_KEY configured on the server.
        </p>
        <textarea
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          rows={4}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask the AI something..."
        />
        <div className="flex gap-2">
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Thinking..." : "Send to AI"}
          </Button>
        </div>
        {error && <div className="text-sm font-semibold text-rose-600">{error}</div>}
        {output && (
          <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-800">{output}</div>
        )}
      </Card>
    </div>
  );
};

export default AiTestPage;
