import { test, expect } from '@playwright/test';

test('trade form rejects missing required fields', async ({ page }) => {
    const accountName = `E2E Validation Account ${Date.now()}`;
    const tradeSymbol = `INVALID${Date.now()}`;
    let accountCreated = false;

    try {
        // The shared Playwright setup has already authenticated the demo user.
        await page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Create an isolated account for this validation test.
        await page
            .getByRole('button', { name: '+ Add account' })
            .click();

        await page
            .getByLabel('Account name')
            .fill(accountName);

        await page
            .getByLabel('Starting balance')
            .fill('10000');

        await page
            .getByLabel('Currency')
            .selectOption('EUR');

        await page
            .getByLabel('Broker')
            .fill('E2E Broker');

        await page
            .getByLabel('Account type')
            .fill('E2E');

        await page
            .getByRole('button', { name: 'Save account' })
            .click();

        const accountCell = page.getByRole('cell', {
            name: accountName,
        });

        await expect(accountCell).toBeVisible();
        accountCreated = true;

        await page
            .getByRole('link', { name: 'Dashboard' })
            .click();

        await expect(page).toHaveURL('/');

        await page
            .getByRole('combobox')
            .first()
            .selectOption({ label: accountName });

        await page
            .getByRole('button', { name: /add trade/i })
            .click();

        // Fill only some fields and intentionally leave required fields empty.
        await page
            .getByRole('textbox', { name: /Symbol/ })
            .fill(tradeSymbol);

        await page
            .getByRole('combobox', { name: /Direction/ })
            .selectOption('long');

        await page
            .getByRole('button', { name: 'Save Trade' })
            .click();

        // The frontend must reject the incomplete trade.
        await expect(
            page.getByText('Please fill in all required fields.', {
                exact: true,
            }),
        ).toBeVisible();

        // The invalid trade must not appear in the trade table.
        await expect(
            page.getByRole('cell', { name: tradeSymbol }),
        ).not.toBeVisible();
    } finally {
        // Remove the temporary account even if the assertion above fails.
        if (accountCreated && !page.isClosed()) {
            try {
                await page.goto('/accounts');

                const accountCell = page.getByRole('cell', {
                    name: accountName,
                });

                await expect(accountCell).toBeVisible();

                const accountRow = page
                    .getByRole('row')
                    .filter({ has: accountCell });

                await accountRow
                    .getByRole('button', { name: 'Delete account' })
                    .click();

                await page
                    .getByRole('button', { name: 'Delete permanently' })
                    .click();

                await expect(accountCell).not.toBeVisible();
            } catch (cleanupError) {
                console.warn(
                    'E2E cleanup failed:',
                    cleanupError,
                );
            }
        }
    }
});