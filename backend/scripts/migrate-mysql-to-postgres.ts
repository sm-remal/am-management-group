/**
 * One-off data copy: legacy MySQL (Aiven/Railway) -> new PostgreSQL.
 *
 * 1. Point DATABASE_URL at the NEW PostgreSQL database and run `npm run db:deploy`
 *    (creates the empty schema).
 * 2. Set MYSQL_URL to the OLD database, e.g.
 *      MYSQL_URL="mysql://user:pass@host:port/am_management?ssl={\"rejectUnauthorized\":false}"
 * 3. npm run migrate:mysql-to-pg            (add --truncate to wipe target tables first)
 *
 * Tables are copied in foreign-key order inside one PostgreSQL transaction, so a failure
 * leaves the target untouched. Booleans (MySQL TINYINT) and dates are converted.
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import pg from "pg";

const TABLES: Array<{ name: string; booleans?: string[] }> = [
  { name: "users", booleans: ["isActive"] },
  { name: "companies", booleans: ["isMainCompany"] },
  { name: "settings" },
  { name: "services", booleans: ["isActive"] },
  { name: "projects", booleans: ["featured"] },
  { name: "project_images" },
  { name: "news" },
  { name: "jobs", booleans: ["isPublished"] },
  { name: "applications" },
  { name: "gallery", booleans: ["isPublished"] },
  { name: "inquiries" },
  { name: "team_members", booleans: ["isActive"] },
  { name: "social_links" },
];

const BATCH = 200;

async function main() {
  const mysqlUrl = process.env.MYSQL_URL;
  const pgUrl = process.env.DATABASE_URL;
  if (!mysqlUrl || !pgUrl) throw new Error("MYSQL_URL and DATABASE_URL are required");

  const truncate = process.argv.includes("--truncate");
  const source = await mysql.createConnection(mysqlUrl);
  const target = new pg.Client({
    connectionString: pgUrl,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  await target.connect();

  try {
    await target.query("BEGIN");

    if (truncate) {
      const list = TABLES.map((t) => `"${t.name}"`).join(", ");
      await target.query(`TRUNCATE ${list} CASCADE`);
      console.log("• target tables truncated");
    }

    for (const table of TABLES) {
      const [rows] = await source.query(`SELECT * FROM \`${table.name}\``);
      const records = rows as Record<string, unknown>[];

      if (records.length === 0) {
        console.log(`• ${table.name}: 0 rows`);
        continue;
      }

      const columns = Object.keys(records[0]);
      const columnSql = columns.map((c) => `"${c}"`).join(", ");

      for (let offset = 0; offset < records.length; offset += BATCH) {
        const chunk = records.slice(offset, offset + BATCH);
        const values: unknown[] = [];
        const tuples = chunk.map((row, rowIndex) => {
          const placeholders = columns.map((column, colIndex) => {
            let value = row[column];
            if (table.booleans?.includes(column) && value !== null && value !== undefined) {
              value = Boolean(Number(value));
            }
            values.push(value);
            return `$${rowIndex * columns.length + colIndex + 1}`;
          });
          return `(${placeholders.join(", ")})`;
        });

        await target.query(
          `INSERT INTO "${table.name}" (${columnSql}) VALUES ${tuples.join(", ")} ON CONFLICT DO NOTHING`,
          values,
        );
      }

      console.log(`✔ ${table.name}: ${records.length} rows`);
    }

    await target.query("COMMIT");
    console.log("Done. Verify counts, then switch the API to the PostgreSQL DATABASE_URL.");
  } catch (error) {
    await target.query("ROLLBACK");
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((error) => {
  console.error("Migration failed - nothing was written:", error);
  process.exitCode = 1;
});
