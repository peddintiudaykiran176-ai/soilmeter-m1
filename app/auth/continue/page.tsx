import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { sql } from "@/app/lib/db";
import { Loading } from "@/components/shared/loading";

export default function ContinueAfterSignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
          <Loading label="Finishing sign in..." />
        </main>
      }
    >
      <ContinueAfterSignIn />
    </Suspense>
  );
}

async function ContinueAfterSignIn() {
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

  return redirect(deviceStatus?.has_devices ? "/dashboard" : "/devices/new");
}
