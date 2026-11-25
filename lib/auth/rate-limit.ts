import { createHmac } from "node:crypto";
import { sql } from "@/app/lib/db";

type AuthAction = "login" | "register";

type RateLimitPolicy = {
  identifier: string;
  limit: number;
};

function hashIdentifier(identifier: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET must be configured for authentication.");
  }

  return createHmac("sha256", secret).update(identifier).digest("hex");
}

async function consumeAttempt({
  identifier,
  limit,
}: RateLimitPolicy): Promise<boolean> {
  const identifierHash = hashIdentifier(identifier);
  const rows = await sql`
    INSERT INTO auth_rate_limits (identifier_hash, window_started_at, attempts)
    VALUES (${identifierHash}, now(), 1)
    ON CONFLICT (identifier_hash) DO UPDATE SET
      attempts = CASE
        WHEN auth_rate_limits.window_started_at <= now() - INTERVAL '15 minutes'
          THEN 1
        ELSE auth_rate_limits.attempts + 1
      END,
      window_started_at = CASE
        WHEN auth_rate_limits.window_started_at <= now() - INTERVAL '15 minutes'
          THEN now()
        ELSE auth_rate_limits.window_started_at
      END
    RETURNING attempts
  `;

  const attempts = rows[0]?.attempts;
  if (typeof attempts !== "number") {
    throw new Error("Could not read the authentication rate-limit result.");
  }

  return attempts <= limit;
}

export async function allowAuthAttempt(
  action: AuthAction,
  email: string,
  clientIp: string | null,
): Promise<boolean> {
  await sql`
    DELETE FROM auth_rate_limits
    WHERE window_started_at < now() - INTERVAL '1 day'
  `;

  const policies: RateLimitPolicy[] =
    action === "login"
      ? [
          { identifier: JSON.stringify([action, "email", email]), limit: 5 },
          ...(clientIp
            ? [
                {
                  identifier: JSON.stringify([action, "ip", clientIp]),
                  limit: 25,
                },
              ]
            : []),
        ]
      : [
          { identifier: JSON.stringify([action, "email", email]), limit: 3 },
          ...(clientIp
            ? [
                {
                  identifier: JSON.stringify([action, "ip", clientIp]),
                  limit: 10,
                },
              ]
            : []),
        ];

  const allowed = await Promise.all(policies.map(consumeAttempt));
  return allowed.every(Boolean);
}
