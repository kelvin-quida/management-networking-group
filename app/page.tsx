import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { IntentionForm } from '@/components/features/intentions/IntentionForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-12">
        <Container maxWidth="lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo ao Grupo de Networking
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conecte-se com profissionais de sucesso, gere negócios e expanda sua rede de contatos.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Manifeste seu Interesse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Preencha o formulário abaixo para manifestar seu interesse em participar do nosso grupo. 
                  Entraremos em contato em breve!
                </p>
                <IntentionForm />
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
