import { test, expect } from '@playwright/test';

test('demo user can create, edit and delete a trade', async ({ page }) => {
    const accountName = `E2E Trade Account ${Date.now()}`;
    const tradeSymbol = `E2E${Date.now()}`;

    // The shared Playwright setup has already authenticated the demo user.
    await page.goto('/');
    await expect(page).toHaveURL('/');

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

    await expect(
        page.getByRole('cell', { name: accountName })
    ).toBeVisible();

    // Return to the dashboard and select the account created by this test.
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');

    await page.getByRole('combobox').first().selectOption({
        label: accountName,
    });

    // Open the trade form.
    await page.getByRole('button', { name: /add trade/i }).click();

    // Create a trade with known values.
    await page.getByRole('textbox', { name: /Symbol/ }).fill(tradeSymbol);
    await page.getByRole('combobox', { name: /Direction/ }).selectOption('long');

    await page.getByRole('spinbutton', { name: /Entry/ }).fill('100');
    await page.getByRole('spinbutton', { name: /Stop/ }).fill('90');
    await page.getByRole('spinbutton', { name: /Exit price/ }).fill('120');
    await page.getByRole('spinbutton', { name: /P\/L/ }).fill('500');

    await page.getByLabel('Entry datetime').fill('2026-09-20T10:00');
    await page.getByLabel('Exit datetime').fill('2026-09-20T12:00');

    await page.getByRole('button', { name: 'Save Trade' }).click();

    const tradeCell = page.getByRole('cell', { name: tradeSymbol });

    await expect(tradeCell).toBeVisible();

    const tradeRow = page.getByRole('row').filter({
        has: tradeCell,
    });

    // Edit the trade.
    await tradeRow
        .getByRole('button', { name: 'Edit trade' })
        .click();

    await tradeRow
        .getByLabel('Edit symbol')
        .fill(`${tradeSymbol}-EDITED`);

    await tradeRow
        .getByLabel('Edit P/L')
        .fill('750');

    await tradeRow
        .getByRole('button', { name: 'Save trade' })
        .click();

    // Verify the updated values.
    await expect(
        page.getByRole('cell', { name: `${tradeSymbol}-EDITED` })
    ).toBeVisible();

    await expect(
        page.getByRole('cell', { name: '750' })
    ).toBeVisible();

    const editedTradeCell = page.getByRole('cell', {
        name: `${tradeSymbol}-EDITED`,
    });

    const editedTradeRow = page.getByRole('row').filter({
        has: editedTradeCell,
    });

    // Delete the trade.
    await editedTradeRow
        .getByRole('button', { name: 'Delete trade' })
        .click();

    await page
        .getByRole('button', { name: 'Delete permanently' })
        .click();

    await expect(editedTradeCell).not.toBeVisible();

    // Delete the account created by the test.
    await page.getByRole('link', { name: 'Accounts' }).click();

    const accountCell = page.getByRole('cell', { name: accountName });

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