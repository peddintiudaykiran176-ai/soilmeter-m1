import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { DeviceRegistrationForm } from "@/components/devices/device-registration-form";
import { Loading } from "@/components/shared/loading";
import { Sprout } from "lucide-react";
import { redirect } from "next/navigation";

export default function NewDevicePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7faf7]">
          <Loading label="Checking your session..." />
        </main>
      }
    >
      <AuthenticatedDeviceSetup />
    </Suspense>
  );
}

async function AuthenticatedDeviceSetup() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f7faf7] text-[#183b2c]">
      <header className="border-b border-[#e5ebe4] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="SoilMeter home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f513b] text-white">
              <Sprout size={19} />
            </span>
            <span className="text-[16px] font-semibold tracking-[-0.04em]">
              soilmeter<span className="text-[#72a17a]">.</span>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#5d7061] transition hover:text-[#183b2c]"
          >
            Go to dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6e9475]">
            Your growing workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#183b2c] sm:text-3xl">
            Connect your SoilMeter
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d7d70]">
            Add your field details and verify the device ID. SoilMeter will
            show the latest moisture reading after it finds the sensor.
          </p>
        </div>
        <DeviceRegistrationForm />
      </div>
    </main>
  );
}
