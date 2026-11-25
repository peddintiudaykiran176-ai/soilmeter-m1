import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { sql } from "@/app/lib/db";

export default async function ContinueAfterSignInPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [deviceStatus] = await sql`
    SELECT EXISTS (
      SELECT 1
      FROM devices
      WHERE user_id = ${session.user.id}::uuid
    ) AS has_devices
  `;

  redirect(deviceStatus?.has_devices ? "/dashboard" : "/devices/new");
}
