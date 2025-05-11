import { z } from "zod";


export const registerBreedSchema = z.object({
  specie: z.string().min(2, { message: "Too short" }).max(50, {
    message: "Too long"
  }),
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

export interface Breed {
  id: number;
  organisationPid?: string;
  specie: Category;
  name: string;
  maleWeightRange?: string;
  femaleWeightRange?: string;
  gestationPeriod?: string;
  description?: string;
  createdAt: string;
  isSystemDefined: boolean;
}

export enum Category {
  Cattle = "cattle",
  Sheep = "sheep",
  Goat = "goats",
  Chicken = "chicken",
  Pig = "pigs"
}

export const createLivestockSchema = z.object({
  tagId: z.string(),
  name: z.string(),
  gender: z.enum(["male", "female"]),
  status: z.enum(["active", "sold", "deceased"]),
  breed: z.string(),
  specie: z.string(),
  dateOfBirth: z.coerce.date().optional(),
  weightAtBirth: z.coerce.number().optional(),
  maleParentId: z.string().optional(),
  femaleParentId: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  purchaseDate: z.date().optional(),
  currentWeight: z.coerce.number().optional(),
  notes: z.string().optional(),
});

export type CreateLivestockSchema = z.infer<typeof createLivestockSchema>;

export interface RegisterLivestock {
  tagId: string;
  name: string;
  gender: string;
  status: string;
  breed: string;
  specie: string;
  dateOfBirth?: string | Date | null;
  weightAtBirth?: number | null;
  maleParentId?: string | null;
  femaleParentId?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | Date | null;
  currentWeight?: number | null;
  notes?: string | null;
};

export interface Livestock {
  id: number;
  pid: string;
  organisationPid: string;
  tagId: string;
  name: string;
  breedName: string;
  specieName: string;
  dateOfBirth: string;
  gender: string;
  parentMaleName: string;
  parentFemaleName: string;
  status: string;
  purchaseDate: string;
  purchasePrice: string;
  weightAtBirth: string;
  currentWeight: string;
  notes: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

