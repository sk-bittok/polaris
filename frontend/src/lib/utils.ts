import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatters = {
  date: (dateString?: string | Date) => {
    if (!dateString) {
      return "Not specified";
    }

    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  },
  weight: (weight?: string | null) =>
    !weight ? "Not recorded" : `${weight} kg`,
  currency: (amount?: string | null) =>
    !amount ? "Not recorded" : `$${parseFloat(amount).toFixed(2)}`,

  getAnimalEmoji: (species: string) => {
    const speciesLower = species?.toLowerCase() || "";
    if (speciesLower.includes("cattle")) return "🐄";
    if (speciesLower.includes("sheep")) return "🐑";
    if (speciesLower.includes("goat")) return "🐐";
    if (speciesLower.includes("pig")) return "🐖";
    if (speciesLower.includes("horse")) return "🐎";
    if (speciesLower.includes("chicken")) return "🐓";
    return "🐾";
  },

  getFatherTerm: (species: string) => {
    const speciesLower = species?.toLowerCase();
    if (speciesLower.includes("cattle")) return "Sire";
    if (speciesLower.includes("sheep")) return "Ram";
    if (speciesLower.includes("goat")) return "Buck";
    if (speciesLower.includes("chicken")) return "Cock";
    if (speciesLower.includes("pig")) return "Boar";
    if (speciesLower.includes("horse")) return "Sire";
    return "father";
  },

  getMotherTerm: (species: string) => {
    const speciesLower = species?.toLowerCase();
    if (speciesLower.includes("cattle")) return "Dam";
    if (speciesLower.includes("sheep")) return "Ewe";
    if (speciesLower.includes("goat")) return "Doe";
    if (speciesLower.includes("chicken")) return "Hen";
    if (speciesLower.includes("pig")) return "Sow";
    if (speciesLower.includes("horse")) return "Dam";
    return "mother";
  },
};
