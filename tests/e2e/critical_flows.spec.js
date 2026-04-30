import { test, expect } from '@playwright/test';

test.describe('School Admin Portal Critical Flows', () => {
  
  test('should login and navigate through sidebar', async ({ page }) => {
    // 1. Navigate to home (Login page)
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // 2. Perform Login
    // Ensure we are in Admin mode (it's default, but let's be sure)
    await page.selectOption('select#role', 'Admin');
    
    // Fill password using ID
    await page.fill('#password', 'admin123');
    
    // Click login button
    await page.click('button:has-text("Sign In")');
    
    // 3. Verify Dashboard loads
    // Increased timeout for redirection
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // 4. Navigate to Students
    await page.click('nav >> text=Students');
    await expect(page).toHaveURL(/.*students/);
    
    // 5. Navigate to Staff
    await page.click('nav >> text=Staff');
    await expect(page).toHaveURL(/.*staff/);
  });

  test('should show dashboard data', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select#role', 'Admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');
    
    await expect(page).toHaveURL(/.*dashboard/);
    // Verify specific data card exists on Dashboard
    await expect(page.locator('text=Total Students')).toBeVisible();
  });
});
