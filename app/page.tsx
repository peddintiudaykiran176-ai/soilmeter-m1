import { Suspense } from "react";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing-page";
import { MarketingHeader } from "@/components/marketing-header";

export default function Home() {
  return (
    <Suspense
      fallback={
        <>
          <MarketingHeader user={null} />
          <LandingPage />
        </>
      }
    >
      <AuthenticatedHome />
    </Suspense>
  );
}

async function AuthenticatedHome() {
  const session = await auth();
  const user = session?.user
    ? {
        name:
          session.user.name?.trim() ||
          session.user.email?.trim() ||
          "My account",
      }
    : null;

  return (
    <>
      <MarketingHeader user={user} />
      <LandingPage />
    </>
  );
}
