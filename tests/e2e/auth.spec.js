import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should login as admin and logout', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select#role', 'Admin');
    await page.fill('#password', 'admin123');
    await page.click('button:has-text("Sign In")');
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Logout via profile menu
    // Wait for the navbar to be stable
    const profileBtn = page.getByLabel('User profile menu');
    await profileBtn.waitFor();
    await profileBtn.click();
    
    // The menu might have an animation, so we wait for the Sign Out text to be visible
    const signOutBtn = page.getByRole('menuitem', { name: /Sign Out/i });
    await signOutBtn.waitFor();
    // Use force: true to bypass any pointer-event interception from the main content during animation
    await signOutBtn.click({ force: true });
    
    // Verify we are back on login page
    await expect(page.getByRole('heading', { name: 'Sign In to Portal' })).toBeVisible();
  });

  test('should fail login with wrong credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('#password', 'wrong_password');
    await page.click('button:has-text("Sign In")');
    
    // Expect error message
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Login failed');
  });
});
