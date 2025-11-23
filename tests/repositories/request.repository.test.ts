import { prisma } from "@/lib/prisma";
import { requestRepository } from "@/repositories/request.repository";

const mockFn = <T extends (...args: any) => any>(f: T) => f as unknown as jest.Mock;

describe("requestRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findRequestById が正しく呼ばれる", async () => {
    const result = await requestRepository.findRequestById("cmib6p9ad001nhfpl6zhucg67");
    expect(prisma.request.findUnique).toHaveBeenCalledWith({
      where: {
        id: "cmib6p9ad001nhfpl6zhucg67"
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
  });

});
