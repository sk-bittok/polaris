import {
	type NewProductRecord,
	newProductRecordSchema,
} from "@/lib/schemas/records";
import type { ReactNode } from "react";
import FormDialogue, { type FormFieldsConfig } from "./modal";

type Props = {
	isOpen: boolean;
	onCreate: (data: NewProductRecord) => void;
	onClose: () => void;
	children: ReactNode;
};

const productRecordFields: FormFieldsConfig[] = [
	{ name: "tagId", label: "Tag ID", placeholder: "ID on the ear Tag" },
	{
		name: "productionType",
		label: "Product Type",
		placeholder: "i.e milk, wool, eggs e.t.c.",
	},
	{
		name: "quantity",
		label: "Quantity",
		placeholder: "i.e 35, 2",
		gridColumn: "half",
	},
	{
		name: "unit",
		label: "Unit",
		placeholder: "i.e. litres, bales, grams",
		gridColumn: "half",
	},
	{
		name: "recordDate",
		label: "Date of Produce",
		type: "date",
		gridColumn: "half",
		className: "flex flex-col",
	},
	{
		name: "quality",
		label: "Quality",
		placeholder: "good, excellent e.t.c",
		gridColumn: "half",
	},
	{
		name: "notes",
		label: "Notes",
		placeholder: "Any thoughts, remarks, or additional info about the produce",
		inputClassName: "min-h-36",
		type: "textarea",
	},
];

function ProductRecordDialogue({ isOpen, onClose, onCreate, children }: Props) {
	return (
		<FormDialogue<NewProductRecord>
			isOpen={isOpen}
			onClose={onClose}
			onCreate={onCreate}
			fields={productRecordFields}
			title="Record new produce"
			description="Add a new produce record for this livestock"
			schema={newProductRecordSchema}
			formMode="onChange"
			submitButtonText="Add record"
		>
			{children}
		</FormDialogue>
	);
}

export default ProductRecordDialogue;
