import type { ReactNode } from "react";
import FormDialogue, { type FormFieldsConfig } from "./modal";
import { Plus } from "lucide-react";
import { type LinkOffspring, linkOffspringSchema } from "@/lib/schemas/animal";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (data: LinkOffspring) => void;
	children: ReactNode;
	parentId: string;
};

const offspringFields: FormFieldsConfig[] = [
	{
		name: "offspringName",
		label: "Offspring Name",
		placeholder: "Enter name for the offspring",
		// gridColumn: "half",
	},
	{
		name: "offspringTagId",
		label: "Offspring Tag ID",
		placeholder: "ID on the ear tag",
		// gridColumn: "half",
	},
	{
		name: "parentGender",
		label: "Gender of the Parent",
		placeholder: "Select gender",
		type: "select",
		options: [
			{ label: "Male", value: "male" },
			{ label: "Female", value: "female" },
		],
		inputClassName: "w-full",
		// gridColumn: "half",
	},
	{
		name: "parentTagId",
		label: "Parent Tag ID",
		placeholder: "Tag ID of the parent",
		// gridColumn: "half",
	},
];

export default function OffspringDialogue({
	isOpen,
	onClose,
	onCreate,
	children,
	parentId,
}: Props) {
	return (
		<FormDialogue<LinkOffspring>
			isOpen={isOpen}
			onClose={onClose}
			onCreate={onCreate}
			title="Link New Offspring"
			description="Add a new offspring record and link it to this parent"
			schema={linkOffspringSchema}
			fields={offspringFields}
			formMode="onBlur"
			submitButtonText="Link Offspring"
			submitButtonIcon={<Plus className="w-4 h-4" />}
		>
			{children}
		</FormDialogue>
	);
}
