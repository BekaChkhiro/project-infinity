import { Suspense } from 'react';
import { ClientForm } from '@/components/clients/client-form';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function EditClientPage({
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
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">კლიენტის რედაქტირება</h1>
        <p className="text-muted-foreground mt-1">
          განაახლეთ კლიენტის ინფორმაცია
        </p>
      </div>

      <Suspense fallback={<div>იტვირთება...</div>}>
        <ClientForm isEdit clientId={params.id} initialData={client} />
      </Suspense>
    </div>
  );
}
