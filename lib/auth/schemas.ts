import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(254, "Email address is too long.")
  .email("Enter a valid email address.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Name must be 100 characters or fewer."),
  email: emailSchema,
  password: z
    .string()
    .min(12, "Password must be at least 12 characters.")
    .max(128, "Password must be 128 characters or fewer."),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
