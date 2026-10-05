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

      const baseUrl = provider.base_url.replace(/\/$/, "");
      const modelIdentifier = input.model.model_identifier === "__auto__"
        ? await this.resolveAutomaticModel(baseUrl, headers, controller.signal)
        : input.model.model_identifier;

      const response = await fetch(
        `${baseUrl}/chat/completions`,
        {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: modelIdentifier,
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

  private async resolveAutomaticModel(
    baseUrl: string,
    headers: Record<string, string>,
    signal: AbortSignal,
  ): Promise<string> {
    const response = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers,
      signal,
    });

    const json = await response.json() as unknown;

    if (!response.ok) {
      throw new Error(`No fue posible consultar los modelos del proveedor (HTTP ${response.status}).`);
    }

    const identifiers = this.extractModelIdentifiers(json);
    const model = identifiers[0];

    if (!model) {
      throw new Error("LM Studio no reportó ningún modelo cargado en /models.");
    }

    return model;
  }

  private extractModelIdentifiers(payload: unknown): string[] {
    const candidates: unknown[] = [];

    if (Array.isArray(payload)) {
      candidates.push(...payload);
    } else if (payload && typeof payload === "object") {
      const object = payload as Record<string, unknown>;

      if (Array.isArray(object.data)) candidates.push(...object.data);
      if (Array.isArray(object.models)) candidates.push(...object.models);
    }

    return candidates
      .map(item => {
        if (typeof item === "string") return item.trim();
        if (!item || typeof item !== "object") return "";

        const object = item as Record<string, unknown>;
        const value = object.id ?? object.model ?? object.name;
        return typeof value === "string" ? value.trim() : "";
      })
      .filter((value, index, all) => value !== "" && all.indexOf(value) === index);
  }
}
