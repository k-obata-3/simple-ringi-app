// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding start...");

  const passwordHash = await bcrypt.hash("test123", 10);

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理者 太郎",
      email: "admin@example.com",
      role: "ADMIN",
      passwordHash,
      isActive: true,
    },
  });

  const userA = await prisma.user.upsert({
    where: { email: "employee1@example.com" },
    update: {},
    create: {
      name: "社員 一郎",
      email: "employee1@example.com",
      role: "EMPLOYEE",
      passwordHash,
      isActive: true,
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: "employee2@example.com" },
    update: {},
    create: {
      name: "社員 二郎",
      email: "employee2@example.com",
      role: "EMPLOYEE",
      passwordHash,
      isActive: true,
    },
  });

  const userC = await prisma.user.upsert({
    where: { email: "employee3@example.com" },
    update: {},
    create: {
      name: "社員 三郎",
      email: "employee3@example.com",
      role: "EMPLOYEE",
      passwordHash,
      isActive: true,
    },
  });

  console.log("Users created");

  // --- RequestTemplate ---
  const requestTemplate1 = await prisma.requestTemplate.create({
    data: {
      name: "汎用",
      fields: JSON.stringify([
        { key: "contents", label: "内容", inputType: "textarea", required: true, value: "" },
      ]),
    }
  });

  const requestTemplate2 = await prisma.requestTemplate.create({
    data: {
      name: "備品購入",
      fields: JSON.stringify([
        { key: "itemName", label: "品名", inputType: "text", required: true, value: "" },
        { key: "quantity", label: "数量", inputType: "number", required: true, value: 0 },
        { key: "price", label: "単価", inputType: "number", required: true, value: 0 },
        { key: "reason", label: "購入理由", inputType: "textarea", required: true, value: "" },
      ]),
    }
  });

  const requestTemplate3 = await prisma.requestTemplate.create({
    data: {
      name: "出張旅費",
      fields: JSON.stringify([
        { key: "destination", label: "出張先", inputType: "text", required: true, value: "" },
        { key: "purpose", label: "目的", inputType: "text", required: true, value: "" },
        { key: "amount", label: "金額", inputType: "number", required: true, value: 0 },
        { key: "date", label: "日付", inputType: "date", required: true, value: "" },
      ]),
    }
  });

  const requestTemplate4 = await prisma.requestTemplate.create({
    data: {
      name: "研修参加",
      fields: JSON.stringify([
        { key: "seminar", label: "研修名", inputType: "text", required: true, value: "" },
        { key: "fee", label: "参加費", inputType: "number", required: true, value: 0 },
        { key: "venue", label: "場所", inputType: "text", required: false, value: "" },
        { key: "schedule", label: "日程", inputType: "date", required: true, value: "" },
      ]),
    }
  });

  // --- Sample Request (DRAFT) ---
  const draftRequest = await prisma.request.create({
    data: {
      title: "備品購入の稟議（下書き）",
      type: "備品購入",
      typeId: requestTemplate2.id,
      status: "DRAFT",
      requestedById: userA.id,
      jsonData: JSON.stringify([
        { key: "itemName", label: "品名", inputType: "text", required: true, value: "27インチモニター" },
        { key: "quantity", label: "数量", inputType: "number", required: true, value: 2 },
        { key: "price", label: "単価", inputType: "number", required: true, value: 3000 },
        { key: "reason", label: "購入理由", inputType: "textarea", required: true, value: "入れ替え" },
      ]),
    },
  });

  // 承認者設定（B → C の順で承認）
  await prisma.approval.createMany({
    data: [
      {
        requestId: draftRequest.id,
        approverId: userB.id,
        order: 1,
        status: "PENDING",
      },
      {
        requestId: draftRequest.id,
        approverId: userC.id,
        order: 2,
        status: "PENDING",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      requestId: draftRequest.id,
      userId: userA.id,
      action: "REQUEST_DRAFT_CREATED",
      detail: JSON.stringify({ message: "Seed: Draft created" }),
    },
  });

  console.log("Draft request created");

  // --- Sample Request (PENDING) ---
  const pendingRequest = await prisma.request.create({
    data: {
      title: "出張費申請（申請中）",
      type: "出張旅費",
      typeId: requestTemplate3.id,
      status: "PENDING",
      requestedById: userB.id,
      submittedAt: new Date(),
      jsonData: JSON.stringify([
        { key: "destination", label: "出張先", inputType: "text", required: true, value: "新大阪" },
        { key: "purpose", label: "目的", inputType: "text", required: true, value: "商談" },
        { key: "amount", label: "金額", inputType: "number", required: true, value: 50000 },
        { key: "date", label: "日付", inputType: "date", required: true, value: "" },
      ]),
    },
  });

  await prisma.approval.createMany({
    data: [
      {
        requestId: pendingRequest.id,
        approverId: admin.id,
        order: 1,
        status: "PENDING",
      },
      {
        requestId: pendingRequest.id,
        approverId: userC.id,
        order: 2,
        status: "PENDING",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      requestId: pendingRequest.id,
      userId: userB.id,
      action: "REQUEST_SUBMITTED",
      detail: JSON.stringify({ message: "Seed: Pending created" }),
    },
  });

  await prisma.notification.createMany({
    data: [{
      userId: admin.id,
      type: "ACTION",
      payload: JSON.stringify({ message: "新しい申請が承認待ちです", requestId: pendingRequest.id }),
    },
    {
      userId: userC.id,
      type: "ACTION",
      payload: JSON.stringify({ message: "新しい申請が承認待ちです", requestId: pendingRequest.id }),
    }]
  });

  console.log("Pending request created");

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
