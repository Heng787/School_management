# API Reference

## Overview

Base URL: `http://localhost:5000` (or as configured in `PORT`)
Authentication: JWT
Content type: `application/json`
Timestamps: ISO 8601 format

## Authentication

1. `POST /api/auth/login` with credentials (`identifier` and `password`).
2. Receive access token.
3. Include in protected requests:
   `Authorization: Bearer [token]`

## Error Format

```json
{
  "success": false,
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

| Code | Status | Meaning |
|---|---|---|
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource does not exist |
| VALIDATION_ERROR | 422 | Validation failed |
| CONFLICT | 409 | Resource already exists |
| SERVER_ERROR | 500 | Unexpected error |

## Endpoints

### Auth Domain

#### POST /api/auth/login
Description: Authenticates a user and returns a JWT token.
Auth required: No
Required role: None
Request:
- Body: `{ "identifier": "string (admin or phone number)", "password": "string" }`
Response 200:
`{ "success": true, "token": "...", "user": { "id": "...", "role": "..." } }`
Response 4xx:
`{ "success": false, "error": "Invalid credentials", "code": "UNAUTHORIZED" }`

### Sync Domain

#### GET /api/sync/:table
Description: Fetches all records from a specified database table.
Auth required: Yes
Required role: Varies based on table (Admin required for `config`, `staff`)
Request:
- Headers: `Authorization: Bearer [token]`
- Params: `:table` - string - name of the table
Response 200:
`{ "success": true, "data": [{...}] }`
Response 4xx:
`{ "success": false, "error": "Insufficient permissions", "code": "FORBIDDEN" }`

#### POST /api/sync/:table
Description: Synchronizes local records with the cloud database.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Params: `:table` - string - name of the table
- Body: `{ "items": [{...}] }`
Response 200:
`{ "success": true, "data": [...] }`

#### DELETE /api/sync/:table/:id
Description: Deletes a specific record.
Auth required: Yes
Required role: Admin
Request:
- Headers: `Authorization: Bearer [token]`
- Params: `:table` - string, `:id` - string
Response 200:
`{ "success": true }`

#### DELETE /api/sync/:table/all
Description: Deletes all records from a table (Factory Reset).
Auth required: Yes
Required role: Admin
Request:
- Headers: `Authorization: Bearer [token]`
- Params: `:table` - string
Response 200:
`{ "success": true }`

#### GET /api/sync/config/:key
Description: Fetches a specific configuration key value.
Auth required: Yes
Required role: Admin
Request:
- Headers: `Authorization: Bearer [token]`
- Params: `:key` - string
Response 200:
`{ "success": true, "data": "value" }`

### Messaging Domain

#### GET /api/messages
Description: Retrieves messages for a user.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Query: `userId` (string), `isAdmin` (boolean)
Response 200:
`{ "success": true, "data": [...] }`

#### GET /api/messages/unread
Description: Retrieves the unread message count for a user.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Query: `userId` (string), `isAdmin` (boolean)
Response 200:
`{ "success": true, "data": 5 }`

#### POST /api/messages
Description: Sends a new message.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Body: `{ "sender_id": "uuid", "receiver_id": "uuid", "content": "text" }`
Response 200:
`{ "success": true, "data": {...} }`

#### POST /api/messages/attachment
Description: Uploads an attachment to a message.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Body: Multipart Form Data with `file` field.
Response 200:
`{ "success": true, "data": { "url": "..." } }`

#### POST /api/messages/read
Description: Marks specific messages as read.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Body: `{ "messageIds": ["uuid", ...] }`
Response 200:
`{ "success": true }`

#### PATCH /api/messages/:id
Description: Updates a message's content or metadata.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Params: `:id` - string
- Body: `{ "content": "new text" }`
Response 200:
`{ "success": true, "data": {...} }`

#### DELETE /api/messages/:id
Description: Deletes a message.
Auth required: Yes
Required role: None
Request:
- Headers: `Authorization: Bearer [token]`
- Params: `:id` - string
Response 200:
`{ "success": true }`

### AI Domain

#### POST /api/ai/infer-gender
Description: Infers the gender of a student based on their name.
Auth required: Yes
Required role: Admin
Request:
- Headers: `Authorization: Bearer [token]`
- Body: `{ "name": "string" }`
Response 200:
`{ "success": true, "data": "Male" }`
