import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

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
			return dateString.toString();
		}
	},
	weight: (weight?: string | null) =>
		!weight ? "Not recorded" : `${weight} kg`,
	currency: (amount?: string | null) =>
		!amount ? "Not recorded" : `$${Number.parseFloat(amount).toFixed(2)}`,

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

	getProductEmoji: (productType: string) => {
		const type = productType?.toLowerCase() || "";
		if (type.includes("milk")) return "🥛";
		if (type.includes("egg")) return "🥚";
		if (type.includes("wool")) return "🧶";
		if (type.includes("meat")) return "🥩";
		if (type.includes("honey")) return "🍯";
		if (type.includes("cheese")) return "🧀";
		return "📦";
	},

	getHealthEmoji: (condition: string) => {
		const cond = condition?.toLowerCase() || "";
		if (cond.includes("fever")) return "🤒";
		if (cond.includes("injury") || cond.includes("wound")) return "🩹";
		if (cond.includes("vaccination") || cond.includes("vaccine")) return "💉";
		if (cond.includes("infection")) return "🦠";
		if (cond.includes("checkup") || cond.includes("routine")) return "🩺";
		return "⚕️";
	},

	getWeightEmoji: () => {
		return "⚖️";
	},
};

export const formatDisplayDate = (dateString?: Date | string): string => {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	return date.toLocaleDateString();
};

// Error message extraction utility
export const extractErrorMessage = (
	error?: FetchBaseQueryError | SerializedError,
): string => {
	if (!error) return "Internal server error";
	if (
		"data" in error &&
		error.data &&
		typeof error.data === "object" &&
		"message" in error.data
	) {
		return error.data.message as string;
	}
	return "Internal server error";
};

export const extractErrorStatus = (
	error?: FetchBaseQueryError | SerializedError,
) => {
	if (!error) return 500;

	// FetchBaseQueryError
	if ("status" in error) {
		if (typeof error.status === "number") {
			return error.status;
		}
		// FETCH_ERROR, PARSING_ERROR, TIMEOUT_ERROR
		return 500;
	}
	// SerializedError
	return 500;
};
