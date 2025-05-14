import { Category, Gender, Status } from "@/models/livestock";
import { z } from "zod";

export const createLivestockSchema = z.object({
  tagId: z.string(),
  name: z.string(),
  gender: z.enum([Gender.Male, Gender.Female, Gender.Unkown]),
  status: z.enum([Status.Transferred, Status.Active, Status.Sold, Status.Deceased]),
  breed: z.string(),
  specie: z.enum([Category.Cattle, Category.Sheep, Category.Chicken, Category.Goat, Category.Pig]),
  dateOfBirth: z.coerce.date().optional(),
  weightAtBirth: z.coerce.number().optional(),
  maleParentId: z.string().optional().nullable(),
  femaleParentId: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().optional(),
  purchasePricePence: z.coerce.number().optional(),
  purchaseDate: z.coerce.date().optional(),
  currentWeight: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export const updateLivestockSchema = z.object({
  tagId: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  gender: z.enum([Gender.Male, Gender.Female, Gender.Unkown]).optional().nullable(),
  status: z.enum([Status.Transferred, Status.Active, Status.Sold, Status.Deceased]).optional().nullable(),
  breed: z.string().optional().nullable(),
  specie: z.enum([Category.Cattle, Category.Sheep, Category.Chicken, Category.Goat, Category.Pig]).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  weightAtBirth: z.coerce.number().optional().nullable(),
  maleParentId: z.string().optional().nullable().nullable(),
  femaleParentId: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().optional().nullable(),
  purchasePricePence: z.coerce.number().optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  currentWeight: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateLivestockSchema = z.infer<typeof createLivestockSchema>;

export type UpdateLivestockSchema = z.infer<typeof updateLivestockSchema>;

export const registerBreedSchema = z.object({
  specie: z.enum([Category.Sheep, Category.Chicken, Category.Cattle, Category.Pig, Category.Goat]),
  name: z.string().min(2, { message: "Too short" }).max(50, {
    message: "Too long"
  }),
  maleWeightRange: z.string().min(2, { message: "Too short" }).max(50, {
    message: "Too long"
  }).optional(),
  femaleWeightRange: z.string().min(2, { message: "Too short" }).max(50, {
    message: "Too long"
  }).optional(),
  gestationPeriod: z.string().min(2, { message: "Too short" }).max(50, {
    message: "Too long"
  }).optional(),
  description: z.string().min(20, { message: "Too short" }).max(2500, {
    message: "Too long"
  }).optional(),
});

export type RegisterBreedSchema = z.infer<typeof registerBreedSchema>;

export const updateBreedSchema = z.object({
  specie: z.string().optional(),
  name: z.string().optional(),
  maleWeightRange: z.string().optional(),
  femaleWeightRange: z.string().optional(),
  gestationPeriod: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateBreedSchema = z.infer<typeof updateBreedSchema>;
