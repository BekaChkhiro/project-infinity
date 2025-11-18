import { Suspense } from 'react';
import { ClientDetailContent } from '@/components/clients/client-detail';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !client) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>იტვირთება...</div>}>
        <ClientDetailContent clientId={params.id} initialClient={client} />
      </Suspense>
    </div>
  );
}
