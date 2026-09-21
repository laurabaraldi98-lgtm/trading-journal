import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/demo-user.json';

setup('authenticate demo user', async ({ page }) => {
    // Authenticate once and reuse the saved browser session across E2E tests.
    // This keeps the tests faster and avoids repeatedly calling the demo login
    // endpoint, which is rate-limited.

    await page.goto('/login');

    await page
        .getByRole('button', { name: 'Try demo' })
        .click();

    await expect(page).toHaveURL('/');

    await page.context().storageState({
        path: authFile,
    });
});