"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, LoaderCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import {
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import { loginSchema } from "@/lib/auth/schemas";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthNotice, type AuthNoticeProps } from "@/components/auth/auth-notice";
import { Button } from "@/components/ui/button";

type LoginValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<AuthNoticeProps | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onValid: SubmitHandler<LoginValues> = async ({ email, password }) => {
    setNotice(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: "/auth/continue",
      });

      if (!result?.ok || result.error) {
        setNotice({
          tone: "error",
          message: "Unable to sign in with those details. Please try again.",
        });
        return;
      }

      router.replace("/auth/continue");
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        message: "Unable to sign in right now. Please try again later.",
      });
    }
  };

  const onInvalid: SubmitErrorHandler<LoginValues> = () => {
    setNotice({
      tone: "error",
      message: "Please correct the highlighted fields and try again.",
    });
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to review your soil conditions and field activity."
    >
      <form
        noValidate
        className="space-y-5"
        onSubmit={handleSubmit(onValid, onInvalid)}
        onChange={() => setNotice(null)}
      >
        <div className="space-y-4">
          <AuthInput
            id="login-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            leadingIcon={<Mail className="size-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
          <AuthInput
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
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
              Signing in...
            </>
          ) : (
            "Log in"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to SoilMeter?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
