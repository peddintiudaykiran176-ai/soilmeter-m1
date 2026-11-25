import { Suspense } from "react";
import { auth } from "@/auth";
import { TelemetryDashboard } from "@/components/dashboard/telemetry-dashboard";
import { Loading } from "@/components/shared/loading";
import { getDashboardTelemetry } from "@/lib/dashboard/telemetry";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading label="Loading telemetry dashboard..." />}>
      <DashboardData />
    </Suspense>
  );
}

async function DashboardData() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const data = await getDashboardTelemetry(session.user.id);
  return <TelemetryDashboard data={data} />;
}
