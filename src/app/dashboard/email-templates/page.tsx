import { Suspense } from 'react';
import { TemplatesList } from '@/components/email-templates/templates-list';

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          ელ. ფოსტის შაბლონები
        </h1>
        <p className="text-muted-foreground">
          მართეთ ელ. ფოსტის შაბლონები ავტომატიზაციისთვის
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8">იტვირთება...</div>
        }
      >
        <TemplatesList />
      </Suspense>
    </div>
  );
}
