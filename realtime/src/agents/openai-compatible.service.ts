import { Injectable } from "@nestjs/common";
import type { RuntimeAiModel } from "./laravel-agent-settings.client";

@Injectable()
export class OpenAiCompatibleService {
  async generate(input: { model: RuntimeAiModel; system: string; message: string }): Promise<string> {
    const provider = input.model.provider;
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Math.max(1, provider.timeout_seconds || 30) * 1000,
    );

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (provider.api_key) {
        headers.Authorization = `Bearer ${provider.api_key}`;
      }

      const response = await fetch(
        `${provider.base_url.replace(/\/$/, "")}/chat/completions`,
        {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: input.model.model_identifier,
            messages: [
              { role: "system", content: input.system },
              { role: "user", content: input.message },
            ],
            stream: false,
          }),
        },
      );

      const json = await response.json() as {
        choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(json.error?.message ?? `Proveedor respondió HTTP ${response.status}.`);
      }

      const content = json.choices?.[0]?.message?.content;
      const text = Array.isArray(content)
        ? content.map(part => part?.text ?? "").join("").trim()
        : String(content ?? "").trim();

      if (!text) throw new Error("El proveedor respondió sin contenido.");
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }
}
