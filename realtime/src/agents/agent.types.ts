export type AgentDefinition = {
  id: string;
  name: string;
  role: string;
  prompt: string;
  memory: string;
  tools: string;
};

export type AgentSummary = Pick<AgentDefinition, "id" | "name" | "role">;

export type AgentConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentMessageInput = {
  message: string;
  requestId?: string;
  sessionId?: number;
  history?: AgentConversationMessage[];
};

export type AgentResponse = {
  requestId: string;
  agent: AgentSummary;
  message: string;
  status: "completed" | "configuration_required";
};
