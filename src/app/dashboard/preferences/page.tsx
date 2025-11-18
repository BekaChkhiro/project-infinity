import { Suspense } from 'react';
import { PreferencesForm } from '@/components/preferences/preferences-form';

export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          პარამეტრები
        </h1>
        <p className="text-muted-foreground">
          მართეთ თქვენი შეტყობინებების და ავტომატიზაციის პარამეტრები
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8">იტვირთება...</div>
        }
      >
        <PreferencesForm />
      </Suspense>
    </div>
  );
}
