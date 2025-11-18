import { Suspense } from 'react';
import { AutomationRulesList } from '@/components/automation/automation-rules-list';
import { AutomationStatsWidget } from '@/components/dashboard/automation-stats-widget';

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ავტომატიზაცია</h1>
        <p className="text-muted-foreground">
          მართეთ ავტომატიზაციის წესები და მონიტორინგი
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8">იტვირთება...</div>
        }
      >
        <AutomationStatsWidget />
      </Suspense>

      <Suspense
        fallback={
          <div className="text-center py-8">იტვირთება...</div>
        }
      >
        <AutomationRulesList />
      </Suspense>
    </div>
  );
}
