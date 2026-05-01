import { test, expect } from '@playwright/test';

test.describe('Sync Engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select#role', 'Admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show sync status in navbar', async ({ page }) => {
    // Check initial state
    const syncStatus = page.locator('text=Cloud Sync Active');
    await expect(syncStatus).toBeVisible();
  });

  test('should trigger saving state when data changes', async ({ page }) => {
    // Navigate to students
    await page.click('nav >> text=Students');
    
    // Perform an action that triggers a sync (e.g., delete a student or edit)
    // For simplicity, let's try to search which might not trigger sync, 
    // but editing a student name in the table (if editable) or adding one would.
    
    // Let's try adding a student
    await page.click('button:has-text("New Student")');
    await page.fill('input[name="name"]', 'Test Sync Student');
    await page.click('button:has-text("Save Student")');
    
    // After adding, the sync engine should trigger after 1s debounce
    // We expect to see "Saving..." briefly in the navbar
    await expect(page.locator('text=Saving...')).toBeVisible();
    
    // Then it should go back to "Cloud Sync Active"
    await expect(page.locator('text=Cloud Sync Active')).toBeVisible({ timeout: 10000 });
  });
});
