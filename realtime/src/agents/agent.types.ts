export type AgentDefinition = {
  id: string;
  name: string;
  role: string;
  prompt: string;
  memory: string;
  tools: string;
};

export type AgentSummary = Pick<AgentDefinition, "id" | "name" | "role">;

export type AgentMessageInput = {
  message: string;
  requestId?: string;
};

export type AgentResponse = {
  requestId: string;
  agent: AgentSummary;
  message: string;
  status: "completed" | "configuration_required";
};
