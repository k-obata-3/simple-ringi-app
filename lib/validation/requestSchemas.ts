import { z } from "zod";

export const requestBaseSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100),
  typeId: z.string().min(1, "申請種類は必須です"),
  type: z.string(),
  jsonData: z.record(z.any(), z.any()).array(),
  approverIds: z
    .array(z.string())
    .min(1, "承認者を1名以上選択してください"),
});

export const saveDraftSchema = requestBaseSchema.extend({
  action: z.literal("saveDraft"),
  requestId: z.string().optional(),
});

export const submitRequestSchema = requestBaseSchema.extend({
  action: z.enum(["submit", "resubmit"]),
  requestId: z.string().optional(),
});

export const deleteDraftSchema = z.object({
  action: z.literal("deleteDraft"),
  requestId: z.string().min(1),
});

export const approvalActionSchema = z.object({
  action: z.enum(["approve", "reject", "sendBack"]),
  requestId: z.string().min(1),
  comment: z.string().optional(),
});
