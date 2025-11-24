import { TemplateUpdateSchema } from "@/lib/validation/templateSchema";
import { AppError, apiSuccess, withApiHandler } from "@/lib/apiResponse";
import { templateRepository } from "@/repositories/template.repository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: any) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "認証が必要です", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      throw new AppError("FORBIDDEN", "管理者のみアクセス可能です", { status: 403 });
    }

    const id = params.id;
    const body = await req.json();

    const parsed = TemplateUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "入力に誤りがあります", {
        status: 400,
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const exists = await templateRepository.findById(id);
    if (!exists) {
      throw new AppError("NOT_FOUND_ERROR", "テンプレートが存在しません", {
        status: 404,
      });
    }

    const updated = await templateRepository.update(id, {
      name: parsed.data.name,
      fields: JSON.stringify(parsed.data.fields),
      isActive: parsed.data.isActive ?? exists.isActive,
    });

    return apiSuccess({ template: updated });
  })
}

export async function DELETE(req: Request, { params }: any) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "認証が必要です", { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      throw new AppError("FORBIDDEN", "管理者のみアクセス可能です", { status: 403 });
    }

    const id = params.id;
    const exists = await templateRepository.findById(id);
    if (!exists) {
      throw new AppError("NOT_FOUND_ERROR", "テンプレートが存在しません", {
        status: 404,
      });
    }

    await templateRepository.delete(id);

    return apiSuccess({ deleted: true } as any);
  })
}
