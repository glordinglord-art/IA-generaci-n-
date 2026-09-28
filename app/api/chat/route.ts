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
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function isLanguage(value: unknown): value is Language {
  return value === "es" || value === "en";
}

function isModelMode(value: unknown): value is ModelMode {
  return value === "auto" || value === "fast" || value === "deep";
}

function getModelCandidates(mode: ModelMode) {
  const fastModel = "gemini-3.5-flash-lite";
  const deepModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const reliableFallback = "gemini-3.1-flash-lite";

  if (mode === "fast") return [fastModel, "gemini-3.1-flash-lite"];
  if (mode === "deep") return [deepModel, fastModel, reliableFallback];

  return [deepModel, fastModel, reliableFallback];
}

function needsDetailedAnswer(message: string) {
  return message.length > 45 || /histori|hito|país|países|country|countries|compar|ranking|brecha|desigual|estadíst|statistic|explica|explain|profund|deep|cuánt|how long/i.test(message);
}

function cleanAnswer(answer: string) {
  return answer
    .replace(/^\s*(?:output\s*\)?\s*:\s*\*\*|produce\s+the\s+formatted\s+(?:spanish|english)\s+response\.?\s*)/i, "")
    .trim();
}

function isUsableAnswer(answer: string, message: string, finishReason?: string) {
  const hasInternalLeak = /output\s*\)?\s*:\s*\*\*|produce\s+the\s+formatted|system\s+instruction|internal\s+prompt/i.test(answer);
  const minimumLength = needsDetailedAnswer(message) ? 300 : 100;
  const endsCleanly = /[.!?…:)\]»”"]$/.test(answer);
  const hasUnexpectedFinish = Boolean(finishReason && finishReason !== "STOP");
  return !hasInternalLeak && answer.length >= minimumLength && endsCleanly && !hasUnexpectedFinish;
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
      signal: AbortSignal.timeout(7000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction(language) }] },
        contents,
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 1400,
        },
      }),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);

  const data = (await response.json()) as GeminiResponse;
  const candidate = data.candidates?.[0];
  const answer = candidate?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!answer) throw new Error("Gemini returned an empty answer");
  const cleanedAnswer = cleanAnswer(answer);
  if (!isUsableAnswer(cleanedAnswer, message, candidate?.finishReason)) throw new Error(`Gemini returned an incomplete answer from ${model}`);
  return cleanedAnswer;
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
  const candidates = getModelCandidates(modelMode);
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
