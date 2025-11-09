'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RegistrationForm } from '@/components/features/members/RegistrationForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [memberData, setMemberData] = useState<{ name: string; email: string } | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token inválido ou não fornecido.');
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/members/validate-token?token=${token}`);
        const data = await response.json();

        if (!response.ok || !data.valid) {
          setError('Token inválido ou expirado.');
          return;
        }

        setMemberData({
          name: data.member.name,
          email: data.member.email,
        });
      } catch (err) {
        setError('Erro ao validar token.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validando convite...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Container maxWidth="md">
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❌</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro na Validação</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <a 
                  href="/"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voltar para a página inicial
                </a>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-12">
        <Container maxWidth="lg">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Complete seu Cadastro</CardTitle>
              </CardHeader>
              <CardContent>
                {memberData && (
                  <RegistrationForm
                    token={token!}
                    memberData={memberData}
                    onSuccess={handleSuccess}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
