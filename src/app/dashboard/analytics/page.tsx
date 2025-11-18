import { Suspense } from 'react';
import { ClientAnalyticsDashboard } from '@/components/analytics/client-analytics-dashboard';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ანალიტიკა</h1>
        <p className="text-muted-foreground mt-1">
          კლიენტების და პროექტების დეტალური ანალიტიკა
        </p>
      </div>

      <Suspense fallback={<div>იტვირთება...</div>}>
        <ClientAnalyticsDashboard />
      </Suspense>
    </div>
  );
}
