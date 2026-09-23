/**
 * Seed for a fresh PostgreSQL database — AM Management Group website v3.
 * Content comes from prisma/seed-data.json (company profile 2026 + previous site data).
 * Idempotent: safe to run more than once.
 *
 *   npm run db:seed
 *
 * Env: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME (optional)
 * Images referenced as /images/... are served by the Next.js frontend (frontend/public/images).
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

type Category =
  | "MANAGEMENT_INVESTMENT"
  | "CLEANING_SERVICES"
  | "ENGINEERING_MACHINERY"
  | "PLANTATION_AGRICULTURE"
  | "RETAIL_TRADING"
  | "TRAVEL_TOURISM";

type SeedData = {
  settings: Record<string, string>;
  companies: Array<{
    slug: string;
    name: string;
    category: Category;
    isMainCompany?: boolean;
    displayOrder: number;
    shortDescription: string;
    description: string;
    registrationNumber?: string;
    establishedDate?: string;
    address?: string;
    phone?: string;
    email?: string;
    businessHours?: string;
    coverImage?: string;
    services: Array<[string, string]>;
  }>;
  projects: Array<{
    slug: string;
    name: string;
    status: "UPCOMING" | "ONGOING" | "COMPLETED";
    featured: boolean;
    displayOrder: number;
    clientName?: string;
    location: string;
    startDate?: string;
    endDate?: string;
    description: string;
    scope?: string;
    highlights?: string;
    coverImage?: string;
    images: Array<[string, string]>;
  }>;
  gallery: Array<[string, string, string]>;
  news: Array<{
    slug: string;
    title: string;
    category: string;
    publishedAt: string;
    excerpt: string;
    content: string;
    coverImage?: string;
  }>;
  jobs: Array<{
    slug: string;
    title: string;
    company: string;
    location: string;
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
    description: string;
    requirements: string;
  }>;
};

// package.json is "type": "module", so resolve the folder from import.meta.url
const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, "seed-data.json"), "utf8")) as SeedData;

const slugify = (value: string) =>
  value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const imagePath = (file: string) =>
  file.startsWith("../office/") ? `/images/office/${file.slice(10)}` : `/images/projects/${file}`;

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("• SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set - skipping admin user");
    return null;
  }
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.SEED_ADMIN_NAME || "Administrator",
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });
  console.log(`✔ admin user ready: ${email}`);
  return user;
}

async function main() {
  const admin = await seedAdmin();

  // Settings
  for (const [key, value] of Object.entries(data.settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log(`✔ ${Object.keys(data.settings).length} settings`);

  // Companies + services
  const companyIds = new Map<string, string>();
  let serviceCount = 0;
  for (const { services, establishedDate, ...company } of data.companies) {
    const record = await prisma.company.upsert({
      where: { slug: company.slug },
      update: {},
      create: {
        ...company,
        establishedDate: establishedDate ? new Date(establishedDate) : undefined,
        status: "PUBLISHED",
      },
    });
    companyIds.set(company.slug, record.id);

    for (const [index, [title, description]] of services.entries()) {
      const slug = slugify(title);
      await prisma.service.upsert({
        where: { companyId_slug: { companyId: record.id, slug } },
        update: {},
        create: { companyId: record.id, title, slug, description, displayOrder: index + 1 },
      });
      serviceCount += 1;
    }
  }
  console.log(`✔ ${data.companies.length} companies, ${serviceCount} services`);

  // Projects (all delivered by the holding company)
  const mainId = companyIds.get("am-management-group");
  if (!mainId) throw new Error("Main company missing from seed data");
  for (const { images, startDate, endDate, ...project } of data.projects) {
    const existing = await prisma.project.findUnique({ where: { slug: project.slug } });
    if (existing) continue;
    await prisma.project.create({
      data: {
        ...project,
        companyId: mainId,
        category: "MANAGEMENT_INVESTMENT",
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        publishStatus: "PUBLISHED",
        images: {
          create: images.map(([file, caption], order) => ({
            imageUrl: imagePath(file),
            caption,
            order,
          })),
        },
      },
    });
  }
  console.log(`✔ ${data.projects.length} projects`);

  // Gallery (only when empty, so admin edits are never duplicated)
  if ((await prisma.galleryImage.count()) === 0) {
    await prisma.galleryImage.createMany({
      data: data.gallery.map(([file, title, category], index) => ({
        imageUrl: imagePath(file),
        title,
        category,
        companyId: mainId,
        displayOrder: index + 1,
        isPublished: true,
      })),
    });
  }
  console.log(`✔ gallery ready`);

  // News
  for (const article of data.news) {
    await prisma.news.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        publishedAt: new Date(article.publishedAt),
        status: "PUBLISHED",
        authorId: admin?.id,
      },
    });
  }
  console.log(`✔ ${data.news.length} news articles`);

  // Jobs
  for (const { company, ...job } of data.jobs) {
    const companyId = companyIds.get(company);
    if (!companyId) continue;
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: { ...job, companyId, isPublished: true },
    });
  }
  console.log(`✔ ${data.jobs.length} jobs`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
