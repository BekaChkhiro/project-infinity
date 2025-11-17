import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { User } from '@/types/database.types';

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
