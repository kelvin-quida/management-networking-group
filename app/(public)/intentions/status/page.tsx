'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { IntentionStatusChecker } from '@/components/features/intentions/IntentionStatusChecker';

export default function IntentionStatusPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-12">
        <Container maxWidth="lg">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Acompanhe sua Intenção
              </h1>
              <p className="text-gray-600">
                Digite o email que você usou para enviar sua intenção e veja o status atual.
              </p>
            </div>

            <IntentionStatusChecker />
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
