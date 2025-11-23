import { prisma } from "@/lib/prisma";

export const templatetRepository = {
  findManyActiveTemplates: async () => {
    return prisma.requestTemplate.findMany({
      where: {
        isActive: true 
      },
    });
  },

  findManyTemplates: () => {
    return prisma.requestTemplate.findMany({
      orderBy: {
        createdAt: "asc"
      }
    });
  },
};
