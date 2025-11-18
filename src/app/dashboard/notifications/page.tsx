import { Suspense } from 'react';
import { NotificationsContent } from '@/components/notifications/notifications-content';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">შეტყობინებები</h1>
        <p className="text-muted-foreground mt-1">
          ყველა შეტყობინება და გაფრთხილება
        </p>
      </div>

      <Suspense fallback={<div>იტვირთება...</div>}>
        <NotificationsContent />
      </Suspense>
    </div>
  );
}
