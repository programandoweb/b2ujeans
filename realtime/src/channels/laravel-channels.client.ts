import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ChannelProvider } from "./channel.types";

@Injectable()
export class LaravelChannelsClient {
  private readonly baseUrl: string;
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>("LARAVEL_API_URL", "http://backend-nginx/api/v1").replace(/\/$/, "");
    this.secret = config.get<string>("AGENT_SHARED_SECRET", "");
  }

  async providers(): Promise<ChannelProvider[]> {
    const payload = await this.request<{data: ChannelProvider[]}>("/internal/communications/providers");
    return payload.data ?? [];
  }

  async log(payload: Record<string, unknown>): Promise<void> {
    await this.request("/internal/communications/outbound-log", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  private async request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.secret) throw new InternalServerErrorException("AGENT_SHARED_SECRET no configurado.");

    const response = await fetch(this.baseUrl + path, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Agent-Shared-Secret": this.secret,
        ...(init.headers ?? {}),
      },
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new InternalServerErrorException(
        (json as {message?: string}).message ?? `Laravel respondió ${response.status}.`,
      );
    }

    return json as T;
  }
}
