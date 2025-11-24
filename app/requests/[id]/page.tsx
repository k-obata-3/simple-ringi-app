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

  return (
    <RequestPageClient
      currentUser={session.user}
      templates={templates}
      request={request}
      approvers={approvers}
      mode={mode}
    />
  );
}
