'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    name: 'Membro',
    role: 'member' as const,
  };

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Portal do Membro" user={user} />
      <div className="flex flex-1">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
