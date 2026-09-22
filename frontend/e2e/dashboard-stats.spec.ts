import { test, expect, type Page } from '@playwright/test';

async function addTrade(
    page: Page,
    trade: {
        symbol: string;
        direction: 'long' | 'short';
        entry: string;
        stop: string;
        exit: string;
        pnl: string;
        entryDatetime: string;
        exitDatetime: string;
    },
) {
    await page.getByRole('button', { name: /add trade/i }).click();

    await page
        .getByRole('textbox', { name: /Symbol/ })
        .fill(trade.symbol);

    await page
        .getByRole('combobox', { name: /Direction/ })
        .selectOption(trade.direction);

    await page
        .getByRole('spinbutton', { name: /Entry/ })
        .fill(trade.entry);

    await page
        .getByRole('spinbutton', { name: /Stop/ })
        .fill(trade.stop);

    await page
        .getByRole('spinbutton', { name: /Exit price/ })
        .fill(trade.exit);

    await page
        .getByRole('spinbutton', { name: /P\/L/ })
        .fill(trade.pnl);

    await page
        .getByLabel('Entry datetime')
        .fill(trade.entryDatetime);

    await page
        .getByLabel('Exit datetime')
        .fill(trade.exitDatetime);

    await page
        .getByRole('button', { name: 'Save Trade' })
        .click();

    // Wait until the trade has finished saving and the form has closed
    // before starting another trade.
    await expect(
        page.getByRole('button', { name: 'Save Trade' }),
    ).not.toBeVisible();
}

test('dashboard shows correct statistics for known trades', async ({ page }) => {
    test.setTimeout(60_000);

    const accountName = `E2E Stats Account ${Date.now()}`;
    let accountCreated = false;

    try {
        // The shared Playwright setup has already authenticated the demo user.
        await page.goto('/accounts');
        await expect(page).toHaveURL('/accounts');

        // Create an isolated account so the expected statistics are deterministic.
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

        // Trade 1:
        // +500 P/L
        // Long: (120 - 100) / (100 - 90) = +2R
        await addTrade(page, {
            symbol: `STATWIN${Date.now()}`,
            direction: 'long',
            entry: '100',
            stop: '90',
            exit: '120',
            pnl: '500',
            entryDatetime: '2026-09-20T10:00',
            exitDatetime: '2026-09-20T12:00',
        });

        // Trade 2:
        // -200 P/L
        // Short: (100 - 105) / (110 - 100) = -0.5R
        await addTrade(page, {
            symbol: `STATLOSS${Date.now()}`,
            direction: 'short',
            entry: '100',
            stop: '110',
            exit: '105',
            pnl: '-200',
            entryDatetime: '2026-09-21T10:00',
            exitDatetime: '2026-09-21T12:00',
        });

        /*
         * Expected statistics:
         *
         * Total Trades = 2
         * Win Rate     = 50%
         * Total P/L    = 500 - 200 = 300
         * Balance      = 10000 + 300 = 10300
         * Total R      = 2R - 0.5R = 1.5R
         * Average R    = 1.5R / 2 = 0.75R
         */

        const totalRCard = page
            .getByText('Total R', { exact: true })
            .locator('..');

        await expect(totalRCard)
            .toContainText('1.50R');

        const winRateCard = page
            .getByText('Win Rate', { exact: true })
            .locator('..');

        await expect(winRateCard)
            .toContainText('50.0%');

        const averageRCard = page
            .getByText('Average R', { exact: true })
            .locator('..');

        await expect(averageRCard)
            .toContainText('0.75R');

        const totalTradesCard = page
            .getByText('Total Trades', { exact: true })
            .locator('..');

        await expect(totalTradesCard)
            .toContainText('2');

        await expect(
            page.getByText('EUR 300', { exact: true }),
        ).toBeVisible();

        const balanceCard = page
            .getByText('Balance', { exact: true })
            .locator('..');

        await expect(balanceCard)
            .toContainText('EUR 10,300');
    } finally {
        // Cleanup should never hide the real test failure.
        if (accountCreated && !page.isClosed()) {
            try {
                await page.goto('/accounts');

                const accountCell = page.getByRole('cell', {
                    name: accountName,
                });

                await expect(accountCell).toBeVisible();

                const accountRow = page
                    .getByRole('row')
                    .filter({
                        has: accountCell,
                    });

                await accountRow
                    .getByRole('button', {
                        name: 'Delete account',
                    })
                    .click();

                await page
                    .getByRole('button', {
                        name: 'Delete permanently',
                    })
                    .click();

                await expect(accountCell)
                    .not.toBeVisible();
            } catch (cleanupError) {
                console.warn(
                    'E2E cleanup failed:',
                    cleanupError,
                );
            }
        }
    }
});