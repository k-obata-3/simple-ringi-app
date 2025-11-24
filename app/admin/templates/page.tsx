import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { templateRepository } from "@/repositories/template.repository";
import TemplateListPageClient from "./_TemplateListPageClient";

/**
 * テンプレート一覧画面
 * @returns 
 */
export default async function UserListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const templates = await templateRepository.findManyTemplates();

  return (
    <TemplateListPageClient templates={templates} />
  );
}
