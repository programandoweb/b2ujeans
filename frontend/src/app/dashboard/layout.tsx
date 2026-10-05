import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { backendFetch } from "@/lib/backend";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("gaspronal_access_token")?.value;
  const impersonatorToken = cookieStore.get("gaspronal_impersonator_token")?.value;

  if (!token) redirect("/login");

  const response = await backendFetch("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) redirect("/login");

  const { data: user } = await response.json();

  return (
    <DashboardShell impersonating={Boolean(impersonatorToken)} user={{ name: user.name, email: user.email, roles: user.roles ?? [], permissions: user.permissions ?? [] }}>
      {children}
    </DashboardShell>
  );
}
