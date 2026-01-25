"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "./page-transition";

export function RootPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Disable root transition for routes that have their own internal PageTransition
  // to prevent the "maximum update depth exceeded" error caused by nested FrozenRouters.
  const isProblematicRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/courses') || 
    pathname.startsWith('/instructor') || 
    pathname.startsWith('/admin');

  return (
    <PageTransition disabled={isProblematicRoute}>
      {children}
    </PageTransition>
  );
}

