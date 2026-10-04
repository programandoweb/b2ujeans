import { Injectable } from "@nestjs/common";

export type GeminiFunctionDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type GeminiContent = {
  role: "user" | "model";
  parts: Array<Record<string, unknown>>;
};

export type GeminiTurn =
  | { type: "text"; text: string; content: GeminiContent }
  | { type: "function_call"; name: string; args: Record<string, unknown>; content: GeminiContent };

@Injectable()
export class GeminiService {
  async generate(input: { apiKey: string; model: string; system: string; message: string }): Promise<string> {
    const turn = await this.generateTurn({
      apiKey: input.apiKey,
      model: input.model,
      system: input.system,
      contents: [{ role: "user", parts: [{ text: input.message }] }],
    });

    if (turn.type !== "text") throw new Error("Gemini solicitó una herramienta no disponible.");
    return turn.text;
  }

  async generateTurn(input: {
    apiKey: string;
    model: string;
    system: string;
    contents: GeminiContent[];
    functions?: GeminiFunctionDeclaration[];
    googleSearch?: boolean;
  }): Promise<GeminiTurn> {
    const model = encodeURIComponent(input.model || "gemini-2.5-flash");
    const body: Record<string, unknown> = {
      system_instruction: { parts: [{ text: input.system }] },
      contents: input.contents,
    };

    const tools: Record<string, unknown>[] = [];
    if (input.googleSearch) tools.push({ google_search: {} });
    if (input.functions?.length) tools.push({ functionDeclarations: input.functions });
    if (tools.length) body.tools = tools;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": input.apiKey,
      },
      body: JSON.stringify(body),
    });

    const json = await response.json() as {
      candidates?: Array<{ content?: GeminiContent }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(json.error?.message ?? `Gemini respondió HTTP ${response.status}.`);
    }

    const content = json.candidates?.[0]?.content;
    if (!content) throw new Error("Gemini respondió sin contenido.");

    for (const part of content.parts ?? []) {
      const call = part.functionCall as { name?: string; args?: Record<string, unknown> } | undefined;
      if (call?.name) {
        return { type: "function_call", name: call.name, args: call.args ?? {}, content };
      }
    }

    const text = (content.parts ?? [])
      .map(part => typeof part.text === "string" ? part.text : "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini respondió sin texto.");
    return { type: "text", text, content };
  }
}
