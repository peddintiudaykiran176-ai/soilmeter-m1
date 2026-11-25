import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import type { RegistrationInput } from "@/lib/auth/schemas";
import { burnPasswordVerification, hashPassword, verifyPassword } from "@/lib/auth/password";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export async function createUser(input: RegistrationInput): Promise<void> {
  const passwordHash = await hashPassword(input.password);

  await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email,
      passwordHash,
    })
    .onConflictDoNothing({ target: users.email });
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    await burnPasswordVerification(password);
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
