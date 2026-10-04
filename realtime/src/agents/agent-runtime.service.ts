import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AgentRegistryService } from "./agent-registry.service";
import { GeminiService, type GeminiContent, type GeminiFunctionDeclaration } from "./gemini.service";
import { LaravelAgentSettingsClient } from "./laravel-agent-settings.client";
import { LaravelCommercialClient } from "./laravel-commercial.client";
import type { AgentMessageInput, AgentResponse } from "./agent.types";

const CLAUDIO_FUNCTIONS: GeminiFunctionDeclaration[] = [
  {
    name: "catalog_search",
    description: "Busca productos o servicios publicados con precio comercial privado. Úsala antes de hablar de precios.",
    parameters: {
      type: "OBJECT",
      properties: { query: { type: "STRING", description: "Nombre, referencia o necesidad del cliente." } },
    },
  },
  {
    name: "create_quote",
    description: "Crea una propuesta comercial en borrador para revisión y aprobación de un administrador. Requiere nombre, email y WhatsApp.",
    parameters: {
      type: "OBJECT",
      required: ["name", "email", "whatsapp", "items"],
      properties: {
        name: { type: "STRING" },
        email: { type: "STRING" },
        whatsapp: { type: "STRING" },
        notes: { type: "STRING" },
        items: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["catalog_item_id", "quantity"],
            properties: {
              catalog_item_id: { type: "INTEGER" },
              quantity: { type: "NUMBER" },
            },
          },
        },
      },
    },
  },
  {
    name: "create_appointment",
    description: "Agenda una cita comercial asociada a un cliente. Requiere nombre, email y WhatsApp.",
    parameters: {
      type: "OBJECT",
      required: ["name", "email", "whatsapp", "scheduled_at"],
      properties: {
        name: { type: "STRING" },
        email: { type: "STRING" },
        whatsapp: { type: "STRING" },
        scheduled_at: { type: "STRING", description: "Fecha ISO 8601." },
        channel: { type: "STRING" },
        notes: { type: "STRING" },
      },
    },
  },
  {
    name: "handoff_to_human",
    description: "Deja el cliente listo para seguimiento humano cuando corresponde.",
    parameters: {
      type: "OBJECT",
      required: ["name", "email", "whatsapp"],
      properties: {
        name: { type: "STRING" },
        email: { type: "STRING" },
        whatsapp: { type: "STRING" },
        notes: { type: "STRING" },
      },
    },
  },
];

@Injectable()
export class AgentRuntimeService {
  constructor(
    private readonly registry: AgentRegistryService,
    private readonly settings: LaravelAgentSettingsClient,
    private readonly gemini: GeminiService,
    private readonly commercial: LaravelCommercialClient,
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

    if (agent.id !== "claudio") {
      const answer = await this.gemini.generate({
        apiKey: credentials.api_key,
        model: credentials.model,
        system,
        message,
      });
      return this.response(requestId, agent, answer);
    }

    const contents: GeminiContent[] = [
      ...(input.history ?? []).slice(-20).map(item => ({
        role: item.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: item.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    for (let attempt = 0; attempt < 6; attempt++) {
      const turn = await this.gemini.generateTurn({
        apiKey: credentials.api_key,
        model: credentials.model,
        system,
        contents,
        functions: CLAUDIO_FUNCTIONS,
      });

      contents.push(turn.content);

      if (turn.type === "text") {
        return this.response(requestId, agent, turn.text);
      }

      const result = await this.commercial.execute(agent.id, turn.name, turn.args);
      contents.push({
        role: "function",
        parts: [{ functionResponse: { name: turn.name, response: result } }],
      });
    }

    throw new Error("Claudio excedió el límite de operaciones de herramienta para este mensaje.");
  }

  private response(requestId: string, agent: { id: string; name: string; role: string }, message: string): AgentResponse {
    return {
      requestId,
      agent: { id: agent.id, name: agent.name, role: agent.role },
      message,
      status: "completed",
    };
  }
}
