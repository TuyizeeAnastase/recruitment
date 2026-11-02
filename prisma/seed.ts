import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

  const previous = await prisma.hrUser.findUnique({
    where: { email: "hr@horizonlabs.com" },
  });
  if (previous) {
    await prisma.hrUser.update({
      where: { id: previous.id },
      data: { email: "hr@boarwanda.com" },
    });
  }

  const hr = await prisma.hrUser.upsert({
    where: { email: "hr@boarwanda.com" },
    update: { passwordHash, name: "Amina Nkusi", role: "ADMIN", isActive: true },
    create: {
      email: "hr@boarwanda.com",
      name: "Amina Nkusi",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  const recruiter = await prisma.hrUser.upsert({
    where: { email: "recruiter@boarwanda.com" },
    update: { passwordHash, name: "Jean Uwimana", role: "STAFF", isActive: true },
    create: {
      email: "recruiter@boarwanda.com",
      name: "Jean Uwimana",
      passwordHash,
      role: "STAFF",
      isActive: true,
    },
  });
  await prisma.menuPermission.deleteMany({ where: { userId: recruiter.id } });
  await prisma.menuPermission.createMany({
    data: [
      { userId: recruiter.id, menuKey: "applications" },
      { userId: recruiter.id, menuKey: "jobs" },
    ],
  });

  const now = new Date();

  await prisma.job.upsert({
    where: { slug: "software-engineer" },
    update: {
      postedById: hr.id,
      status: "PUBLISHED",
      isOpen: true,
      publishedAt: now,
    },
    create: {
      title: "Software Engineer",
      slug: "software-engineer",
      department: "Engineering",
      location: "Kigali / Remote",
      employment: "Full-time",
      salaryRange: "Competitive, based on experience",
      description:
        "You will ship product with a small team: APIs, web UI, and the hiring tools that keep our pipeline moving.",
      requirements:
        "3+ years building web apps.\nComfortable with TypeScript.\nClear written communication.",
      status: "PUBLISHED",
      isOpen: true,
      publishedAt: now,
      postedById: hr.id,
    },
  });

  await prisma.job.upsert({
    where: { slug: "people-operations-lead" },
    update: {
      postedById: hr.id,
      status: "PUBLISHED",
      isOpen: true,
      publishedAt: now,
    },
    create: {
      title: "People Operations Lead",
      slug: "people-operations-lead",
      department: "People",
      location: "Kigali",
      employment: "Full-time",
      description:
        "Own recruiting operations: job posts, candidate experience, and a clean pipeline for hiring managers.",
      requirements:
        "Experience running hiring in a growing company.\nOrganized, discreet, and candidate-kind.",
      status: "PUBLISHED",
      isOpen: true,
      publishedAt: now,
      postedById: hr.id,
    },
  });

  await prisma.job.upsert({
    where: { slug: "product-designer" },
    update: {
      postedById: hr.id,
      status: "PUBLISHED",
      isOpen: true,
      publishedAt: now,
    },
    create: {
      title: "Product Designer",
      slug: "product-designer",
      department: "Design",
      location: "Remote",
      employment: "Contract",
      description:
        "Design the careers site, apply flow, and HR desk so candidates and recruiters both move quickly.",
      requirements: "Portfolio of product work.\nComfort collaborating with engineers.",
      status: "PUBLISHED",
      isOpen: true,
      publishedAt: now,
      postedById: hr.id,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
