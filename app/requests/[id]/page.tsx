import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requestRepository } from "@/repositories/request.repository";
import { templateRepository } from "@/repositories/template.repository";
import { userRepository } from "@/repositories/user.repository";
import RequestPageClient from "../_RequestPageClient";

type Props = { params: { id: string }; searchParams: { mode?: string } };

/**
 * 申請・承認画面
 * @param param0 
 * @returns 
 */
export default async function RequestPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // 稟議テンプレートを取得
  const templates = await templateRepository.findManyActiveTemplates();
  // 承認者候補の一覧を取得（自分以外）
  const approvers = await userRepository.findManyApprovers(session.user.id);
  // 申請情報を取得
  const request = await requestRepository.findRequestById(params.id);

  if (!request) {
    redirect("/dashboard");
  }

  const mode = searchParams.mode === "edit" ? "edit" : "view";
  const isApprover = request?.approvals?.some(
    (a: any) => a.approverId === session.user.id
  );

  // 下書きの申請は申請者以外 閲覧不可
  if(request.requestedById !== session.user.id && request.status === "DRAFT") {
    return <p className="text-center">Not Found</p>
  }

  // 特定ユーザ（申請者、承認者、管理者）以外は閲覧不可
  if (request.requestedById !== session.user.id && !isApprover && session.user.role !== "ADMIN") {
    return <p className="text-center">Not Found</p>
  }

  // 申請者かつ編集可能ステータス 以外は編集モードで表示不可
  if(mode === "edit") {
    const editEnabledStatus = request.status === "DRAFT" || request.status === "SENT_BACK";
    if(!(request.requestedById === session.user.id && editEnabledStatus)) {
      return <p className="text-center">Forbidden</p>
    }
  }

  return (
    <RequestPageClient
      currentUser={session.user}
      templates={templates}
      request={request}
      approvers={approvers}
      isApprover={isApprover}
      mode={mode}
    />
  );
}
