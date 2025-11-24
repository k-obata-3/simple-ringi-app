import { prisma } from "@/lib/prisma";

export const templateRepository = {
  findAll: () => {
    return prisma.requestTemplate.findMany();
  },
  findById: (id: string) => {
    return prisma.requestTemplate.findUnique({
      where: {
        id
      }
    });
  },
  create: (data: any) => {
    return prisma.requestTemplate.create({
      data
    });
  },
  update: (id: string, data: any) => {
    return prisma.requestTemplate.update({
      where: {
        id
      },
      data
    });
  },
  delete: (id: string) => {
    return prisma.requestTemplate.delete({
      where: {
        id
      }
    })
  },
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
