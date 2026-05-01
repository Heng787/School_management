# Backend Flags (WIZ)

FLAG 001
Location: `src/services/authService.js`
Issue: Plain text passwords in database during transition.
Options:
A) Immediately block all plain text logins and require the migration script to run.
B) Allow a fallback to plaintext login until the migration script completes, but risk allowing unmigrated credentials to persist in code.
Recommendation: A — Since the backend is completely new, it's safer to mandate the DB migration (`scripts/migratePasswords.js`) before turning the backend live. However, I have temporarily allowed fallback (Option B) to ensure existing dev environments don't instantly break without the migration.
Status: Awaiting Architect confirmation to remove fallback.

FLAG 002
Location: `src/controllers/syncController.js`
Issue: LIZ's plan specifies role-based protection (Admin vs Teacher) for tables like `staff` and `config`, but the exact granular permissions weren't fully enumerated.
Options:
A) Broad-strokes protection (only Admins can fetch/edit `staff` and `config`).
B) Granular protection (Teachers can view `config`, but not edit).
Recommendation: A — Implemented strict protection for now as a safe default.
Status: Awaiting KEVIN/LIZ confirmation if teachers need read access to these tables.

FLAG 003
Location: `src/routes/messageRoutes.js`, `src/routes/syncRoutes.js`
Issue: The frontend made calls to `/api/messages`, `/api/sync/config/:key`, and `/api/sync/:table/all` that were not implemented in the backend, causing the app to crash due to EADDRINUSE proxy errors when the node server didn't handle them. Additionally, `multer` was not installed for handling attachments.
Resolution: I've added the missing routes, installed `multer`, implemented the `messageService` with database queries, added the `config` conflict key handling, and updated the `.env` with a placeholder JWT secret and Service Role Key to allow the server to start properly.
Status: RESOLVED - Work completed.
