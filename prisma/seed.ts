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
    update: { passwordHash, name: "Janvier Habineza", role: "ADMIN", isActive: true },
    create: {
      email: "hr@boarwanda.com",
      name: "Janvier Habineza",
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

  const software = await prisma.job.upsert({
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

  const people = await prisma.job.upsert({
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

  const peopleCriteriaLabels = [
    "Bachelors degree",
    "3 years of experience",
    "speaking both english and french",
  ];
  const existingCriteria = await prisma.jobCriterion.findMany({
    where: { jobId: people.id },
    orderBy: { sortOrder: "asc" },
  });
  const peopleCriteria = [];
  for (let i = 0; i < peopleCriteriaLabels.length; i++) {
    const label = peopleCriteriaLabels[i];
    const found = existingCriteria.find((item) => item.label === label);
    peopleCriteria.push(
      found ??
        (await prisma.jobCriterion.create({
          data: { jobId: people.id, label, sortOrder: i },
        })),
    );
  }

  const applicantPassword = await bcrypt.hash("Applicant123!", 10);

  const muhozi = await prisma.applicant.upsert({
    where: { email: "janvierhabineza105@gmail.com" },
    update: { fullName: "Muhozi Daniel" },
    create: {
      email: "janvierhabineza105@gmail.com",
      fullName: "Muhozi Daniel",
      passwordHash: applicantPassword,
    },
  });

  const murenzi = await prisma.applicant.upsert({
    where: { email: "hghisley@gmail.com" },
    update: { fullName: "Murenzi Abdala" },
    create: {
      email: "hghisley@gmail.com",
      fullName: "Murenzi Abdala",
      passwordHash: applicantPassword,
    },
  });

  await prisma.application.upsert({
    where: {
      jobId_email: { jobId: software.id, email: muhozi.email },
    },
    update: {
      applicantId: muhozi.id,
      fullName: "Habineza Janvier",
      phone: "+250787499115",
      city: "Kigali",
      currentTitle: "softwared",
      yearsExperience: "7",
      coverLetter: "Interested",
      source: "website",
      status: "hired",
      nextStep: "congratulation you are hired",
      examScore: 78,
      examMax: 100,
      examDate: new Date("2026-11-20T20:30:00.000Z"),
      examVenue: "BOA Head Office, Kigali",
    },
    create: {
      jobId: software.id,
      applicantId: muhozi.id,
      fullName: "Habineza Janvier",
      email: muhozi.email,
      phone: "+250787499115",
      city: "Kigali",
      currentTitle: "softwared",
      yearsExperience: "7",
      coverLetter: "Interested",
      source: "website",
      status: "hired",
      nextStep: "congratulation you are hired",
      examScore: 78,
      examMax: 100,
      examDate: new Date("2026-11-20T20:30:00.000Z"),
      examVenue: "BOA Head Office, Kigali",
      events: {
        create: [
          { title: "Application submitted", detail: "Applied for Software Engineer." },
          {
            title: "Invited to written exam",
            detail:
              "Please sit the written exam on 11/12/2026, 9:00:00 AM at BOA Head Office, Kigali. Bring identification and arrive 15 minutes early.",
          },
          { title: "Written exam mark recorded", detail: "Written exam mark recorded: 78 / 100." },
          { title: "Moved to Hired", detail: "congratulation you are hired" },
        ],
      },
    },
  });

  const murenziPeople = await prisma.application.upsert({
    where: {
      jobId_email: { jobId: people.id, email: murenzi.email },
    },
    update: {
      applicantId: murenzi.id,
      fullName: "Murenzi Abdala",
      phone: "+250787499115",
      city: "Kigali",
      currentTitle: "intern",
      yearsExperience: "3",
      coverLetter: "Interested",
      source: "website",
      status: "new",
      nextStep: "Your application has been received. The recruitment team will review it shortly.",
      matchPercent: 33,
    },
    create: {
      jobId: people.id,
      applicantId: murenzi.id,
      fullName: "Murenzi Abdala",
      email: murenzi.email,
      phone: "+250787499115",
      city: "Kigali",
      currentTitle: "intern",
      yearsExperience: "3",
      coverLetter: "Interested",
      source: "website",
      status: "new",
      nextStep: "Your application has been received. The recruitment team will review it shortly.",
      matchPercent: 33,
      events: {
        create: {
          title: "Application submitted",
          detail: "Applied for People Operations Lead. Screening match 33% (1 of 3 criteria).",
        },
      },
    },
  });

  const muhoziPeople = await prisma.application.upsert({
    where: {
      jobId_email: { jobId: people.id, email: muhozi.email },
    },
    update: {
      applicantId: muhozi.id,
      fullName: "Muhozi Daniel",
      phone: "+250787499115",
      city: "Kigali",
      currentTitle: "intern",
      yearsExperience: "3",
      coverLetter: "interested",
      source: "referral",
      status: "new",
      nextStep: "Your application has been received. The recruitment team will review it shortly.",
      matchPercent: 67,
    },
    create: {
      jobId: people.id,
      applicantId: muhozi.id,
      fullName: "Muhozi Daniel",
      email: muhozi.email,
      phone: "+250787499115",
      city: "Kigali",
      currentTitle: "intern",
      yearsExperience: "3",
      coverLetter: "interested",
      source: "referral",
      status: "new",
      nextStep: "Your application has been received. The recruitment team will review it shortly.",
      matchPercent: 67,
      events: {
        create: {
          title: "Application submitted",
          detail: "Applied for People Operations Lead. Screening match 67% (2 of 3 criteria).",
        },
      },
    },
  });

  await prisma.applicationCriterion.deleteMany({
    where: { applicationId: { in: [murenziPeople.id, muhoziPeople.id] } },
  });
  await prisma.applicationCriterion.createMany({
    data: [
      { applicationId: murenziPeople.id, criterionId: peopleCriteria[0].id, met: true },
      { applicationId: murenziPeople.id, criterionId: peopleCriteria[1].id, met: false },
      { applicationId: murenziPeople.id, criterionId: peopleCriteria[2].id, met: false },
      { applicationId: muhoziPeople.id, criterionId: peopleCriteria[0].id, met: true },
      { applicationId: muhoziPeople.id, criterionId: peopleCriteria[1].id, met: true },
      { applicationId: muhoziPeople.id, criterionId: peopleCriteria[2].id, met: false },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
