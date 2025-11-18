import { Suspense } from 'react';
import { AdvancedFilters } from '@/components/filters/advanced-filters';

export default function FiltersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">დეტალური ფილტრები</h1>
        <p className="text-muted-foreground mt-1">
          გამოიყენეთ დეტალური ფილტრები პროექტებისა და კლიენტების მოსაძებნად
        </p>
      </div>

      <Suspense fallback={<div>იტვირთება...</div>}>
        <AdvancedFilters />
      </Suspense>
    </div>
  );
}
