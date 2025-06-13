"use client";

import type { FormFieldsConfig } from "@/components/protected/modals";
import GeneralForm from "@/components/protected/generic-form";
import {
	type UpdateHealthRecord,
	updateHealthRecordSchema,
} from "@/lib/schemas/records";
import { use, useState } from "react";
import { BackButton } from "@/components/protected/records";
import { useUpdateHealthRecordByIdMutation } from "@/state/api";
import { format } from "date-fns";
import SuccessStep from "@/components/protected/success-step";

const healthRecordFields: FormFieldsConfig[] = [
	{
		name: "condition",
		label: "Condition",
		gridColumn: "half",
		type: "select",
		options: [
			{ label: "Injury", value: "injury" },
			{ label: "Infection", value: "infection" },
			{ label: "Vaccination", value: "vaccination" },
			{ label: "Fever", value: "fever" },
			{ label: "Checkup", value: "checkup" },
		],
		inputClassName: "w-full",
	},
	{
		name: "Severity",
		label: "Severity",
		type: "select",
		gridColumn: "half",
		options: [
			{ label: "Low", value: "low" },
			{ label: "Medium", value: "medium" },
			{ label: "High", value: "high" },
		],
		inputClassName: "w-full",
	},
	{
		name: "status",
		label: "Status",
		type: "select",
		gridColumn: "half",
		options: [
			{ label: "Recovering", value: "recovering" },
			{ label: "Recovered", value: "recoverd" },
			{ label: "Active", value: "active" },
			{ label: "Worsened", value: "worsened" },
			{ label: "Deceased", value: "deceased" },
		],
		inputClassName: "w-full",
	},
	{
		name: "recordDate",
		label: "Record Date",
		type: "date",
		gridColumn: "half",
	},
	{
		name: "treatment",
		label: "Treatment",
		placeholder: "i.e. antibiotics, wound dressing e.t.c",
	},
	{
		name: "medicine",
		label: "Drug",
		placeholder: "i.e. Fotivax, Amoxill",
		gridColumn: "half",
	},
	{
		name: "dosage",
		label: "Dosage",
		placeholder: "i.e. 650, 250",
		gridColumn: "half",
	},
	{
		name: "performedBy",
		label: "Vetinary",
		placeholder: "i.e. John Artz",
		gridColumn: "half",
	},
	{
		name: "cost",
		label: "Cost",
		placeholder: "i.e. 1500, 6000",
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

export default function EditHealthRecord({
	params,
}: { params: Promise<{ id: string }> }) {
	const [isSuccess, setIsSuccess] = useState(false);
	const resolvedParams = use(params);
	const id = Number.parseInt(resolvedParams.id);

	const [updateRecord] = useUpdateHealthRecordByIdMutation();

	const onSubmit = async (data: UpdateHealthRecord) => {
		data.recordDate = data.recordDate
			? format(data.recordDate, "yyyy-MM-dd")
			: undefined;
		data.cost = data.cost ? Number.parseInt(`${data.cost}00`) : undefined;

		const response = await updateRecord({ id, data });

		if (response.data && response.error === undefined) {
			setIsSuccess(true);
		}

		console.table(response);
	};

	return (
		<div className="bg-gray-50 dark:bg-gray-950 rounded-lg p-2">
			<div className="m-2">
				<BackButton href="/health-records">Back to all records</BackButton>
			</div>
			{isSuccess ? (
				<SuccessStep
					title="Update Success!"
					description="The health record has successfully been updated"
					link="/health-records"
					linkText="View all records"
				/>
			) : (
				<GeneralForm
					title={`Edit Health Record #${id}`}
					description="Fill in the form to edit this record"
					onSubmit={onSubmit}
					schema={updateHealthRecordSchema}
					fields={healthRecordFields}
				/>
			)}
		</div>
	);
}
