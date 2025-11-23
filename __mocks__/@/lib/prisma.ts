export const prisma = {
  request: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  approval: {
    findMany: jest.fn(),
  },
  requestTemplate: {
    findMany: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  }
};

export default prisma;
