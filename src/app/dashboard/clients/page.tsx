import { Suspense } from 'react';
import { ClientsListContent } from '@/components/clients/clients-list';
import { BulkEmailDialog } from '@/components/clients/bulk-email-dialog';

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">კლიენტები</h1>
          <p className="text-muted-foreground mt-1">
            მართეთ კლიენტები და მათი პროექტები
          </p>
        </div>
        <BulkEmailDialog />
      </div>

      <Suspense fallback={<div>იტვირთება...</div>}>
        <ClientsListContent />
      </Suspense>
    </div>
  );
}
