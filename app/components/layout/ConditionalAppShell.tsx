"use client";

import { usePathname } from "next/navigation";
import AppShell from "./AppShell";

// Routes where the sidebar shell should NOT render
const NO_SHELL_PATHS = ["/", "/login"];

export default function ConditionalAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_SHELL_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
