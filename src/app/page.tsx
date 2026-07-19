import { headers } from 'next/headers';
import { getTenantSlug } from '@/lib/tenant-helper';
import { TenantLandingView } from '@/components/layout/TenantLandingView';
import { PlatformLandingView } from '@/components/layout/PlatformLandingView';

async function getTenantBranding(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiUrl}/auth/branding?hostname=${slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await res.json();
    
    if (data.success && data.branding) {
      return {
        brandColor: data.branding.brandColor || '#4f46e5',
        baseCurrency: data.branding.baseCurrency || 'INR',
        name: data.branding.name || slug.replace(/-/g, ' ').toUpperCase(),
        enabledModules: data.branding.enabledModules || { dineIn: true, takeaway: false, delivery: false, subscriptions: false }
      };
    }
  } catch (error) {
    console.error('Failed to fetch tenant branding:', error);
  }
  
  // Fallback
  return {
    brandColor: '#4f46e5',
    baseCurrency: 'INR',
    name: slug.replace(/-/g, ' ').toUpperCase(),
    enabledModules: { dineIn: true, takeaway: true, delivery: true, subscriptions: true }
  };
}

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantSlug = getTenantSlug(host);

  if (!tenantSlug) {
    return <PlatformLandingView />;
  }

  const branding = await getTenantBranding(tenantSlug);

  return (
    <TenantLandingView 
      tenantSlug={tenantSlug} 
      brandName={branding.name} 
      brandColor={branding.brandColor}
      baseCurrency={branding.baseCurrency}
      enabledModules={branding.enabledModules}
    />
  );
}
