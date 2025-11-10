"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface PendingGuardProps {
  children: React.ReactNode;
}

export const PendingGuard = ({ children }: PendingGuardProps) => {
  const router = useRouter();
  const { isMember, isAdmin, isGuest, isPending, user } = useAuth();

  useEffect(() => {
    if (!isPending) {
      if (isAdmin) {
        router.push("/admin");
        return;
      }
      
      if (isMember && user?.memberId) {
        router.push("/dashboard");
        return;
      }
      
      if (!user) {
        router.push("/");
        return;
      }
      
      if (isMember && !user?.memberId) {
        router.push("/pending");
        return;
      }
    }
  }, [isMember, isAdmin, isGuest, isPending, user, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando status...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
