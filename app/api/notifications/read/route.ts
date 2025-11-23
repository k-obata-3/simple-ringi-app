import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppError, apiSuccess, withApiHandler } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "ログインしてください");
    }

    const { id } = await req.json();
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return apiSuccess({ read: true });
  });
}
