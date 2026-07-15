import { NextResponse, type NextRequest } from "next/server";
import { getAdminContext } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const { data, error } = await context.database.from("growth_items").select("id,channel,title,objective,target_url,content,metadata,status,priority,scheduled_for,created_at,updated_at").eq("scheduled_for", date).order("priority", { ascending: false });
  if (error) return NextResponse.json({ error: "Growth plan could not be loaded. Run the latest Supabase schema." }, { status: 500 });
  return NextResponse.json({ items:data??[], date }, { headers:{"Cache-Control":"no-store, max-age=0"} });
}

export async function POST() { return NextResponse.json({ error: "Manual plan generation is disabled. The autonomous cron owns execution." }, { status: 405 }); }
export async function PATCH() { return NextResponse.json({ error: "Manual status changes are disabled. Status is written only by the autonomous pipeline." }, { status: 405 }); }
