'use client';

import { useMemberships } from '@/hooks/useMemberships';
import { Container } from '@/components/layout/Container';
import { DataTable, ColumnDef, Badge, Button } from '@/components/ui';
import type { MembershipWithMember } from '@/lib/types';

const statusVariant = {
  PENDING: 'warning' as const,
  PAID: 'success' as const,
  OVERDUE: 'danger' as const,
  CANCELLED: 'default' as const,
};

const statusLabel = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
  CANCELLED: 'Cancelado',
};

const columns: ColumnDef<MembershipWithMember>[] = [
  {
    accessorKey: 'member.name',
    header: 'Membro',
  },
  {
    accessorKey: 'dueDate',
    header: 'Vencimento',
    cell: ({ row }) => {
      const date = new Date(row.getValue('dueDate'));
      return date.toLocaleDateString('pt-BR');
    },
  },
  {
    accessorKey: 'amount',
    header: 'Valor',
    cell: ({ row }) => {
      const amount = Number(row.getValue('amount'));
      return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusVariant;
      return (
        <Badge variant={statusVariant[status]}>
          {statusLabel[status]}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      const status = row.original.status;
      return status === 'PENDING' ? (
        <Button size="sm" variant="primary">
          Registrar Pagamento
        </Button>
      ) : null;
    },
  },
];

export default function AdminMembershipsPage() {
  const { data: memberships, isLoading } = useMemberships();

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as mensalidades dos membros
          </p>
        </div>
        <Button>Gerar Mensalidades</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={memberships || []}
          enableSorting={true}
          enablePagination={true}
          pageSize={15}
        />
      )}
    </Container>
  );
}
