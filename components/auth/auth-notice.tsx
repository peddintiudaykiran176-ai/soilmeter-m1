import { CheckCircle2, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuthNoticeProps = {
  tone: "success" | "error";
  message: string;
};

export function AuthNotice({ tone, message }: AuthNoticeProps) {
  const isSuccess = tone === "success";
  const Icon = isSuccess ? CheckCircle2 : CircleAlert;

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm leading-5",
        isSuccess
          ? "border-success/20 bg-success/10 text-success"
          : "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
