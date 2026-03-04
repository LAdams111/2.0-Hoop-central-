# Hoop Central 2.0 — Database

Database name: **hoop_central**

## Setup

1. Create the database (once):

   ```bash
   npm run db:create
   ```
   or:
   ```bash
   createdb hoop_central
   ```

2. Apply the schema:

   ```bash
   npm run db:schema
   ```
   or:
   ```bash
   psql -d hoop_central -f db/schema.sql
   ```

Ensure PostgreSQL is running and your user has permission to create databases.
