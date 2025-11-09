'use client';

import { useEmails } from '@/hooks/useEmails';
import { Container } from '@/components/layout/Container';
import { DataTable, ColumnDef, Badge } from '@/components/ui';
import type { EmailLog } from '@/lib/types';

const columns: ColumnDef<EmailLog>[] = [
  {
    accessorKey: 'to',
    header: 'Para',
  },
  {
    accessorKey: 'subject',
    header: 'Assunto',
  },
  {
    accessorKey: 'sentAt',
    header: 'Data',
    cell: ({ row }) => {
      const date = new Date(row.getValue('sentAt'));
      return date.toLocaleString('pt-BR');
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: () => <Badge variant="success">Enviado</Badge>,
  },
];

export default function AdminEmailsPage() {
  const { data: emails, isLoading } = useEmails();

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Logs de Emails</h1>
        <p className="mt-2 text-gray-600">
          Histórico de emails enviados pelo sistema
        </p>
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
          data={emails || []}
          enableSorting={true}
          enablePagination={true}
          pageSize={20}
        />
      )}
    </Container>
  );
}
