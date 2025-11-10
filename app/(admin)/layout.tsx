'use client';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { AdminGuard } from '@/components/auth/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarItems = [
    {
      label: 'Dashboard',
      href: '/admin',
    },
    {
      label: 'Intenções',
      href: '/admin/intentions',
    },
    {
      label: 'Membros',
      href: '/admin/members',
    },
    {
      label: 'Avisos',
      href: '/admin/notices',
    },
    {
      label: 'Reuniões',
      href: '/admin/meetings',
    },
    {
      label: 'Mensalidades',
      href: '/admin/memberships',
    },
    {
      label: 'Relatórios',
      href: '/admin/reports',
    },
    {
      label: 'Emails',
      href: '/admin/emails',
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header title="Painel Administrativo" />
        <div className="flex flex-1">
          <Sidebar items={sidebarItems} />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </AdminGuard>
  );
}
