import { ClientForm } from '@/components/clients/client-form';

export default function NewClientPage() {
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ახალი კლიენტი</h1>
        <p className="text-muted-foreground mt-1">
          დაამატეთ ახალი კლიენტი სისტემაში
        </p>
      </div>

      <ClientForm />
    </div>
  );
}
