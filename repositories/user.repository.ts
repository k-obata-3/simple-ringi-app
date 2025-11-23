import { prisma } from "@/lib/prisma";

export const userRepository = {
  findManyApprovers: async (userId: string) => {
    return prisma.user.findMany({
      where: {
        NOT: {
          id: userId
        }
      },
      orderBy: {
        createdAt: "desc"
      },
    });
  },

};
