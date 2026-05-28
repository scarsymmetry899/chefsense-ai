const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

type OpenAITextPart = {
  type: 'text';
  text: string;
};

type OpenAIImagePart = {
  type: 'image_url';
  image_url: {
    url: string;
  };
};

export type OpenAIMessage = {
  role: 'system' | 'user';
  content: string | Array<OpenAITextPart | OpenAIImagePart>;
};

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function normalizeImageInput(imageBase64?: string, imageUrl?: string) {
  if (imageUrl?.trim()) return imageUrl.trim();
  if (!imageBase64?.trim()) return null;

  const trimmed = imageBase64.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;
  return `data:image/jpeg;base64,${trimmed}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function callOpenAIJson<T>({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.3,
}: {
  messages: OpenAIMessage[];
  model?: string;
  temperature?: number;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      ok: false as const,
      error: 'missing_api_key',
    };
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: 'json_object' },
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        ok: false as const,
        error: `openai_http_${response.status}`,
        details: text,
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
        };
      }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return {
        ok: false as const,
        error: 'empty_model_response',
      };
    }

    const data = parseJsonObject<T>(content);
    if (!data) {
      return {
        ok: false as const,
        error: 'invalid_json_response',
        details: content,
      };
    }

    return {
      ok: true as const,
      data,
    };
  } catch (error) {
    return {
      ok: false as const,
      error: 'openai_fetch_failed',
      details: error instanceof Error ? error.message : 'Unknown fetch failure',
    };
  }
}

function parseJsonObject<T>(content: string) {
  const trimmed = content.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
    if (fenced) {
      try {
        return JSON.parse(fenced) as T;
      } catch {
        return null;
      }
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
      } catch {
        return null;
      }
    }

    return null;
  }
}
