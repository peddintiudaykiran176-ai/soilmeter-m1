import { Suspense, type ReactNode } from "react";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Loading } from "@/components/shared/loading";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4">
          <Loading label="Checking your session..." />
        </main>
      }
    >
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}

async function AuthenticatedDashboard({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardShell
      user={{ name: session.user.name, email: session.user.email }}
    >
      {children}
    </DashboardShell>
  );
}
