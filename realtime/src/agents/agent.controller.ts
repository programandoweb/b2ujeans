import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from "@nestjs/common";
import { AgentRegistryService } from "./agent-registry.service";
import { AgentRuntimeService } from "./agent-runtime.service";
import type { AgentMessageInput } from "./agent.types";

@Controller("api/agents")
export class AgentController {
  constructor(
    private readonly registry: AgentRegistryService,
    private readonly runtime: AgentRuntimeService,
  ) {}

  @Get()
  list(@Headers("authorization") authorization?: string) {
    this.authorize(authorization);
    return { data: this.registry.list() };
  }

  @Post(":id/messages")
  async message(
    @Param("id") id: string,
    @Body() payload: AgentMessageInput,
    @Headers("authorization") authorization?: string,
  ) {
    this.authorize(authorization);
    return { data: await this.runtime.execute(id, payload) };
  }

  private authorize(authorization?: string): void {
    const secret = process.env.AGENT_SHARED_SECRET?.trim();
    if (!secret) return;

    if (authorization !== `Bearer ${secret}`) {
      throw new UnauthorizedException("No autorizado.");
    }
  }
}
