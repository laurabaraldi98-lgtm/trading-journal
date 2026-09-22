import { test, expect } from '@playwright/test';

test('demo login redirects to the dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Try demo' }).click();

  await expect(page).toHaveURL('/');
});