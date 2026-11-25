"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => signOut({ redirectTo: "/login" })}
    >
      <LogOut aria-hidden="true" className="size-4" />
      Sign out
    </Button>
  );
}
