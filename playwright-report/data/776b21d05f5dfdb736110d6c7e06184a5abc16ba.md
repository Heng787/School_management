# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Authentication Flows >> should login as admin and logout
- Location: tests\e2e\auth.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Sign In to Portal' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Sign In to Portal' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to main content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - complementary "Application Sidebar" [ref=e5]:
    - generic [ref=e7]:
      - generic [ref=e8]: S
      - heading "SchoolAdmin" [level=2] [ref=e9]
    - navigation "Main Navigation" [ref=e10]:
      - generic [ref=e11]: Main Menu
      - list [ref=e12]:
        - button "Dashboard" [ref=e13] [cursor=pointer]:
          - img [ref=e15]
          - generic [ref=e17]: Dashboard
        - button "Students" [ref=e19] [cursor=pointer]:
          - img [ref=e21]
          - generic [ref=e23]: Students
        - button "Staff" [ref=e24] [cursor=pointer]:
          - img [ref=e26]
          - generic [ref=e28]: Staff
        - button "Classes" [ref=e29] [cursor=pointer]:
          - img [ref=e31]
          - generic [ref=e34]: Classes
        - button "Schedule" [ref=e35] [cursor=pointer]:
          - img [ref=e37]
          - generic [ref=e39]: Schedule
        - button "Messages" [ref=e40] [cursor=pointer]:
          - img [ref=e42]
          - generic [ref=e44]: Messages
      - generic [ref=e45]: Analytics
      - list [ref=e46]:
        - listitem [ref=e47]:
          - button "Reports" [ref=e48] [cursor=pointer]:
            - generic [ref=e49]:
              - img [ref=e51]
              - generic [ref=e53]: Reports
            - img [ref=e54]
    - button "Settings System config" [ref=e57] [cursor=pointer]:
      - img [ref=e58]
      - generic [ref=e61]:
        - paragraph [ref=e62]: Settings
        - paragraph [ref=e63]: System config
  - generic [ref=e64]:
    - banner [ref=e65]:
      - generic [ref=e66]:
        - button "Collapse sidebar" [ref=e67] [cursor=pointer]:
          - img [ref=e68]
        - generic [ref=e70]:
          - button "Go to Dashboard" [ref=e71] [cursor=pointer]: SchoolAdmin
          - img [ref=e72]
          - generic [ref=e74]:
            - img [ref=e76]
            - generic [ref=e78]: Dashboard
      - generic [ref=e82]:
        - img [ref=e84]
        - textbox "Search students, teachers, classes..." [ref=e86]
      - generic [ref=e87]:
        - button "Switch to Dark Mode" [ref=e88] [cursor=pointer]:
          - img [ref=e89]
        - button "Messages" [ref=e91] [cursor=pointer]:
          - img [ref=e92]
        - generic [ref=e94]:
          - img [ref=e96]
          - generic [ref=e98]:
            - generic [ref=e99]: Saving...
            - generic [ref=e100]: "Last sync: 11:07 AM"
        - generic [ref=e102]:
          - generic [ref=e103]:
            - paragraph [ref=e104]: Administrator
            - paragraph [ref=e105]: admin
          - button "User profile menu" [ref=e107] [cursor=pointer]:
            - generic [ref=e108]: A
    - main [ref=e109]:
      - generic [ref=e111]:
        - generic [ref=e112]:
          - generic [ref=e113]:
            - heading "Admin Dashboard" [level=1] [ref=e114]
            - paragraph [ref=e115]: Welcome back, Administrator. Here's what's happening today.
          - generic [ref=e118]: Friday, May 1, 2026
        - generic [ref=e119]:
          - generic [ref=e120]:
            - generic [ref=e123]:
              - generic [ref=e124]:
                - paragraph [ref=e125]: Total Students
                - heading "0" [level=3] [ref=e127]
                - generic [ref=e129]: +0 new this month
              - img [ref=e131]
            - generic [ref=e135]:
              - generic [ref=e136]:
                - paragraph [ref=e137]: Daily Attendance
                - heading "0%" [level=3] [ref=e139]
                - generic [ref=e141]: 2% vs yesterday
              - img [ref=e143]
            - generic [ref=e147]:
              - generic [ref=e148]:
                - paragraph [ref=e149]: Staff Availability
                - generic [ref=e150]:
                  - heading "0" [level=3] [ref=e151]
                  - generic [ref=e152]: / 0
                - generic [ref=e154]: 0 requests pending
              - img [ref=e156]
            - generic [ref=e158]:
              - heading "Enrollment Trend" [level=3] [ref=e160]
              - application [ref=e166]
          - generic [ref=e167]:
            - button "Add Student" [ref=e168] [cursor=pointer]:
              - img [ref=e169]
              - text: Add Student
            - button "Announcement" [ref=e171] [cursor=pointer]:
              - img [ref=e172]
              - text: Announcement
            - button "Schedule Event" [ref=e174] [cursor=pointer]:
              - img [ref=e175]
              - text: Schedule Event
            - button "Export Data" [ref=e177] [cursor=pointer]:
              - img [ref=e178]
              - text: Export Data
          - generic [ref=e180]:
            - generic [ref=e181]:
              - generic [ref=e182]:
                - heading "Average Performance by Level" [level=3] [ref=e184]
                - generic [ref=e189]: No performance data available
              - generic [ref=e190]:
                - generic [ref=e191]:
                  - heading "Top Performing Classes" [level=3] [ref=e193]
                  - paragraph [ref=e197]: No grade data available
                - generic [ref=e198]:
                  - heading "At-Risk Students (Avg < 5.0)" [level=3] [ref=e200]
                  - generic [ref=e204]:
                    - img [ref=e205]
                    - text: No students currently at risk!
            - generic [ref=e207]:
              - generic [ref=e208]:
                - heading "Upcoming Events" [level=3] [ref=e210]
                - generic [ref=e213]:
                  - generic [ref=e214]:
                    - generic [ref=e215]:
                      - generic [ref=e216]: May
                      - generic [ref=e217]: "3"
                    - generic [ref=e218]:
                      - heading "Parent-Teacher Meeting" [level=4] [ref=e219]
                      - paragraph [ref=e220]: Annual progress review with parents.
                  - generic [ref=e221]:
                    - generic [ref=e222]:
                      - generic [ref=e223]: May
                      - generic [ref=e224]: "5"
                    - generic [ref=e225]:
                      - heading "Royal Ploughing Ceremony" [level=4] [ref=e226]
                      - paragraph [ref=e227]: Public Holiday
                  - generic [ref=e228]:
                    - generic [ref=e229]:
                      - generic [ref=e230]: May
                      - generic [ref=e231]: "11"
                    - generic [ref=e232]:
                      - heading "Science Fair 2026" [level=4] [ref=e233]
                      - paragraph [ref=e234]: Student project exhibitions in the main hall.
              - generic [ref=e235]:
                - generic [ref=e236]:
                  - heading "Recent Activity" [level=3] [ref=e237]
                  - button "Clear" [ref=e238] [cursor=pointer]
                - generic [ref=e240]:
                  - generic [ref=e241]:
                    - img [ref=e243]
                    - generic [ref=e245]:
                      - paragraph [ref=e246]: Alice Johnson checked in
                      - generic [ref=e247]:
                        - generic [ref=e248]: 11:06 AM
                        - generic [ref=e249]: — Student "Alice Johnson" enrollment approved
                  - generic [ref=e250]:
                    - img [ref=e252]
                    - generic [ref=e254]:
                      - paragraph [ref=e255]: Staff checked in
                      - generic [ref=e256]:
                        - generic [ref=e257]: 11:06 AM
                        - generic [ref=e258]: — Daily attendance marked for Class K1A
                  - generic [ref=e259]:
                    - img [ref=e261]
                    - generic [ref=e263]:
                      - paragraph [ref=e264]: John Smith checked in
                      - generic [ref=e265]:
                        - generic [ref=e266]: 11:06 AM
                        - generic [ref=e267]: — New staff member "John Smith" added
                  - generic [ref=e268]:
                    - img [ref=e270]
                    - generic [ref=e272]:
                      - paragraph [ref=e273]: Staff checked in
                      - generic [ref=e274]:
                        - generic [ref=e275]: 11:06 AM
                        - generic [ref=e276]: — Academic calendar updated for Q2
              - heading "Today's Staff Status" [level=3] [ref=e279]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flows', () => {
  4  |   test('should login as admin and logout', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.selectOption('select#role', 'Admin');
  7  |     await page.fill('#password', 'admin123');
  8  |     await page.click('button:has-text("Sign In")');
  9  |     
  10 |     await expect(page).toHaveURL(/.*dashboard/);
  11 |     
  12 |     // Logout via profile menu
  13 |     // Wait for the navbar to be stable
  14 |     const profileBtn = page.getByLabel('User profile menu');
  15 |     await profileBtn.waitFor();
  16 |     await profileBtn.click();
  17 |     
  18 |     // The menu might have an animation, so we wait for the Sign Out text to be visible
  19 |     const signOutBtn = page.getByRole('menuitem', { name: /Sign Out/i });
  20 |     await signOutBtn.waitFor();
  21 |     // Use force: true to bypass any pointer-event interception from the main content during animation
  22 |     await signOutBtn.click({ force: true });
  23 |     
  24 |     // Verify we are back on login page
> 25 |     await expect(page.getByRole('heading', { name: 'Sign In to Portal' })).toBeVisible();
     |                                                                            ^ Error: expect(locator).toBeVisible() failed
  26 |   });
  27 | 
  28 |   test('should fail login with wrong credentials', async ({ page }) => {
  29 |     await page.goto('/');
  30 |     await page.fill('#password', 'wrong_password');
  31 |     await page.click('button:has-text("Sign In")');
  32 |     
  33 |     // Expect error message
  34 |     const errorAlert = page.locator('[role="alert"]');
  35 |     await expect(errorAlert).toBeVisible();
  36 |     await expect(errorAlert).toContainText('Login failed');
  37 |   });
  38 | });
  39 | 
```