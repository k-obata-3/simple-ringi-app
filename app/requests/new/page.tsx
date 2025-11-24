import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { templateRepository } from "@/repositories/template.repository";
import RequestPageClient from "../_RequestPageClient";
import { userRepository } from "@/repositories/user.repository";

/**
 * 新規申請画面
 * @returns 
 */
export default async function NewRequestPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  // 稟議テンプレートを取得
  const templates = await templateRepository.findManyActiveTemplates();
  // 承認者候補の一覧を取得（自分以外）
  const approvers = await userRepository.findManyApprovers(session.user.id);

  return (
    <RequestPageClient
      currentUser={session.user}
      templates={templates}
      request={null}
      approvers={approvers}
      mode="edit"
    />
  );
}
