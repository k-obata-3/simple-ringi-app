import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardPageClient from "./_DashboardPageClient";

/**
 * ダッシュボード画面
 * @returns 
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  const [myRequests, pendingApprovals] = await Promise.all([
    prisma.request.findMany({
      where: {
        requestedById: session.user.id,
      },
      include: {
        approvals: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.request.findMany({
      where: {
        status: "PENDING",
        approvals: {
          some: {
            approverId: session.user.id,
            status: "PENDING",
          },
        },
      },
      include: {
        approvals: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const allRequestsForAdmin = isAdmin
    ? await prisma.request.findMany({
        include: { approvals: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const unreadNotifications = await prisma.notification.findMany({
    where: { userId: session.user.id, readAt: null },
    orderBy: { createdAt: "desc" },
    take: 3, // ← 最大3件だけ
  });
  unreadNotifications?.map((n) => {
    n.payload = JSON.parse(n.payload);
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return (
    <DashboardPageClient
      user={session.user}
      myRequests={myRequests}
      pendingApprovals={pendingApprovals}
      allRequests={allRequestsForAdmin}
      notifications={unreadNotifications}
      unreadCount={unreadCount}
    />
  );
}
