import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTenantSlug } from '@/lib/tenant-helper';
import { hexToOklchString } from '@/lib/color-utils';

// Fetch branding from the live API based on the tenant slug
async function getTenantBranding(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiUrl}/auth/branding?hostname=${slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await res.json();
    if (data.success && data.branding) {
      return data.branding;
    }
  } catch (error) {
    console.error('Failed to fetch tenant branding:', error);
  }
  
  // Fallback if network fails
  return {
    brandColor: '#4f46e5', // Indigo-600
    themeMode: 'light',
    name: 'Kwickly (Fallback)',
    baseCurrency: 'INR',
    enabledModules: { dineIn: true, takeaway: true, delivery: true, subscriptions: true },
    themeConfig: { fonts: { sans: "Poppins, sans-serif" } }
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantSlug = getTenantSlug(host) || 'kwickly';
  
  const branding = await getTenantBranding(tenantSlug);
  return {
    title: branding.name,
    description: `Order online from ${branding.name}`,
  };
}

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantSlug = getTenantSlug(host) || 'kwickly';

  const branding = await getTenantBranding(tenantSlug);
  
  // We compute the OKLCH values to support Tailwind v4's format
  const primaryOklch = hexToOklchString(branding.brandColor || '#4f46e5');

  // Determine font family
  const fontConfig = branding.themeConfig?.fonts?.sans || 'Poppins, sans-serif';
  const fontFamilyName = fontConfig.split(',')[0].replace(/['"]/g, '').trim();
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamilyName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={fontUrl} rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .tenant-wrapper {
            --primary: oklch(${primaryOklch});
            --primary-foreground: oklch(0.985 0 0); /* White foreground for contrast */
            --font-sans: ${fontConfig};
          }
        `
      }} />
      {/* 
        By rendering children here, we ensure everything inside this tenant's 
        routing tree inherits these CSS variables.
      */}
      <div className="tenant-wrapper min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}
