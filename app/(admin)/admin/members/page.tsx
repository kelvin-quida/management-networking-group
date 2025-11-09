'use client';

import { useMembers } from '@/hooks/useMembers';
import { MemberCard } from '@/components/features/members/MemberCard';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui';
import { useState } from 'react';

export default function AdminMembersPage() {
  const { data: members, isLoading } = useMembers();
  const [search, setSearch] = useState('');

  const filteredMembers = members?.data.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase()) ||
    member.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Membros</h1>
        <p className="mt-2 text-gray-600">
          Visualize e gerencie todos os membros do grupo
        </p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar por nome, email ou empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredMembers && filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum membro encontrado.</p>
        </div>
      )}
    </Container>
  );
}
