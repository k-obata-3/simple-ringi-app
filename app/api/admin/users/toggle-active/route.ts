import { prisma } from "@/lib/prisma";
import { withApiHandler, apiSuccess, AppError } from "@/lib/apiResponse";
import { userToggleActiveSchema } from "@/lib/validation/userSchemas";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "認証が必要です", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      throw new AppError("FORBIDDEN", "管理者のみアクセス可能です", { status: 403 });
    }

    const json = await req.json();
    const parsed = userToggleActiveSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "入力に誤りがあります", {
        status: 400,
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const { id, active } = parsed.data;

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({
        where: { id },
        data: { isActive: active },
      });

      await tx.auditLog.create({
        data: {
          action: active ? "USER_ENABLED" : "USER_DISABLED",
          userId: session.user.id,
          detail: JSON.stringify(json),
        },
      });

      return user;
    });

    return apiSuccess({ user: result });
  });
}
