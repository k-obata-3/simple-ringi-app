import { prisma } from "@/lib/prisma";
import { templateRepository } from "@/repositories/template.repository";

const mockFn = <T extends (...args: any) => any>(f: T) => f as unknown as jest.Mock;

describe("template.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findManyActiveTemplates が正しく呼ばれる", async () => {
    const result = await templateRepository.findManyActiveTemplates();
    expect(prisma.requestTemplate.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true
      },
    });
  });

  test("findManyTemplates が正しく呼ばれる", async () => {
    const result = await templateRepository.findManyTemplates();
    expect(prisma.requestTemplate.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "asc"
      }
    });
  });

});
