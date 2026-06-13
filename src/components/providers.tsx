"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { GamificationToastProvider } from "@/components/gamification-toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <GamificationToastProvider>{children}</GamificationToastProvider>
    </SessionProvider>
  );
}
