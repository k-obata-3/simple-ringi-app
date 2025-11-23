import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginPageClient from "./_LoginPageClient";

/**
 * ログイン画面
 * @returns 
 */
export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }
  return (
    <LoginPageClient />
  );
}
