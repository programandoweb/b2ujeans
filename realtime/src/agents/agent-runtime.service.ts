import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AgentRegistryService } from "./agent-registry.service";
import type { AgentMessageInput, AgentResponse } from "./agent.types";

@Injectable()
export class AgentRuntimeService {
  constructor(private readonly registry: AgentRegistryService) {}

  execute(agentId: string, input: AgentMessageInput): AgentResponse {
    const agent = this.registry.get(agentId);
    if (!agent) throw new NotFoundException("Agente no encontrado.");

    const message = String(input?.message ?? "").trim();
    if (!message) throw new Error("El mensaje es obligatorio.");

    return {
      requestId: input.requestId?.trim() || randomUUID(),
      agent: { id: agent.id, name: agent.name, role: agent.role },
      message: `${agent.name} está creado y disponible, pero todavía no tiene responsabilidades asignadas. Mensaje recibido: ${message}`,
      status: "placeholder",
    };
  }
}
