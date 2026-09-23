# MySQL Dump to Neon PostgreSQL Migration

This document explains how the `am_management_group (3).sql` MySQL dump was converted and imported into the cloud Neon PostgreSQL database.

## Source and Target

Source database dump:

```text
C:\Users\User\Downloads\am_management_group (3).sql
```

Target database:

```text
Neon PostgreSQL
```

The target connection was read from:

```text
backend/.env
DATABASE_URL
```

## Step 1: Inspect the MySQL Dump

The SQL dump was checked first to confirm:

- It was exported from phpMyAdmin / MariaDB.
- It contained `CREATE TABLE` statements.
- It contained `INSERT INTO` statements with actual data.
- The table names matched the current project tables.

Important tables found:

```text
users
companies
settings
services
projects
project_images
news
jobs
applications
gallery
inquiries
team_members
social_links
```

## Step 2: Prepare Neon PostgreSQL Schema

Before importing data, the PostgreSQL tables had to exist in Neon.

The Prisma migrations were checked/applied using:

```powershell
cd backend
npx prisma migrate status
```

The result showed:

```text
Database schema is up to date
```

That means Neon already had the required PostgreSQL tables and columns.

## Step 3: Read Data From the MySQL Dump

Instead of restoring the dump into a local MySQL server first, the dump file was parsed directly.

The importer read only the `INSERT INTO` data from the dump.

It ignored MySQL-only structure commands like:

```sql
CREATE TABLE
LOCK TABLES
ALTER TABLE
SET SQL_MODE
```

The PostgreSQL schema was already handled by Prisma, so only row data needed to be copied.

## Step 4: Convert MySQL Values for PostgreSQL

Some MySQL values needed conversion before inserting into PostgreSQL.

Boolean fields were converted from MySQL `0` / `1` into PostgreSQL `false` / `true`.

Examples:

```text
companies.isMainCompany
users.isActive
services.isActive
projects.featured
jobs.isPublished
gallery.isPublished
team_members.isActive
```

Date/time strings were inserted as PostgreSQL-compatible timestamp values.

Text values, URLs, emails, descriptions, and enum values were copied as-is.

## Step 5: Insert Data in Foreign-Key Order

Data was inserted in dependency order so foreign keys would not fail.

Import order:

```text
users
companies
settings
services
projects
project_images
news
jobs
applications
gallery
inquiries
team_members
social_links
```

For example:

- `companies` must exist before `projects`.
- `projects` must exist before `project_images`.
- `jobs` must exist before `applications`.

## Step 6: Insert Into Neon PostgreSQL

The import used PostgreSQL `INSERT` statements.

Duplicate rows were skipped safely using:

```sql
ON CONFLICT DO NOTHING
```

That means if a row already existed, the import did not crash or duplicate it.

## Step 7: Verify Imported Row Counts

After importing, row counts were checked directly from Neon.

Final imported counts:

```text
users: 4
companies: 6
settings: 31
services: 21
projects: 11
project_images: 33
news: 2
jobs: 4
applications: 1
gallery: 9
inquiries: 1
team_members: 0
social_links: 0
```

## Step 8: Verify Sample Data

A sample Neon query was run for companies.

It returned records such as:

```text
BM Magnitude Services
MA Travel and Tour
AM Management Group
```

That confirmed the data was successfully available in the Neon PostgreSQL database.

## Important Notes

The MySQL dump file itself was not used as the database schema source.

The schema source is still:

```text
backend/prisma/schema.prisma
backend/prisma/migrations
```

The MySQL dump was used only as the data source.

The import did not require changing application code.

## If This Needs To Be Repeated

Use this flow:

1. Make sure `backend/.env` points `DATABASE_URL` to the correct Neon database.
2. Run Prisma migration status:

```powershell
cd backend
npx prisma migrate status
```

3. Make sure the schema is up to date.
4. Import the MySQL dump data into the existing PostgreSQL tables.
5. Verify row counts.
6. Restart backend and frontend.

## After Import

Run the app normally:

```powershell
# backend
cd backend
npm run dev
```

```powershell
# frontend
cd frontend
npm run dev
```

The frontend reads data from:

```text
NEXT_PUBLIC_API_BASE_URL
```

The backend reads data from Neon using:

```text
DATABASE_URL
```
