import { z } from "zod";

export const userUpsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("メールアドレスの形式が不正です"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  password: z.string().optional(), // 新規の場合は必須、編集時は任意
});

export const userToggleActiveSchema = z.object({
  id: z.string().min(1),
  active: z.boolean(),
});
