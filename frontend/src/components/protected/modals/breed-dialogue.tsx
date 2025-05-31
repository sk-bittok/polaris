import {
	registerBreedSchema,
	type RegisterBreedSchema,
} from "@/lib/schemas/animal";
import { Category } from "@/models/livestock";
import type { ReactNode } from "react";
import FormDialogue, { type FormFieldsConfig } from "./modal";
import { Plus } from "lucide-react";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (data: RegisterBreedSchema) => void;
	children: ReactNode;
};

const speciesOptions = [
	{ label: "Cattle", value: Category.Cattle },
	{ label: "Sheep", value: Category.Sheep },
	{ label: "Goat", value: Category.Goat },
	{ label: "Pig", value: Category.Pig },
	{ label: "Chicken", value: Category.Chicken },
];

const breedFields: FormFieldsConfig[] = [
	{
		name: "specie",
		label: "Species",
		type: "select",
		options: speciesOptions,
		placeholder: "Select a specie",
		inputClassName: "w-full",
	},
	{
		name: "name",
		label: "Breed Name",
		placeholder: "i.e. Hereford, Dorper",
	},
	{
		name: "maleWeightRange",
		label: "Male Weight Range",
		placeholder: "e.g., 1000-1200 kg",
		gridColumn: "half",
	},
	{
		name: "femaleWeightRange",
		label: "Female Weight Range",
		placeholder: "e.g., 550-750 kg",
		gridColumn: "half",
	},
	{
		name: "gestationPeriod",
		label: "Gestation Period",
		placeholder: "e.g., 278 days",
	},
	{
		name: "description",
		label: "Description",
		type: "textarea",
		placeholder:
			"Describe the breed's characteristics, history, purpose, and notable features...",
		inputClassName: "min-h-32",
	},
];

const defaultValues: Partial<RegisterBreedSchema> = {
	specie: Category.Cattle,
	name: "",
	description: "",
	maleWeightRange: "",
	femaleWeightRange: "",
	gestationPeriod: "",
};

export default function BreedDialogue({
	isOpen,
	onClose,
	onCreate,
	children,
}: Props) {
	return (
		<FormDialogue<RegisterBreedSchema>
			isOpen={isOpen}
			onClose={onClose}
			onCreate={onCreate}
			title="Register new breed"
			description="Register a new breed. Click save when you are done"
			schema={registerBreedSchema}
			fields={breedFields}
			formMode="onChange"
			defaultValues={defaultValues}
			submitButtonText="Create Breed"
			submitButtonIcon={<Plus className="w-4 h-4" />}
		>
			{children}
		</FormDialogue>
	);
}
