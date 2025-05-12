import { Category, Gender, Status } from "@/models/livestock";
import { z } from "zod";

export const basicInfoSchema = z.object({
  category: z.enum([Category.Cattle, Category.Sheep, Category.Goat, Category.Chicken, Category.Pig]),
  gender: z.enum([Gender.Female, Gender.Male, Gender.Unkown]),
  status: z.enum([Status.Active, Status.Sold, Status.Transferred, Status.Deceased]),
  breed: z.string(),
  tagId: z.string(),
  name: z.string(),
  currentWeight: z.coerce.number().optional(),
});

export type BasicInfoType = z.infer<typeof basicInfoSchema>;

export const parentageInfoSchema = z.object({
  weightAtBirth: z.coerce.number().optional(),
  dateOfBirth: z.coerce.date().optional(),
  parentFemaleId: z.string().optional(),
  parentMaleId: z.string().optional(),
});

export type ParentageInfo = z.infer<typeof parentageInfoSchema>;

export const purchaseInfoSchema = z.object({
  purchasePrice: z.coerce.number(),
  purchasePricePence: z.coerce.number(),
  dateOfPurchase: z.coerce.date(),
});

export type PurchaseInfo = z.infer<typeof purchaseInfoSchema>;

export const additionalInfoSchema = z.object({
  notes: z.string().optional(),
});

export type AdditionalInfo = z.infer<typeof additionalInfoSchema>;
