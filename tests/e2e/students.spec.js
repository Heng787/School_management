import { test, expect } from '@playwright/test';

test.describe('Student Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Admin before each test
    await page.goto('/');
    await page.selectOption('select#role', 'Admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/);
    await page.click('nav >> text=Students');
    await expect(page).toHaveURL(/.*students/);
  });

  test('should open create student modal', async ({ page }) => {
    await page.click('button:has-text("New Student")');
    // Use getByRole for better reliability
    await expect(page.getByRole('heading', { name: 'Register New Student' })).toBeVisible();
  });

  test('should search for students', async ({ page }) => {
    // Correct selector from StudentSearchBar.jsx
    const searchInput = page.locator('#student-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('NonExistentStudent');
    // The table shows "No students found" when empty
    await expect(page.locator('text=No students found')).toBeVisible();
  });
});
