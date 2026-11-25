import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full border-border bg-card shadow-lg shadow-primary/5">
      <CardHeader className="items-center px-6 pt-8 text-center sm:px-8">
        <Logo className="mb-3" />
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Soil monitoring platform
        </p>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </CardTitle>
          <CardDescription className="text-sm leading-6">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-8 sm:px-8">
        {children}
      </CardContent>
    </Card>
  );
}
