import { prisma } from "@/lib/prisma";

export const requestRepository = {
  findRequestById: async (requestId: string) => {
    return prisma.request.findUnique({
      where: {
        id: requestId
      },
      include: {
        approvals: {
          include: {
            approver: true
          },
          orderBy: {
            order: "asc"
          }
        },
        requestedBy: true,
        auditLogs: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: "asc"
          }
        },
      },
    });
  },

};
