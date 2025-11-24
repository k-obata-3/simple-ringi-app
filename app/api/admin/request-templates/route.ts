import { TemplateCreateSchema } from "@/lib/validation/templateSchema";
import { AppError, apiSuccess, withApiHandler } from "@/lib/apiResponse";
import { templateRepository } from "@/repositories/template.repository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "認証が必要です", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      throw new AppError("FORBIDDEN", "管理者のみアクセス可能です", { status: 403 });
    }

    const list = await templateRepository.findAll();
    return apiSuccess({ list });
  })
}

export async function POST(req: Request) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "認証が必要です", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      throw new AppError("FORBIDDEN", "管理者のみアクセス可能です", { status: 403 });
    }

    const body = await req.json();

    const parsed = TemplateCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "入力に誤りがあります", {
        status: 400,
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const created = await templateRepository.create({
      name: parsed.data.name,
      fields: JSON.stringify(parsed.data.fields),
      isActive: true,
    });

    return apiSuccess({ template: created });
  })
}
