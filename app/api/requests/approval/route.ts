import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approvalActionSchema } from "@/lib/validation/requestSchemas";
import { AppError, apiSuccess, withApiHandler } from "@/lib/apiResponse";
import { getActionValueLabel, statusValueLabel } from "@/lib/utils";

export async function POST(req: NextRequest) {
  return withApiHandler(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError("UNAUTHORIZED", "ログインが必要です。", { status: 401 });
    }

    const json = await req.json();
    const parsed = approvalActionSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError("VALIDATION_ERROR", "入力内容に誤りがあります。", {
        status: 400,
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const { action, requestId, comment } = parsed.data;

    const result = await prisma.$transaction(async (tx: any) => {
      const approval = await tx.approval.findFirst({
        where: {
          requestId,
          approverId: session.user.id,
        },
        include: { request: true },
      });

      if (!approval) {
        throw new AppError("FORBIDDEN", "承認対象ではありません。", { status: 403 });
      }

      if (approval.status !== statusValueLabel("PENDING").value) {
        throw new AppError("INVALID_STATE", "すでに処理済みです。");
      }

      let newStatus: string;
      if (action === "approve") {
        newStatus = statusValueLabel("APPROVED").value;
      } else if (action === "reject") {
        newStatus = statusValueLabel("REJECTED").value;
      } else {
        newStatus = statusValueLabel("SENT_BACK").value;
      }

      const updatedApproval = await tx.approval.update({
        where: { id: approval.id },
        data: {
          status: newStatus,
          comment,
          decidedAt: new Date(),
        },
      });

      // 稟議全体のステータス更新
      const approvals = await tx.approval.findMany({
        where: { requestId },
      });

      let requestStatus = approval.request.status;

      if (action === "reject" || action === "sendBack") {
        requestStatus = newStatus; // REJECTED / SENT_BACK
      } else if (action === "approve") {
        const allApproved = approvals.every((a: any) => a.status === statusValueLabel("APPROVED").value);
        if (allApproved) {
          requestStatus = statusValueLabel("APPROVED").value;
        }
        else {
          requestStatus = statusValueLabel("PENDING").value;
        }
      }

      const updatedRequest = await tx.request.update({
        where: { id: requestId },
        data: { status: requestStatus },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          requestId,
          action:
            action === "approve"
              ? getActionValueLabel("REQUEST_APPROVED").value
              : action === "reject"
              ? getActionValueLabel("REQUEST_REJECTED").value
              : getActionValueLabel("SENT_BACK").value,
          detail: JSON.stringify(json),
        },
      });

      // 申請者へ通知
      const payload = {
        message:
          action === "approve"
            ? `申請が承認されました: ${updatedRequest.title}`
            : action === "reject"
            ? `申請が却下されました: ${updatedRequest.title}`
            : `申請が差戻されました: ${updatedRequest.title}`,
        requestId: updatedRequest.id,
      }
      await tx.notification.create({
        data: {
          userId: updatedRequest.requestedById,
          type: "INFO",
          payload: JSON.stringify(payload),
        },
      });

      return { approval: updatedApproval, request: updatedRequest };
    });

    return apiSuccess(result);
  });
}
