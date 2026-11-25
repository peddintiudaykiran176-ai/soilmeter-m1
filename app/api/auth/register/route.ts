import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/auth/schemas";
import { allowAuthAttempt } from "@/lib/auth/rate-limit";
import { createUser } from "@/lib/auth/users";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid registration request." },
      { status: 400 },
    );
  }

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please review the registration details." },
      { status: 400 },
    );
  }

  try {
    const clientIp = request.headers.get("x-nf-client-connection-ip");
    const allowed = await allowAuthAttempt(
      "register",
      parsed.data.email,
      clientIp,
    );

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }

    await createUser(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message:
          "If registration is available for this email address, you can now sign in.",
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("Account registration failed:", error);
    return NextResponse.json(
      { error: "Unable to complete registration right now." },
      { status: 500 },
    );
  }
}
