"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface MemberGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const MemberGuard = ({ children, redirectTo = "/login" }: MemberGuardProps) => {
  const router = useRouter();
  const { isMember, isAdmin, isGuest, isPending, user } = useAuth();

  useEffect(() => {
    if (!isPending) {
      if (isAdmin) {
        router.push("/admin");
        return;
      }
      if (isGuest) {
        router.push("/pending");
        return;
      }
      
      if (isMember && !user?.memberId) {
        router.push("/pending");
        return;
      }
      
      if (!isMember) {
        router.push(redirectTo);
      }
    }
  }, [isMember, isAdmin, isGuest, isPending, user?.memberId, router, redirectTo]);

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

  if (isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">🛡️ Acesso Admin</h1>
            <p className="text-gray-700 mb-4">
              Você é um administrador. Redirecionando para o painel administrativo...
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

  if (isGuest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">⏳ Cadastro Pendente</h1>
            <p className="text-gray-700 mb-4">
              Seu cadastro está aguardando aprovação do administrador.
            </p>
            {user && (
              <p className="text-sm text-gray-600 mb-4">
                Logado como: <strong>{user.email}</strong>
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

  if (isMember && !user?.memberId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-yellow-600 mb-2">⚠️ Perfil Incompleto</h1>
            <p className="text-gray-700 mb-4">
              Sua conta ainda não foi vinculada a um perfil de membro.
            </p>
            {user && (
              <p className="text-sm text-gray-600 mb-4">
                Logado como: <strong>{user.email}</strong>
              </p>
            )}
            <p className="text-sm text-gray-500">
              Entre em contato com o administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">🚫 Acesso Negado</h1>
            <p className="text-gray-700 mb-4">
              Você não tem permissão para acessar o portal de membros.
            </p>
            {user && (
              <p className="text-sm text-gray-600 mb-4">
                Logado como: <strong>{user.email}</strong> ({user.role})
              </p>
            )}
            <p className="text-sm text-gray-500">
              Redirecionando para o login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
