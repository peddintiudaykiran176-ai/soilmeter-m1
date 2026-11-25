import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Loading } from "@/components/shared/loading";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
          <Loading label="Checking your session..." />
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

async function LoginPageContent() {
  const session = await auth();
  if (session?.user) {
    redirect("/auth/continue");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
