import { test, expect } from '@playwright/test';

test('Amazon OAuth connection wizard', async ({ page }) => {
  await page.goto('/integrations');
  await page.click('[data-testid="connect-amazon"]');

  await expect(page).toHaveURL(/integrations\/amazon\/wizard/);
  await expect(page.locator('h3, h2').first()).toBeVisible();

  await page.click('button:has-text("Get started")');
  await page.click('[data-testid="marketplace-DE"]');
  await page.click('[data-testid="wizard-next"]');

  await expect(page.locator('[data-testid="permissions-list"]')).toBeVisible();
  await page.click('[data-testid="connect-amazon-oauth"]');

  await expect(page.locator('[data-testid="synced-orders-preview"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('[data-testid="order-row"]')).toHaveCount(5);
  await page.click('[data-testid="generate-all-invoices"]');

  await expect(page.locator('[data-testid="integration-status"]')).toContainText('Connected');
});
