import { prisma } from "@/lib/prisma";

export const userRepository = {
  findAll: () => {
    return prisma.user.findMany({
      orderBy: {
        createdAt: "asc"
      },
    });
  },
  findManyApprovers: async (userId: string) => {
    return prisma.user.findMany({
      where: {
        NOT: {
          id: userId
        },
        isActive: true,
      },
      orderBy: {
        createdAt: "desc"
      },
    });
  },

};
