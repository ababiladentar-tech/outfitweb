/**
 * Minimal Gemini client used only on the server. The app works without a key:
 * every caller falls back to the local stylist and the local colour reader.
 */
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface Part {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

export async function geminiGenerate(opts: {
  system: string;
  parts: Part[];
  history?: { role: 'user' | 'model'; text: string }[];
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const contents = [
    ...(opts.history ?? []).map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: 'user', parts: opts.parts },
  ];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: opts.system }] },
        contents,
        generationConfig: {
          temperature: opts.temperature ?? 0.6,
          maxOutputTokens: opts.maxOutputTokens ?? 900,
          ...(opts.json ? { responseMimeType: 'application/json' } : {}),
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    return text.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
