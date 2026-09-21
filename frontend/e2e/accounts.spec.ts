import { test, expect } from '@playwright/test';

test('demo user can create an account', async ({ page }) => {
    const accountName = `E2E Test Account ${Date.now()}`;

    // Log in with the demo user and open the Accounts page.
    await page.goto('/login');

    await page.getByRole('button', { name: 'Try demo' }).click();
    await expect(page).toHaveURL('/');

    await page.getByRole('link', { name: 'Accounts' }).click();
    await expect(page).toHaveURL('/accounts');

    // Create a new account with a unique name.
    await page.getByRole('button', { name: '+ Add account' }).click();

    await page.getByLabel('Account name').fill(accountName);
    await page.getByLabel('Starting balance').fill('25000');
    await page.getByLabel('Currency').selectOption('EUR');
    await page.getByLabel('Broker').fill('E2E Broker');
    await page.getByLabel('Account type').fill('Demo');

    await page.getByRole('button', { name: 'Save account' }).click();

    const accountCell = page.getByRole('cell', { name: accountName });

    await expect(accountCell).toBeVisible();

    // Delete the account created by the test so the demo data stays clean.
    const accountRow = page.getByRole('row').filter({
        has: accountCell,
    });

    await accountRow
        .getByRole('button', { name: 'Delete account' })
        .click();

    await page
        .getByRole('button', { name: 'Delete permanently' })
        .click();

    await expect(accountCell).not.toBeVisible();
});