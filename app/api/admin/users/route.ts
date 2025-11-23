import { prisma } from "@/lib/prisma";
import { withApiHandler, apiSuccess, AppError } from "@/lib/apiResponse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { userUpsertSchema } from "@/lib/validation/userSchemas";

export async function GET() {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new AppError("UNAUTHORIZED", "認証が必要です", { status: 401 });
    if (session.user.role !== "ADMIN")
      throw new AppError("FORBIDDEN", "管理者のみアクセス可能です", { status: 403 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ users });
  });
}

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new AppError("UNAUTHORIZED", "認証が必要です", { status: 401 });
    if (session.user.role !== "ADMIN")
      throw new AppError("FORBIDDEN", "管理者のみアクセス可能です", { status: 403 });

    const json = await req.json();
    const parsed = userUpsertSchema.safeParse(json);
    if (!parsed.success)
      throw new AppError("VALIDATION_ERROR", "入力に誤りがあります", {
        status: 400,
        fieldErrors: parsed.error.flatten().fieldErrors,
      });

    const { id, name, email, role, password } = parsed.data;

    const result = await prisma.$transaction(async (tx: any) => {
      if (id) {
        // 編集
        const updateData: any = { name, email, role };
        if (password) updateData.passwordHash = await hash(password, 10);

        const user = await tx.user.update({
          where: { id },
          data: updateData,
        });

        await tx.auditLog.create({
          data: {
            action: "USER_UPDATED",
            userId: session.user.id,
            detail: JSON.stringify(json),
          },
        });

        return user;
      } else {
        // 新規登録
        const user = await tx.user.create({
          data: {
            name,
            email,
            role,
            passwordHash: await hash(password!, 10),
          },
        });

        await tx.auditLog.create({
          data: {
            action: "USER_CREATED",
            userId: session.user.id,
            detail: JSON.stringify(json),
          },
        });

        return user;
      }
    });

    return apiSuccess({ user: result });
  });
}
