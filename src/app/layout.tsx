import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { headers } from 'next/headers';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans' 
});

export const metadata: Metadata = {
  title: 'Kwickly - Fast & Fresh',
  description: 'Order food and manage your subscriptions seamlessly.',
};

function getTenantSlug(host: string) {
  if (!host) return 'kwickly';
  if (host.includes('kwickly.com') || host.includes('localhost')) {
    return host.split('.')[0] || 'kwickly';
  }
  return host;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const slug = getTenantSlug(host);

  let customFontFamily = '';
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';
    const res = await fetch(`${apiUrl}/auth/branding?hostname=${slug}`, { next: { revalidate: 60 } });
    const data = await res.json();
    if (data.success && data.branding?.themeConfig?.fonts?.sans) {
      customFontFamily = data.branding.themeConfig.fonts.sans;
    }
  } catch (error) {
    console.error('Failed to fetch branding in layout', error);
  }

  // Combine custom font with the Poppins fallback
  const customFontStyles = customFontFamily 
    ? { '--font-sans': `"${customFontFamily}", ${poppins.style.fontFamily}` } as React.CSSProperties 
    : {};

  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${poppins.variable} font-sans min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased`}
        style={customFontStyles}
      >
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
