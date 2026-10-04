import { Injectable } from "@nestjs/common";

@Injectable()
export class LaravelKnowledgeClient {
  async execute(agentId: string, tool: string, args: Record<string, unknown>): Promise<unknown> {
    const base = (process.env.LARAVEL_API_URL ?? "http://backend-nginx/api/v1").replace(/\/$/, "");
    const secret = String(process.env.AGENT_SHARED_SECRET ?? "").trim();

    const response = await fetch(`${base}/internal/agents/${encodeURIComponent(agentId)}/knowledge-tools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Shared-Secret": secret,
      },
      body: JSON.stringify({ tool, arguments: args }),
    });

    const json = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(String(json.message ?? `Herramienta de conocimiento respondió HTTP ${response.status}.`));
    }

    return json;
  }
}
