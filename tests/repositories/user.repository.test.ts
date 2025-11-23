import { prisma } from "@/lib/prisma";
import { userRepository } from "@/repositories/user.repository";

const mockFn = <T extends (...args: any) => any>(f: T) => f as unknown as jest.Mock;

describe("userRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findManyApprovers が正しく呼ばれる", async () => {
    const result = await userRepository.findManyApprovers("cmib34g2d00003b1smbm8k4ir");
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        NOT: {
          id: "cmib34g2d00003b1smbm8k4ir"
        }
      },
      orderBy: {
        createdAt: "desc"
      },
    });
  });

});
