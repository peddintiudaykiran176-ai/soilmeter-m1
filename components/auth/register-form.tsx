"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  LoaderCircle,
} from "lucide-react";
import { signIn } from "next-auth/react";
import {
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import { z } from "zod";
import { registrationSchema } from "@/lib/auth/schemas";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthNotice, type AuthNoticeProps } from "@/components/auth/auth-notice";
import { Button } from "@/components/ui/button";

type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<AuthNoticeProps | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onValid: SubmitHandler<RegisterValues> = async (values) => {
    setNotice(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        cache: "no-store",
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const errorPayload = z
          .object({ error: z.string() })
          .safeParse(payload);

        setNotice({
          tone: "error",
          message: errorPayload.success
            ? errorPayload.data.error
            : "Unable to complete registration right now.",
        });
        return;
      }

      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        redirectTo: "/auth/continue",
      });

      if (!signInResult?.ok || signInResult.error) {
        setNotice({
          tone: "error",
          message:
            "Unable to sign in automatically. Please log in to continue connecting your device.",
        });
        return;
      }

      router.replace("/auth/continue");
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        message: "Unable to complete registration right now. Please try again.",
      });
    }
  };

  const onInvalid: SubmitErrorHandler<RegisterValues> = () => {
    setNotice({
      tone: "error",
      message: "Please correct the highlighted fields and try again.",
    });
  };

  return (
    <AuthCard
      title="Create your account"
      description="Set up your SoilMeter workspace to monitor your fields."
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={handleSubmit(onValid, onInvalid)}
        onChange={() => setNotice(null)}
      >
        <div className="space-y-4">
          <AuthInput
            id="register-name"
            label="Full name"
            placeholder="Your name"
            autoComplete="name"
            leadingIcon={<UserRound className="size-4" />}
            error={errors.name?.message}
            {...register("name")}
          />
          <AuthInput
            id="register-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leadingIcon={<Mail className="size-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
          <AuthInput
            id="register-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 12 characters"
            autoComplete="new-password"
            leadingIcon={<LockKeyhole className="size-4" />}
            error={errors.password?.message}
            trailingAction={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </button>
            }
            {...register("password")}
          />
        </div>

        {notice && <AuthNotice tone={notice.tone} message={notice.message} />}

        <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
