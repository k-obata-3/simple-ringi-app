import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveDraftSchema, submitRequestSchema, deleteDraftSchema, } from "@/lib/validation/requestSchemas";
import { AppError, apiSuccess, withApiHandler } from "@/lib/apiResponse";
import { getActionValueLabel, statusValueLabel } from "@/lib/utils";

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "ログインが必要です。", { status: 401 });
    }

    const json = await req.json();
    const action = json.action as string;

    if (action === "saveDraft") {
      const parsed = saveDraftSchema.safeParse(json);
      if (!parsed.success) {
        throw new AppError("VALIDATION_ERROR", "入力内容に誤りがあります。", {
          status: 400,
          fieldErrors: parsed.error.flatten().fieldErrors,
        });
      }
      const data = parsed.data;

      const isUpdate = !!data.requestId;
      const result = await prisma.$transaction(async (tx: any) => {
        let request;
        if (isUpdate) {
          request = await tx.request.update({
            where: {
              id: data.requestId,
            },
            data: {
              title: data.title,
              type: data.type,
              typeId: data.typeId,
              jsonData: JSON.stringify(data.jsonData),
            },
          });
        } else {
          request = await tx.request.create({
            data: {
              title: data.title,
              type: data.type,
              typeId: data.typeId,
              jsonData: JSON.stringify(data.jsonData),
              status: statusValueLabel("DRAFT").value,
              requestedById: session.user.id,
            },
          });
        }

        // 承認者更新（自分以外のユーザのみ）
        const approverIds = data.approverIds.filter((id) => id !== session.user.id);
        await tx.approval.deleteMany({ where: { requestId: request.id } });
        await tx.approval.createMany({
          data: approverIds.map((id, idx) => ({
            requestId: request.id,
            approverId: id,
            order: idx + 1,
            status: statusValueLabel("PENDING").value,
          })),
        });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            requestId: request.id,
            action: isUpdate ? getActionValueLabel("REQUEST_DRAFT_UPDATED").value : getActionValueLabel("REQUEST_DRAFT_CREATED").value,
            detail: JSON.stringify(json),
          },
        });

        return request;
      });

      return apiSuccess({ request: result });
    }

    if (action === "submit" || action === "resubmit") {
      const parsed = submitRequestSchema.safeParse(json);
      if (!parsed.success) {
        throw new AppError("VALIDATION_ERROR", "入力内容に誤りがあります。", {
          status: 400,
          fieldErrors: parsed.error.flatten().fieldErrors,
        });
      }
      const data = parsed.data;

      const result = await prisma.$transaction(async (tx: any) => {
        const isUpdate = !!data.requestId;
        let request;
        if (isUpdate) {
          request = await tx.request.update({
            where: {
              id: data.requestId,
            },
            data: {
              title: data.title,
              type: data.type,
              typeId: data.typeId,
              jsonData: JSON.stringify(data.jsonData),
              status: statusValueLabel("PENDING").value,
              submittedAt: new Date(),
            },
          });
        } else {
          request = await tx.request.create({
            data: {
              title: data.title,
              type: data.type,
              typeId: data.typeId,
              jsonData: JSON.stringify(data.jsonData),
              status: statusValueLabel("PENDING").value,
              submittedAt: new Date(),
              requestedById: session.user.id,
            },
          });
        }

        const approverIds = data.approverIds.filter((id) => id !== session.user.id);
        await tx.approval.deleteMany({ where: { requestId: request.id } });
        await tx.approval.createMany({
          data: approverIds.map((id, idx) => ({
            requestId: request.id,
            approverId: id,
            order: idx + 1,
            status: statusValueLabel("PENDING").value,
          })),
        });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            requestId: request.id,
            action: data.action === "submit"
              ? getActionValueLabel("REQUEST_SUBMITTED").value
              : getActionValueLabel("REQUEST_SUBMITTED").value,
            detail: JSON.stringify(json),
          },
        });

        const payload = {
          message: `新しい申請が承認待ちです: ${request.title}`,
          requestId: request.id,
        }
        await tx.notification.createMany({
          data: approverIds.map((id) => ({
            userId: id,
            type: "ACTION",
            payload: JSON.stringify(payload),
          })),
        });

        return request;
      });

      return apiSuccess({ request: result });
    }

    if (action === "deleteDraft") {
      const parsed = deleteDraftSchema.safeParse(json);
      if (!parsed.success) {
        throw new AppError("VALIDATION_ERROR", "入力内容に誤りがあります。", {
          status: 400,
        });
      }

      await prisma.$transaction(async (tx: any) => {
        const req = await tx.request.findUnique({
          where: { id: parsed.data.requestId },
        });
        if (!req || req.requestedById !== session.user.id || req.status !== "DRAFT") {
          throw new AppError("FORBIDDEN", "下書きを削除できません。", { status: 403 });
        }

        await tx.approval.deleteMany({ where: { requestId: req.id } });
        await tx.request.delete({ where: { id: req.id } });

        await tx.auditLog.create({
          data: {
            userId: session.user.id,
            requestId: req.id,
            action: getActionValueLabel("REQUEST_DRAFT_DELETED").value,
          },
        });
      });

      return apiSuccess({ deleted: true } as any);
    }

    throw new AppError("INVALID_ACTION", "不正なアクションです。");
  });
}
