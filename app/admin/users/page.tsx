import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { userRepository } from "@/repositories/user.repository";
import UserListPageClient from "./_UserListPageClient";

/**
 * ユーザ一覧画面
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

  const users = await userRepository.findAll();

  return (
    <UserListPageClient users={users} />
  );
}
