import React from 'react';
import MenuClientView from './components/MenuClientView';
import { headers } from 'next/headers';
import { getTenantSlug } from '@/lib/tenant-helper';

// Fetch the menu from the live API based on the tenant slug
async function getTenantMenu(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiUrl}/menus/public/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error('Failed to fetch menu, status:', res.status);
      return [];
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (error) {
    console.error('Error fetching tenant menu:', error);
  }

  return [];
}

async function getTenantBranding(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const res = await fetch(`${apiUrl}/auth/branding?hostname=${slug}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (data.success && data.branding) {
      return data.branding;
    }
  } catch (error) {
    console.error('Failed to fetch tenant branding:', error);
  }

  return {
    baseCurrency: 'INR',
    brandColor: '#4f46e5',
    name: 'Restaurant',
    logoUrl: null,
    tagline: null,
  };
}

export default async function TenantMenuPage() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantSlug = getTenantSlug(host) || 'kwickly';

  const [categories, branding] = await Promise.all([
    getTenantMenu(tenantSlug),
    getTenantBranding(tenantSlug),
  ]);

  if (!categories || categories.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-500">
        <h2 className="text-2xl font-bold mb-2">No Menu Found</h2>
        <p>This restaurant hasn&apos;t added any menu items yet, or the connection failed.</p>
      </div>
    );
  }

  return (
    <MenuClientView
      tenantSlug={tenantSlug}
      categories={categories}
      baseCurrency={branding.baseCurrency || 'INR'}
      brandColor={branding.brandColor || '#4f46e5'}
      tenantName={branding.name || tenantSlug}
      logoUrl={branding.logoUrl || null}
      tagline={branding.tagline || null}
    />
  );
}
