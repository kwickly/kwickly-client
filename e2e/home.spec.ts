import { test, expect } from '@playwright/test';

test('has title and renders correctly', async ({ page }) => {
  // Navigate to the index page
  await page.goto('/');

  // Expect the page to have a title (Update this if Kwickly changes the title)
  await expect(page).toHaveTitle(/Kwickly|Next.js/);
  
  // Basic smoke test to ensure the body is loaded
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
