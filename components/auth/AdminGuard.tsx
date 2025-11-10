"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AdminGuard = ({ children, redirectTo = "/dashboard" }: AdminGuardProps) => {
  const router = useRouter();
  const { isAdmin, isMember, isPending, user } = useAuth();

  useEffect(() => {
    if (!isPending) {
      if (isMember && !isAdmin) {
        router.push("/dashboard");
        return;
      }
      if (!isAdmin) {
        router.push(redirectTo);
      }
    }
  }, [isAdmin, isMember, isPending, router, redirectTo]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (isMember && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">👤 Acesso de Membro</h1>
            <p className="text-gray-700 mb-4">
              Você é um membro. Redirecionando para o portal de membros...
            </p>
            {user && (
              <p className="text-sm text-gray-600 mb-4">
                Logado como: <strong>{user.email}</strong> ({user.role})
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">🚫 Acesso Negado</h1>
            <p className="text-gray-700 mb-4">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            {user && (
              <p className="text-sm text-gray-600 mb-4">
                Logado como: <strong>{user.email}</strong> ({user.role})
              </p>
            )}
            <p className="text-sm text-gray-500">
              Redirecionando...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
