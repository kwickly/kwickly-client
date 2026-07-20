import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';

const fontBody = Inter({ subsets: ['latin'], variable: '--font-sans' });
const fontHeading = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Kwickly - Fast & Fresh',
  description: 'Order food and manage your subscriptions seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontBody.variable} ${fontHeading.variable} font-sans min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased`}>
        <QueryProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
