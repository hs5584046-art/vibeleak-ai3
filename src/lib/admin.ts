import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export async function getAdminContext() {
  const auth = await createClient();
  const { data } = await auth.auth.getUser();
  const user = data.user;
  const email = user?.email?.toLowerCase();
  const allowed = env.ADMIN_EMAILS
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!user || !email || !allowed.includes(email)) return null;
  return { user, database: createAdminClient() };
}
