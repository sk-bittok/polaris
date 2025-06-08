import {
	type NewHealthRecord,
	newHealthRecordSchema,
} from "@/lib/schemas/records";
import type { ReactNode } from "react";
import FormDialogue, { type FormFieldsConfig } from "./modal";
import { Save } from "lucide-react";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (data: NewHealthRecord) => void;
	children: ReactNode;
};

const healthRecordFields: FormFieldsConfig[] = [
	{
		name: "tagId",
		label: "Tag ID",
		placeholder: "ID on the ear tag",
		gridColumn: "half",
	},
	{
		name: "recordDate",
		label: "Date",
		type: "date",
		gridColumn: "half",
	},
	{
		name: "condition",
		label: "Condition",
		type: "select",
		gridColumn: "half",
		options: [
			{ label: "Vaccination", value: "vaccination" },
			{ label: "Fever", value: "fever" },
			{ label: "Injury", value: "injury" },
			{ label: "Infection", value: "infection" },
		],
		inputClassName: "w-full",
		placeholder: "i.e. treatment, vaccination",
	},
	{
		name: "status",
		label: "Status",
		type: "select",
		options: [
			{ label: "Recovered", value: "recovered" },
			{ label: "Recovering", value: "recovering" },
			{ label: "Active", value: "active" },
			{ label: "Deceased", value: "deceased" },
			{ label: "Worsened", value: "worsened" },
		],
		inputClassName: "w-full",
		gridColumn: "half",
	},
	{
		name: "severity",
		label: "severity",
		type: "select",
		gridColumn: "half",
		inputClassName: "w-full",
		options: [
			{ label: "High", value: "high" },
			{ label: "Medium", value: "medium" },
			{ label: "Low", value: "low" },
		],
	},
	{
		name: "treatment",
		label: "Treatment",
		placeholder: "i.e. antibiotics, vaccine, suppliments",
		gridColumn: "half",
	},
	{
		name: "description",
		label: "Description",
		placeholder: "why was it required",
	},
	{
		name: "medicine",
		label: "Medicine",
		placeholder: "if any",
		gridColumn: "half",
	},
	{
		name: "dosage",
		label: "Dosage",
		placeholder: "if drug given",
		gridColumn: "half",
	},
	{
		name: "cost",
		label: "Cost",
		placeholder: "if necessary",
		gridColumn: "half",
	},
	{
		name: "performedBy",
		label: "Vetinary",
		placeholder: "if any",
		gridColumn: "half",
	},
	{
		name: "notes",
		label: "Notes",
		type: "textarea",
		placeholder:
			"Any additional thoughts, knowledge, reasons about the weight e.t.c.",
		inputClassName: "min-h-36",
	},
];

export default function HealthRecordDialogue({
	isOpen,
	onClose,
	onCreate,
	children,
}: Props) {
	return (
		<FormDialogue<NewHealthRecord>
			isOpen={isOpen}
			onClose={onClose}
			onCreate={onCreate}
			title="Record new weight"
			description="Add a new weight record for this livestock"
			schema={newHealthRecordSchema}
			fields={healthRecordFields}
			formMode="onBlur"
			submitButtonText="Save"
			submitButtonIcon={<Save className="w-4 h-4" />}
		>
			{children}
		</FormDialogue>
	);
}
