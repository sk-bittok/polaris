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

export const newHealthRecordSchema = z.object({
	recordDate: z.date(),
	condition: z.enum(["injury", "vaccination", "fever", "checkup", "infection"]),
	status: z.enum(["recovered", "recovering", "active", "deceased", "worsened"]),
	severity: z.enum(["high", "medium", "low"]),
	notes: z.string().optional().nullable(),
	treatment: z.string(),
	dosage: z.string().optional(),
	medicine: z.string().optional(),
	tagId: z.string().nullable(),
	description: z.string(),
	performedBy: z.string().optional(),
	cost: z.coerce.number(),
});

export type NewHealthRecord = z.infer<typeof newHealthRecordSchema>;

export const newWeightRecordSchema = z.object({
	tagId: z.string().min(2, { message: "Tag ID requires 2 characters" }),
	recordDate: z.date(),
	mass: z.coerce.number(),
	unit: z.enum(["kg", "lb"]),
	status: z.enum(["overweight", "underweight", "normal"]),
	notes: z.string().optional().nullable(),
});

export type NewWeightRecord = z.infer<typeof newWeightRecordSchema>;

export const newOffspringRecordSchema = z.object({
	name: z
		.string()
		.min(1, "Offspring name is required")
		.max(50, "Name must be less than 50 characters"),

	tagId: z
		.string()
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),

	gender: z.enum(["male", "female"], {
		required_error: "Please select a gender",
	}),

	birthDate: z
		.string()
		.or(z.date())
		.transform((val) => {
			if (typeof val === "string") {
				return new Date(val);
			}
			return val;
		})
		.refine((date) => date <= new Date(), {
			message: "Birth date cannot be in the future",
		}),

	breed: z
		.string()
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),

	color: z
		.string()
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),

	weight: z
		.number()
		.positive("Weight must be a positive number")
		.max(1000, "Weight seems unrealistic")
		.optional()
		.or(
			z.string().transform((val) => {
				const num = Number.parseFloat(val);
				return Number.isNaN(num) ? undefined : num;
			}),
		),

	healthStatus: z
		.enum(["healthy", "sick", "recovering", "deceased"], {
			required_error: "Please select a health status",
		})
		.default("healthy"),

	notes: z
		.string()
		.max(1000, "Notes must be less than 1000 characters")
		.optional()
		.or(z.literal(""))
		.transform((val) => (val === "" ? undefined : val)),

	parentId: z.string().optional(), // This will be added by the component
});

export type NewOffspringRecord = z.infer<typeof newOffspringRecordSchema>;
