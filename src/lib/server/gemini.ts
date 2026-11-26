/**
 * Minimal Gemini client used only on the server. The app works without a key:
 * every caller falls back to the local stylist and the local colour reader.
 *
 * Gemini models come and go and get overloaded, so every call goes through
 * `generate()`, which retries briefly on overload and otherwise moves on to
 * another Flash model this API key can use.
 */
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.8-flash';
const PER_ATTEMPT_MS = 12000;

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Why the last call failed, so the chat can say so instead of failing silently. */
export let lastGeminiError: string | null = null;

/** The model that answered last; later calls start there so a conversation stays on one model. */
let activeModel: string | null = null;
let discovered: { at: number; models: string[] } | null = null;
/** Models that just answered "overloaded" or hung, skipped until the time stored here. */
const cooling = new Map<string, number>();
const COOL_MS = 5 * 60 * 1000;
const cool = (model: string) => {
  cooling.set(model, Date.now() + COOL_MS);
  if (activeModel === model) activeModel = null;
};


/** Flash text models this key may call, newest first (cached for 30 minutes). */
async function availableModels(key: string): Promise<string[]> {
  if (discovered && Date.now() - discovered.at < 30 * 60 * 1000) return discovered.models;
  try {
    const res = await fetch(`${ENDPOINT}?pageSize=200`, { headers: { 'x-goog-api-key': key } });
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
    const models = (data.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''))
      .filter((n) => /flash/i.test(n) && !/(image|tts|audio|live|embedding|exp|preview-\d{2}-\d{2}|thinking)/i.test(n))
      // Newest version first; full Flash before Flash-Lite.
      .sort((a, b) => {
        const va = parseFloat(a.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] ?? '0');
        const vb = parseFloat(b.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] ?? '0');
        if (vb !== va) return vb - va;
        return Number(/lite/i.test(a)) - Number(/lite/i.test(b));
      });
    discovered = { at: Date.now(), models };
    console.info('[gemini] model Flash yang tersedia untuk key ini:', models.slice(0, 6).join(', ') || '(tidak ada)');
    return models;
  } catch {
    return [];
  }
}

/**
 * Order to try: the model that answered last, the configured one, then Flash-Lite
 * (lighter and rarely overloaded), then the other Flash models. Models that were
 * overloaded in the last few minutes go to the back.
 */
async function candidateModels(key: string): Promise<string[]> {
  const configured = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const found = await availableModels(key);
  const list: string[] = [];
  const add = (m: string | null | undefined) => {
    if (m && !list.includes(m)) list.push(m);
  };
  add(activeModel);
  add(configured);
  found.filter((m) => /lite/i.test(m)).forEach(add);
  found.forEach(add);
  const now = Date.now();
  const fresh = list.filter((m) => (cooling.get(m) ?? 0) < now);
  const cooled = list.filter((m) => (cooling.get(m) ?? 0) >= now);
  return [...fresh, ...cooled].slice(0, 4);
}

interface Candidate {
  content?: { parts?: Record<string, unknown>[] };
}

/** Result of one model attempt: answer parts, "next" to try another model, or "stop". */
type Attempt = Record<string, unknown>[] | 'next' | 'stop';

async function tryModel(key: string, model: string, body: object, ms: number): Promise<Attempt> {
  // One slow model must not eat the whole budget, so each attempt is capped.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (res.ok) {
      const data = (await res.json()) as { candidates?: Candidate[] };
      const parts = data.candidates?.[0]?.content?.parts;
      if (parts?.length) return parts;
      lastGeminiError = `Model ${model} mengembalikan jawaban kosong.`;
      return 'next';
    }
    lastGeminiError = `HTTP ${res.status} (${model}): ${(await res.text()).slice(0, 240)}`;
    console.warn('[gemini]', lastGeminiError);
    if (res.status === 429 || res.status === 500 || res.status === 503) {
      // Overload answers are slow already (often ~10 s): mark busy, move on.
      cool(model);
      return 'next';
    }
    if (res.status === 404) {
      if (activeModel === model) activeModel = null;
      return 'next';
    }
    return 'stop'; // bad key or bad request: another model will not help
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    lastGeminiError = aborted ? `HTTP 503 (${model}): tidak menjawab dalam ${Math.round(ms / 1000)} detik` : e instanceof Error ? e.message : String(e);
    console.warn('[gemini]', lastGeminiError);
    cool(model);
    return 'next';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST generateContent, moving through the candidate models until one answers
 * or the time budget runs out. Busy (429/5xx), slow, and missing (404) models
 * are skipped; a rejected key or request stops at once.
 */
async function generate(body: object, timeoutMs: number): Promise<Record<string, unknown>[] | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const started = Date.now();
  for (const model of await candidateModels(key)) {
    const left = timeoutMs - (Date.now() - started);
    if (left < 3000) return null;
    const result = await tryModel(key, model, body, Math.min(left, PER_ATTEMPT_MS));
    if (result === 'stop') return null;
    if (result === 'next') continue;
    if (activeModel !== model) console.info('[gemini] memakai model', model);
    activeModel = model;
    lastGeminiError = null;
    return result;
  }
  return null;
}

/* ---------- Plain generation (photo reader) ---------- */

interface Part {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

export async function geminiGenerate(opts: {
  system: string;
  parts: Part[];
  history?: { role: 'user' | 'model'; text: string }[];
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string | null> {
  const parts = await generate(
    {
      system_instruction: { parts: [{ text: opts.system }] },
      contents: [...(opts.history ?? []).map((h) => ({ role: h.role, parts: [{ text: h.text }] })), { role: 'user', parts: opts.parts }],
      generationConfig: {
        temperature: opts.temperature ?? 0.6,
        maxOutputTokens: opts.maxOutputTokens ?? 2048,
        ...(opts.json ? { responseMimeType: 'application/json' } : {}),
      },
    },
    20000,
  );
  const text = parts?.filter((p) => p.thought !== true).map((p) => (typeof p.text === 'string' ? p.text : '')).join('') ?? '';
  return text.trim() || null;
}

/* ---------- Function calling ---------- */

export interface GeminiContent {
  role: 'user' | 'model';
  parts: Record<string, unknown>[];
}

/**
 * One model turn with tools. Returns the model's content exactly as sent (it
 * may carry thought signatures that must be echoed back), or null on failure.
 */
export async function geminiToolTurn(opts: {
  system: string;
  contents: GeminiContent[];
  tools: object[];
  temperature?: number;
}): Promise<GeminiContent | null> {
  const parts = await generate(
    {
      system_instruction: { parts: [{ text: opts.system }] },
      contents: opts.contents,
      tools: [{ functionDeclarations: opts.tools }],
      toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
      generationConfig: { temperature: opts.temperature ?? 0.4, maxOutputTokens: 8192 },
    },
    45000,
  );
  return parts ? { role: 'model', parts } : null;
}
