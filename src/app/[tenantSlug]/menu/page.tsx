import React from 'react';
import MenuClientView from './components/MenuClientView';

// Fetch the menu from the live API based on the tenant slug
async function getTenantMenu(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';
    // By default, public menu endpoint fetches the "default" branch or all items
    const res = await fetch(`${apiUrl}/menus/public/${slug}`, {
      // Revalidate frequently or use React cache depending on how realtime it needs to be
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error('Failed to fetch menu, status:', res.status);
      return [];
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data; // Array of categories with nested items
    }
  } catch (error) {
    console.error('Error fetching tenant menu:', error);
  }
  
  return [];
}

export default async function TenantMenuPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const categories = await getTenantMenu((await params).tenantSlug);

  if (!categories || categories.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-500">
        <h2 className="text-2xl font-bold mb-2">No Menu Found</h2>
        <p>This restaurant hasn't added any menu items yet, or the connection failed.</p>
      </div>
    );
  }

  return (
    <MenuClientView 
      tenantSlug={(await params).tenantSlug} 
      categories={categories} 
    />
  );
}
