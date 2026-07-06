import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {

  test('Admin should login successfully', async ({ page }) => {

    // Open Login Page
    await page.goto('http://localhost:8080/login');

    // Verify Login Page
    await expect(page).toHaveTitle(/Service|Track|CA/i);

    // Enter Credentials using placeholders
    await page.getByPlaceholder('admin@practice.local').fill('admin@practice.local');
    await page.getByPlaceholder('••••••••').fill('Admin@123');

    // Click Sign In
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify Dashboard Opens
    await expect(page).toHaveURL(/dashboard/);

    // Verify Dashboard Heading
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible();

  });

});