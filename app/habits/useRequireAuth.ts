import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/authUtils";

/**
 * Hook to require authentication - redirects to login if not authenticated
 */
export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);
}

