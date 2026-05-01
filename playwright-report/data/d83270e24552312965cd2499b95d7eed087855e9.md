# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sync.spec.js >> Sync Engine >> should trigger saving state when data changes
- Location: tests\e2e\sync.spec.js:18:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Saving...')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Saving...')

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
        - button "Students" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
          - generic [ref=e22]: Students
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
            - generic [ref=e78]: Students
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
            - generic [ref=e99]: Cloud Sync Active
            - generic [ref=e100]: "Last sync: 11:07 AM"
        - generic [ref=e102]:
          - generic [ref=e103]:
            - paragraph [ref=e104]: Administrator
            - paragraph [ref=e105]: admin
          - button "User profile menu" [ref=e107] [cursor=pointer]:
            - generic [ref=e108]: A
    - main [ref=e109]:
      - generic [ref=e111]:
        - link "Skip to main content" [ref=e112] [cursor=pointer]:
          - /url: "#main-content"
        - generic [ref=e114]:
          - generic [ref=e115]:
            - heading "Student Records" [level=1] [ref=e116]
            - paragraph [ref=e117]: Manage enrollments, levels and student data
          - generic [ref=e118]:
            - button "CSV" [ref=e119] [cursor=pointer]:
              - img [ref=e120]
              - text: CSV
            - button "Excel" [ref=e122] [cursor=pointer]:
              - img [ref=e123]
              - text: Excel
            - button "Template" [ref=e125] [cursor=pointer]:
              - img [ref=e126]
              - text: Template
            - button "Import CSV/XLSX" [ref=e128] [cursor=pointer]:
              - img [ref=e129]
              - text: Import CSV/XLSX
            - button "New Student" [active] [ref=e131] [cursor=pointer]:
              - img [ref=e132]
              - text: New Student
        - generic [ref=e134]:
          - generic [ref=e136]:
            - generic [ref=e137]: Search students by name, ID, or phone
            - generic:
              - img
            - textbox "Search students by name, ID, or phone" [ref=e138]:
              - /placeholder: Search by name, ID, or phone…
          - generic [ref=e140]:
            - generic [ref=e141]:
              - generic [ref=e142]: Filter by Class
              - combobox "Filter by Class" [ref=e143] [cursor=pointer]:
                - option "All Classes" [selected]
              - generic:
                - img
            - generic [ref=e144]:
              - generic [ref=e145]: Filter by Status
              - combobox "Filter by Status" [ref=e146] [cursor=pointer]:
                - option "All Status" [selected]
                - option "Active"
                - option "Inactive"
              - generic:
                - img
        - generic [ref=e147]:
          - table [ref=e149]:
            - rowgroup [ref=e150]:
              - row "Select all students on current page Name Gender DOB Contact Class Status Actions" [ref=e151]:
                - columnheader "Select all students on current page" [ref=e152]:
                  - checkbox "Select all students on current page" [ref=e153] [cursor=pointer]
                - columnheader "Name" [ref=e154]
                - columnheader "Gender" [ref=e155]
                - columnheader "DOB" [ref=e156]
                - columnheader "Contact" [ref=e157]
                - columnheader "Class" [ref=e158]
                - columnheader "Status" [ref=e159]
                - columnheader "Actions" [ref=e160]
            - rowgroup [ref=e161]:
              - row "Select student Test Sync Student Avatar for Test Sync Student Test Sync Student s1 Male N/A No contact Not enrolled Pending Edit student Test Sync Student Delete student Test Sync Student View report card for Test Sync Student" [ref=e162]:
                - cell "Select student Test Sync Student" [ref=e163]:
                  - checkbox "Select student Test Sync Student" [ref=e164] [cursor=pointer]
                - cell "Avatar for Test Sync Student Test Sync Student s1" [ref=e165]:
                  - generic [ref=e166]:
                    - img "Avatar for Test Sync Student" [ref=e167]: T
                    - generic [ref=e168]:
                      - paragraph [ref=e169]: Test Sync Student
                      - paragraph [ref=e170]: s1
                - cell "Male" [ref=e171]:
                  - generic [ref=e172]:
                    - img [ref=e173]
                    - text: Male
                - cell "N/A" [ref=e177]
                - cell "No contact" [ref=e178]
                - cell "Not enrolled" [ref=e179]:
                  - generic [ref=e180]:
                    - img [ref=e181]
                    - text: Not enrolled
                - cell "Pending" [ref=e183]:
                  - generic [ref=e184]: Pending
                - cell "Edit student Test Sync Student Delete student Test Sync Student View report card for Test Sync Student" [ref=e186]:
                  - generic [ref=e187]:
                    - button "Edit student Test Sync Student" [ref=e188] [cursor=pointer]:
                      - img [ref=e189]
                    - button "Delete student Test Sync Student" [ref=e191] [cursor=pointer]:
                      - img [ref=e192]
                    - button "View report card for Test Sync Student" [ref=e194] [cursor=pointer]:
                      - img [ref=e195]
                      - text: Report Card
          - generic [ref=e197]:
            - paragraph [ref=e198]: Showing 1 – 1 of 1
            - generic [ref=e199]:
              - combobox "Items per page" [ref=e200] [cursor=pointer]:
                - option "10 / page" [selected]
                - option "25 / page"
                - option "50 / page"
              - generic [ref=e201]:
                - button "Previous Page" [disabled] [ref=e202]:
                  - img [ref=e203]
                - generic [ref=e205]: 1 / 1
                - button "Next Page" [disabled] [ref=e206]:
                  - img [ref=e207]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Sync Engine', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.selectOption('select#role', 'Admin');
  7  |     await page.fill('#password', 'admin123');
  8  |     await page.click('button:has-text("Sign In")');
  9  |     await expect(page).toHaveURL(/.*dashboard/);
  10 |   });
  11 | 
  12 |   test('should show sync status in navbar', async ({ page }) => {
  13 |     // Check initial state
  14 |     const syncStatus = page.locator('text=Cloud Sync Active');
  15 |     await expect(syncStatus).toBeVisible();
  16 |   });
  17 | 
  18 |   test('should trigger saving state when data changes', async ({ page }) => {
  19 |     // Navigate to students
  20 |     await page.click('nav >> text=Students');
  21 |     
  22 |     // Perform an action that triggers a sync (e.g., delete a student or edit)
  23 |     // For simplicity, let's try to search which might not trigger sync, 
  24 |     // but editing a student name in the table (if editable) or adding one would.
  25 |     
  26 |     // Let's try adding a student
  27 |     await page.click('button:has-text("New Student")');
  28 |     await page.fill('input[name="name"]', 'Test Sync Student');
  29 |     await page.click('button:has-text("Save Student")');
  30 |     
  31 |     // After adding, the sync engine should trigger after 1s debounce
  32 |     // We expect to see "Saving..." briefly in the navbar
> 33 |     await expect(page.locator('text=Saving...')).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  34 |     
  35 |     // Then it should go back to "Cloud Sync Active"
  36 |     await expect(page.locator('text=Cloud Sync Active')).toBeVisible({ timeout: 10000 });
  37 |   });
  38 | });
  39 | 
```