import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select#role', 'Admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display stats cards', async ({ page }) => {
    await expect(page.getByText('Total Students')).toBeVisible();
    await expect(page.getByText('Daily Attendance')).toBeVisible();
    await expect(page.getByText('Staff Availability')).toBeVisible();
  });

  test('should navigate to students from quick link', async ({ page }) => {
    // There is an "Add Student" button on the dashboard that navigates to students page
    await page.click('button:has-text("Add Student")');
    await expect(page).toHaveURL(/.*students/);
  });
});
