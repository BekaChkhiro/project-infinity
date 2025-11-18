import { Suspense } from 'react';
import { AuditLogList } from '@/components/audit-log/audit-log-list';

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          აუდიტის ლოგი
        </h1>
        <p className="text-muted-foreground">
          მონიტორინგი ყველა მოქმედებისა და ცვლილების
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8">იტვირთება...</div>
        }
      >
        <AuditLogList />
      </Suspense>
    </div>
  );
}
