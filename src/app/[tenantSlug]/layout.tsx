import React from 'react';
import type { Metadata } from 'next';

// In a real app, this would be fetched from the Kwickly API using the tenantSlug
async function getTenantBranding(slug: string) {
  // Mock fallback
  return {
    brandColor: '#4f46e5', // Indigo-600
    themeConfig: {
      fonts: {
        sans: 'Inter',
      }
    },
    name: 'Kwickly',
  };
}

// Convert HEX to HSL format suitable for Tailwind CSS variables (e.g., "226 76% 60%")
// Real implementation would use a utility like 'color-convert' or a custom hex-to-hsl function
function hexToOklchString(hex: string) {
  // Mock conversion for #4f46e5 (Indigo)
  if (hex === '#4f46e5') return '0.51 0.2 260';
  if (hex === '#ef4444') return '0.62 0.2 25'; // Red example
  return '0.51 0.2 260'; // Fallback
}

export async function generateMetadata({ params }: { params: { tenantSlug: string } }): Promise<Metadata> {
  const branding = await getTenantBranding(params.tenantSlug);
  return {
    title: branding.name,
    description: `Order online from ${branding.name}`,
  };
}

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenantSlug: string };
}) {
  const branding = await getTenantBranding(params.tenantSlug);
  
  // We compute the OKLCH values to support Tailwind v4's format
  const primaryOklch = hexToOklchString(branding.brandColor);

  return (
    <>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            .tenant-wrapper {
              --primary: oklch(${primaryOklch});
              --primary-foreground: oklch(0.985 0 0); /* White foreground for contrast */
              --font-sans: '${branding.themeConfig.fonts.sans}', sans-serif;
            }
          `
        }} />
      </head>
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
