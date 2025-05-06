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
  }).nullable(),
  femaleWeightRange: z.string().min(2, { message: "Too short" }).max(50, {
    message: "Too long"
  }).nullable(),
  gestationPeriod: z.string().min(2, { message: "Too short" }).max(50, {
    message: "Too long"
  }).nullable(),
  description: z.string().min(20, { message: "Too short" }).max(2500, {
    message: "Too long"
  }).nullable(),
});

export type RegisterBreedSchema = z.infer<typeof registerBreedSchema>;

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

