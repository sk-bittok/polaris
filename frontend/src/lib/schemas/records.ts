import { z } from "zod";

export const newProductRecordSchema = z.object({
  tagId: z.string().min(2).max(10),
  productionType: z.string().min(3).max(50),
  quantity: z.coerce.number(),
  unit: z.string().min(1, { message: "unit is required" }).max(10),
  quality: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  recordDate: z.date().optional().nullable(),
});

export type NewProductRecord = z.infer<typeof newProductRecordSchema>;
