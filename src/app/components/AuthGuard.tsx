// src/app/components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");

    if (!auth && pathname !== "/login") {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (pathname !== "/login" && isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <ProgressSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
