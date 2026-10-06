export type Channel = "whatsapp" | "email";
export type ChannelDriver = "baileys" | "smtp" | "whatsapp_link";
export type ChannelRuntimeStatus =
  | "disconnected"
  | "connecting"
  | "qr_pending"
  | "connected"
  | "ready"
  | "error";

export type ChannelProvider = {
  id: string;
  name: string;
  channel: Channel;
  driver: ChannelDriver;
  is_fallback: boolean;
  priority: number;
  auto_connect: boolean;
  enabled: boolean;
  settings: Record<string, unknown>;
  credentials: Record<string, unknown>;
};

export type ChannelProviderView = Omit<ChannelProvider, "credentials"> & {
  has_credentials: boolean;
  runtime_status: ChannelRuntimeStatus;
  phone_number?: string;
  display_name?: string;
  qr_data_url?: string;
  last_error?: string;
};

export type ChannelMessage = {
  recipient: string;
  text: string;
  subject?: string;
};
