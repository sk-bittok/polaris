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

