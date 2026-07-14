import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export type AdminAccessState =
  | { status: "signed_out" }
  | { status: "not_allowed"; email: string }
  | {
      status: "allowed";
      user: { id: string; email: string };
      database: ReturnType<typeof createAdminClient>;
    };

export async function getAdminAccessState(): Promise<AdminAccessState> {
  const auth = await createClient();
  const { data } = await auth.auth.getUser();
  const user = data.user;

  if (!user?.email) return { status: "signed_out" };

  const email = user.email.toLowerCase();
  const allowed = env.ADMIN_EMAILS
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(email)) return { status: "not_allowed", email };

  return {
    status: "allowed",
    user: { id: user.id, email },
    database: createAdminClient()
  };
}

export async function getAdminContext() {
  const state = await getAdminAccessState();
  return state.status === "allowed" ? state : null;
}
