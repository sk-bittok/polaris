"use client";

import type { FormFieldsConfig } from "@/components/protected/modals";
import GeneralForm from "@/components/protected/generic-form";
import {
	type UpdateProductRecord,
	updateProductRecordSchema,
} from "@/lib/schemas/records";
import { use, useState } from "react";
import { BackButton } from "@/components/protected/records";
import { useUpdateProductionRecordByIdMutation } from "@/state/api";
import { format } from "date-fns";
import SuccessStep from "@/components/protected/success-step";

const productRecordFields: FormFieldsConfig[] = [
	{
		name: "productionType",
		label: "Product Type",
		placeholder: "i.e milk, wool, eggs e.t.c.",
	},
	{
		name: "quantity",
		label: "Quantity",
		placeholder: "i.e 35, 2",
		// gridColumn: "half",
	},
	{
		name: "unit",
		label: "Unit",
		placeholder: "i.e. litres, bales, grams",
		// gridColumn: "half",
	},
	{
		name: "recordDate",
		label: "Date of Produce",
		type: "date",
		gridColumn: "half",
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
		inputClassName: "min-h-48",
		type: "textarea",
	},
];

export default function EditProductionRecord({
	params,
}: { params: Promise<{ id: string }> }) {
	const [submitIsSuccess, setSubmitIsSuccess] = useState(false);
	const resolvedParams = use(params);
	const id = Number.parseInt(resolvedParams.id);

	const [updateRecord] = useUpdateProductionRecordByIdMutation();

	const onSubmit = async (data: UpdateProductRecord) => {
		data.recordDate = data.recordDate ? format(data.recordDate, 'yyyy-MM-dd') : undefined;
		data.quantity = data.quantity ? Number.parseInt(`${data.quantity}00`) : undefined;
		const response = await updateRecord({ id, data });
		if (response.data && response.error === undefined) {
			setSubmitIsSuccess(true)
		}
		console.table(response);
	};

	return (
		<div className="bg-gray-50 dark:bg-gray-950 p-2 h-full rounded-lg">
			<div className="m-2">
				<BackButton href="/production-records">Back to all records</BackButton>
			</div>
			{submitIsSuccess ? (
				<SuccessStep title="Update Complete!" description="The production record has successfully been updated" link='/production-records' linkText='View all records' />
			) : (
				<GeneralForm
					title={`Edit Production Record #${id}`}
					description="Fill in the form to edit this record"
					onSubmit={onSubmit}
					schema={updateProductRecordSchema}
					fields={productRecordFields}
				/>
			)}
		</div>
	);
}