import { z } from "zod";

export const TemplateFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  inputType: z.enum(["text", "number", "textarea", "date"]),
  required: z.boolean(),
  value: z.union([z.string(), z.number()]).optional(),
});

export const TemplateCreateSchema = z.object({
  name: z.string().min(1),
  fields: z.array(TemplateFieldSchema),
});

export const TemplateUpdateSchema = z.object({
  name: z.string().min(1),
  fields: z.array(TemplateFieldSchema),
  isActive: z.boolean().optional(),
});
