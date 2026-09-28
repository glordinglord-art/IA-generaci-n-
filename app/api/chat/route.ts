import { demoAnswer, systemInstruction } from "@/lib/chat/prompts";
import type { ConversationMessage, Language } from "@/lib/chat/types";

type ChatRequest = {
  message?: unknown;
  language?: unknown;
  history?: unknown;
  modelMode?: unknown;
};

type ModelMode = "auto" | "fast" | "deep";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function isLanguage(value: unknown): value is Language {
  return value === "es" || value === "en";
}

function isModelMode(value: unknown): value is ModelMode {
  return value === "auto" || value === "fast" || value === "deep";
}

function getModelCandidates(message: string, mode: ModelMode) {
  const fastModel = process.env.GEMINI_FAST_MODEL || "gemini-3.5-flash-lite";
  const deepModel = process.env.GEMINI_DEEP_MODEL || process.env.GEMINI_MODEL || "gemini-3.8-flash";

  if (mode === "fast") return [fastModel];
  if (mode === "deep") return [deepModel];

  const needsDeepModel = /compar|ranking|rank|país|países|country|countries|histori|history|actual|current|latest|dato|data|estadíst|statistic|investig|research/i.test(message);
  return needsDeepModel ? [deepModel, fastModel] : [fastModel, deepModel];
}

function getHistory(value: unknown): ConversationMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is { role: ConversationMessage["role"]; text: string } =>
        Boolean(item) &&
        typeof item === "object" &&
        "role" in item &&
        "text" in item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.text === "string",
    )
    .slice(-8)
    .map(({ role, text }) => ({ role, text: text.slice(0, 4000) }));
}

async function askGemini(
  message: string,
  language: Language,
  history: ConversationMessage[],
  apiKey: string,
  model: string,
) {
  const contents = [
    ...history.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction(language) }] },
        contents,
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 700,
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);

  const data = (await response.json()) as GeminiResponse;
  const answer = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!answer) throw new Error("Gemini returned an empty answer");
  return answer;
}

export async function POST(request: Request) {
  let body: ChatRequest;

  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const language = isLanguage(body.language) ? body.language : "es";
  const history = getHistory(body.history);

  if (!message || message.length > 2000) {
    return Response.json({ error: "Message must be between 1 and 2000 characters" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ answer: demoAnswer(message, language), source: "demo" });
  }

  const modelMode = isModelMode(body.modelMode) ? body.modelMode : "auto";
  const candidates = getModelCandidates(message, modelMode);
  let lastError: unknown;

  for (const model of candidates) {
    try {
      const answer = await askGemini(message, language, history, apiKey, model);
      return Response.json({ answer, source: "gemini", model });
    } catch (error) {
      lastError = error;
      console.error(`Equa Gemini adapter error on ${model}:`, error);
    }
  }

  console.error("Equa Gemini adapter exhausted model candidates:", lastError);
  return Response.json({ answer: demoAnswer(message, language), source: "demo" });
}
