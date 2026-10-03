export type ApiMessage = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

async function postAuth(path: string, payload: Record<string, string>): Promise<ApiMessage> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as ApiMessage;

  if (!response.ok) {
    const fieldMessage = Object.values(data.errors ?? {}).flat()[0];
    throw new Error(fieldMessage ?? data.message ?? "No fue posible procesar la solicitud. Inténtalo nuevamente.");
  }

  return data;
}

export function forgotPassword(email: string) {
  return postAuth("/api/auth/forgot-password", { email });
}

export function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return postAuth("/api/auth/reset-password", payload);
}
