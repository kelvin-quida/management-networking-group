'use client';

import { useMembers, useDeleteMember } from '@/hooks/useMembers';
import { MemberCard } from '@/components/features/members/MemberCard';
import { Container } from '@/components/layout/Container';
import { Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

export default function AdminMembersPage() {
  const { data: members, isLoading } = useMembers();
  const deleteMember = useDeleteMember();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMember.mutateAsync(id);
      showToast('Membro removido com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao remover membro. Tente novamente.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

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
            <div key={member.id} className={deletingId === member.id ? 'opacity-50 pointer-events-none' : ''}>
              <MemberCard 
                member={member} 
                showActions={true}
                onDelete={handleDelete}
              />
            </div>
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
