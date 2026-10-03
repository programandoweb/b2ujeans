import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import type { AgentDefinition, AgentSummary } from "./agent.types";

@Injectable()
export class AgentRegistryService implements OnModuleInit {
  private readonly logger = new Logger(AgentRegistryService.name);
  private readonly agents = new Map<string, AgentDefinition>();

  async onModuleInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.agents.clear();
    const root = resolve(process.cwd(), process.env.AGENTS_PATH ?? "agents");
    const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const id = entry.name.toLowerCase();
      const dir = join(root, entry.name);
      const [prompt, memory, tools] = await Promise.all([
        fs.readFile(join(dir, "Agent.md"), "utf8"),
        fs.readFile(join(dir, "Memory.md"), "utf8").catch(() => ""),
        fs.readFile(join(dir, "Tools.md"), "utf8").catch(() => ""),
      ]);

      const name = prompt.match(/^#\s+([^\n]+)/m)?.[1]?.trim() ?? entry.name;
      const role = prompt.match(/^##\s+Rol\s*\n+([^\n]+)/mi)?.[1]?.trim() ?? "Agente Gaspronal";

      this.agents.set(id, { id, name, role, prompt, memory, tools });
    }

    this.logger.log("Agentes Gaspronal cargados: " + [...this.agents.keys()].join(", "));
  }

  get(id: string): AgentDefinition | undefined {
    return this.agents.get(id.toLowerCase());
  }

  list(): AgentSummary[] {
    return [...this.agents.values()].map(({ id, name, role }) => ({ id, name, role }));
  }
}
