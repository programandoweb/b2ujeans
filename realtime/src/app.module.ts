import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AgentController } from "./agents/agent.controller";
import { AgentGateway } from "./agents/agent.gateway";
import { AgentRegistryService } from "./agents/agent-registry.service";
import { AgentRuntimeService } from "./agents/agent-runtime.service";
import { HealthController } from "./health.controller";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, AgentController],
  providers: [AgentGateway, AgentRegistryService, AgentRuntimeService],
})
export class AppModule {}
