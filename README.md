## Prisma Commands

### `npm run prisma:format`

Formats the Prisma schema to keep it clean and properly structured.

### `npm run prisma:generate`

Generates the Prisma Client files based on the current schema.

### `npm run prisma:push`

Pushes schema changes directly to the database.

### `npm run prisma:studio`

Launches Prisma Studio, allowing you to manage and view your database through a GUI.



## API Response Format

All API endpoints follow a consistent response structure.

### Success Response

```json
{
  "success": true,
  "message": "success message heree",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "the message goes here",
  "error": {}
}
```

> **Production:** Never expose stack traces, internal errors, database details, or sensitive information to clients. Log detailed errors server-side and return only safe, meaningful error information.
