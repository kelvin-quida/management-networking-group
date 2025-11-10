'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { MemberGuard } from '@/components/auth/MemberGuard';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      label: 'Avisos',
      href: '/notices',
    },
    {
      label: 'Reuniões',
      href: '/meetings',
    },
    {
      label: 'Agradecimentos',
      href: '/thanks',
    },
    {
      label: 'Reuniões 1:1',
      href: '/one-on-ones',
    },
    {
      label: 'Meu Perfil',
      href: '/profile',
    },
  ];

  return (
    <MemberGuard>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header title="Portal do Membro" />
        <div className="flex flex-1">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </MemberGuard>
  );
}
