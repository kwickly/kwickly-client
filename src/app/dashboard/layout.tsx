'use client';

import { useAuthStore } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ReceiptText, QrCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, mounted, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] p-4 md:p-8 space-x-8 max-w-7xl mx-auto">
        <Skeleton className="w-64 h-[500px] hidden md:block" />
        <div className="flex-1 space-y-4">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-[400px]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <aside className="w-full md:w-64 border-r bg-white dark:bg-slate-900 p-6 md:h-[calc(100vh-4rem)] sticky top-16">
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
            <LayoutDashboard className="h-5 w-5" /> Overview
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
            <QrCode className="h-5 w-5" /> My Scan Code
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
            <ReceiptText className="h-5 w-5" /> Order History
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}
