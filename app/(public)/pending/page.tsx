'use client';

import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PendingGuard } from '@/components/auth/PendingGuard';

export default function PendingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <PendingGuard>
      <Container maxWidth="full" className="flex items-center justify-center min-h-screen py-12 bg-gray-50">
        <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">⏳ Cadastro Pendente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Bem-vindo, {user?.name}!
              </h2>
              <p className="text-gray-700">
                Seu cadastro foi realizado com sucesso, mas você ainda não foi aprovado como membro do grupo.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">📋 Próximos Passos:</h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Envie sua intenção de participar do grupo através do formulário</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Aguarde a análise e aprovação do administrador</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Você receberá um email quando for aprovado</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>Após aprovação, você terá acesso completo ao portal de membros</span>
                </li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">🔒 Acesso Restrito</h3>
              <p className="text-gray-600 text-sm">
                Enquanto seu cadastro estiver pendente, você não terá acesso a:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                <li>• Dashboard</li>
                <li>• Avisos e Reuniões</li>
                <li>• Agradecimentos e Reuniões 1:1</li>
                <li>• Perfil de Membro</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button className="w-full" variant="primary">
                Enviar Intenção de Participar
              </Button>
            </Link>
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Dúvidas? Entre em contato com o administrador do grupo.</p>
          </div>
        </CardContent>
      </Card>
    </Container>
    </PendingGuard>
  );
}
