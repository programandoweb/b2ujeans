import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AgentRegistryService } from "./agent-registry.service";
import { GeminiService } from "./gemini.service";
import { LaravelAgentSettingsClient } from "./laravel-agent-settings.client";
import type { AgentMessageInput, AgentResponse } from "./agent.types";

@Injectable()
export class AgentRuntimeService {
  constructor(
    private readonly registry: AgentRegistryService,
    private readonly settings: LaravelAgentSettingsClient,
    private readonly gemini: GeminiService,
  ) {}

  async execute(agentId: string, input: AgentMessageInput): Promise<AgentResponse> {
    const agent = this.registry.get(agentId);
    if (!agent) throw new NotFoundException("Agente no encontrado.");

    const message = String(input?.message ?? "").trim();
    if (!message) throw new Error("El mensaje es obligatorio.");

    const requestId = input.requestId?.trim() || randomUUID();
    const credentials = await this.settings.credentials(agent.id);

    if (!credentials.api_key) {
      return {
        requestId,
        agent: { id: agent.id, name: agent.name, role: agent.role },
        message: `${agent.name} todavía no tiene una API key de Gemini configurada. Guárdala en la configuración del agente para comenzar a conversar.`,
        status: "configuration_required",
      };
    }

    const system = [
      agent.prompt,
      agent.memory ? "\n## Memoria\n" + agent.memory : "",
      agent.tools ? "\n## Herramientas\n" + agent.tools : "",
      "\nResponde siempre en español salvo que el usuario solicite otro idioma.",
    ].join("\n").trim();

    const answer = await this.gemini.generate({
      apiKey: credentials.api_key,
      model: credentials.model,
      system,
      message,
    });

    return {
      requestId,
      agent: { id: agent.id, name: agent.name, role: agent.role },
      message: answer,
      status: "completed",
    };
  }
}
