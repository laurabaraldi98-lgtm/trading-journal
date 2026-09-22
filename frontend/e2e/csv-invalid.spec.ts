import { test, expect } from '@playwright/test';
import path from 'node:path';

test('invalid CSV shows an error and imports no trades', async ({ page }) => {
    const accountName = `E2E Invalid CSV Account ${Date.now()}`;
    let accountCreated = false;

    try {
        // The shared Playwright setup has already authenticated the demo user.
        await page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Use an isolated account so this test cannot affect existing trade data.
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
            .getByRole('link', { name: 'Import CSV' })
            .click();

        await expect(page).toHaveURL('/import');

        await page
            .getByLabel('Account')
            .selectOption({ label: accountName });

        const csvPath = path.join(
            process.cwd(),
            'e2e',
            'fixtures',
            'invalid-trades.csv',
        );

        await page
            .getByLabel('CSV file')
            .setInputFiles(csvPath);

        const importResponsePromise = page.waitForResponse(
            (response) =>
                response.url().includes('/imports')
                && response.request().method() === 'POST',
        );

        await page
            .getByRole('button', { name: 'Import trades' })
            .click();

        const importResponse = await importResponsePromise;

        // Invalid column mapping must be rejected by the backend.
        expect(importResponse.status()).toBe(422);

        await expect(
            page.getByText(
                'CSV columns could not be mapped automatically: direction, entry, entry_datetime, exit, exit_datetime, pnl, symbol.',
                { exact: true },
            ),
        ).toBeVisible();

        // A failed import must never show a success message.
        await expect(
            page.getByText(/imported successfully/i),
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