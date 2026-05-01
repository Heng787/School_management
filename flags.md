# Frontend Integration Flags (KEVIN)

FLAG-KEVIN-001
From: KEVIN
Severity: INFO
Affects: KEVIN, WIZ, ORACLE
Discovered during: Connecting UI to Backend (`core.js` and `LoginPage.jsx`)
Issue: The planned backend `authService` expected `{ email, password }` for login, but the `staff` table does not contain an `email` field. Furthermore, Admin login did not query the database.
Context: The frontend previously checked if `identifier` matches staff name/contact, or if logging in as Admin, checked the globally configured password.
Resolution: Modified backend `authController` and `authService` to expect `identifier`. Added fallback to query `config` table for Admin passwords.
Awaiting: ORACLE decision on whether to add `email` fields to `staff` in the future.

FLAG-KEVIN-002
From: KEVIN
Severity: INFO
Affects: KEVIN, WIZ, ORACLE
Discovered during: Sync Engine Refactoring (`core.js`)
Issue: The Sync Engine's `deleteRecord` requires a `DELETE` API endpoint, which was missing from the backend plan.
Resolution: Added `router.delete('/:table/:id')` to `syncRoutes.js` and `deleteRecord` logic to `syncController` and `syncService` to unblock KEVIN's work.
Awaiting: None (Resolved).
