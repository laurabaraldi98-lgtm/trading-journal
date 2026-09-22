import { test, expect } from '@playwright/test';
import path from 'node:path';

test('demo user can import trades from a CSV file', async ({ page }) => {
    const accountName = `E2E CSV Account ${Date.now()}`;
    let accountCreated = false;

    // The shared Playwright setup has already authenticated the demo user.
    await page.goto('/accounts');
    await expect(page).toHaveURL('/accounts');

    try {
        // Create a dedicated account for this test.
        await page.getByRole('link', { name: 'Accounts' }).click();
        await expect(page).toHaveURL('/accounts');

        await page.getByRole('button', { name: '+ Add account' }).click();

        await page.getByLabel('Account name').fill(accountName);
        await page.getByLabel('Starting balance').fill('10000');
        await page.getByLabel('Currency').selectOption('EUR');
        await page.getByLabel('Broker').fill('E2E Broker');
        await page.getByLabel('Account type').fill('E2E');

        await page.getByRole('button', { name: 'Save account' }).click();

        const accountCell = page.getByRole('cell', {
            name: accountName,
        });

        await expect(accountCell).toBeVisible();

        accountCreated = true;

        // Open the CSV import page.
        await page.getByRole('link', { name: 'Import CSV' }).click();
        await expect(page).toHaveURL('/import');

        const importAccountSelect = page.getByLabel('Account');

        await importAccountSelect.selectOption({
            label: accountName,
        });

        // Upload the CSV fixture.
        const csvPath = path.join(
            process.cwd(),
            'e2e',
            'fixtures',
            'trades.csv',
        );

        await page.getByLabel('CSV file').setInputFiles(csvPath);

        // Import the CSV and wait for the backend response.
        const importResponsePromise = page.waitForResponse(
            (response) =>
                response.url().includes('/imports')
                && response.request().method() === 'POST',
        );

        await page
            .getByRole('button', { name: 'Import trades' })
            .click();

        const importResponse = await importResponsePromise;

        expect(importResponse.ok()).toBe(true);

        await expect(
            page.getByText('2 trades imported successfully.')
        ).toBeVisible();

        // Open the full trade history.
        await page.getByRole('link', { name: 'Trades' }).click();
        await expect(page).toHaveURL('/trades');

        const tradesAccountSelect = page.getByLabel('Account');

        // Find the ID of the temporary account.
        const accountOption = tradesAccountSelect
            .locator('option')
            .filter({ hasText: accountName });

        const accountId = await accountOption.getAttribute('value');

        expect(accountId).not.toBeNull();

        // Select the E2E account and wait until its trades have loaded.
        const tradesResponsePromise = page.waitForResponse(
            (response) => {
                const url = new URL(response.url());

                return (
                    url.pathname.endsWith('/trades')
                    && url.searchParams.get('account_id') === accountId
                    && response.request().method() === 'GET'
                );
            }
        );

        await tradesAccountSelect.selectOption(accountId!);

        const tradesResponse = await tradesResponsePromise;

        expect(tradesResponse.ok()).toBe(true);

        // The test account was empty before the import,
        // so exactly one row for each CSV trade should exist.
        await expect(
            page.getByRole('cell', { name: 'EURUSD' })
        ).toHaveCount(1);

        await expect(
            page.getByRole('cell', { name: 'GBPUSD' })
        ).toHaveCount(1);
    } finally {
        // Always clean up the temporary account,
        // even if an assertion above fails.
        if (accountCreated) {
            await page.goto('/accounts');

            const accountCell = page.getByRole('cell', {
                name: accountName,
            });

            if (await accountCell.count() > 0) {
                const accountRow = page.getByRole('row').filter({
                    has: accountCell,
                });

                await accountRow
                    .getByRole('button', { name: 'Delete account' })
                    .click();

                await page
                    .getByRole('button', {
                        name: 'Delete permanently',
                    })
                    .click();

                await expect(accountCell).not.toBeVisible();
            }
        }
    }
});