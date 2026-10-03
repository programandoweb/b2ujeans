import { Injectable } from "@nestjs/common";

@Injectable()
export class GeminiService {
  async generate(input: { apiKey: string; model: string; system: string; message: string }): Promise<string> {
    const model = encodeURIComponent(input.model || "gemini-2.5-flash");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": input.apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: input.system }] },
        contents: [{ role: "user", parts: [{ text: input.message }] }],
      }),
    });

    const json = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(json.error?.message ?? `Gemini respondió HTTP ${response.status}.`);
    }

    const text = json.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("").trim();
    if (!text) throw new Error("Gemini respondió sin contenido.");

    return text;
  }
}
