"use client";

import type { FormFieldsConfig } from "@/components/protected/modals";
import GeneralForm from "@/components/protected/generic-form";
import {
	type UpdateWeightRecord,
	updateWeightRecordSchema,
} from "@/lib/schemas/records";
import { use, useState } from "react";
import { BackButton } from "@/components/protected/records";
import { useUpdateWeightRecordByIdMutation } from "@/state/api";
import { format } from "date-fns";
import SuccessStep from "@/components/protected/success-step";

const weightRecordFields: FormFieldsConfig[] = [
	{
		name: "mass",
		label: "Current Weight",
		placeholder: "i.e 650",
	},
	{
		name: "previousMass",
		label: "Previous Weight",
		placeholder: "630",
		// gridColumn: "half",
	},
	{
		name: "unit",
		label: "Unit",
		placeholder: "i.e. kg, lb",
		gridColumn: "half",
	},
	{
		name: "recordDate",
		label: "Date of Produce",
		type: "date",
		gridColumn: "half",
	},
	{
		name: "status",
		label: "Weight Status",
		placeholder: "normal, underweight, overweight e.t.c",
		// gridColumn: "half",
	},
	{
		name: "notes",
		label: "Notes",
		placeholder:
			"Any thoughts, remarks, or additional info about the current weight",
		inputClassName: "min-h-48",
		type: "textarea",
	},
];

export default function EditWeightRecord({
	params,
}: { params: Promise<{ id: string }> }) {
	const [isSuccess, setIsSuccess] = useState(false);
	const resolvedParams = use(params);
	const id = Number.parseInt(resolvedParams.id);

	const [updateWeight] = useUpdateWeightRecordByIdMutation();

	const onSubmit = async (data: UpdateWeightRecord) => {
		data.recordDate =
			data.recordDate !== undefined
				? format(data.recordDate, "yyyy-MM-dd")
				: undefined;
		data.mass =
			data.mass !== undefined ? Number.parseInt(`${data.mass}00`) : undefined;
		data.previousMass =
			data.previousMass !== undefined
				? Number.parseInt(`${data.previousMass}00`)
				: undefined;

		const response = await updateWeight({ id, data });

		if (response.data && response.error === undefined) {
			setIsSuccess(true);
		}

		console.table(response);
	};

	return (
		<div className="bg-gray-50 dark:bg-gray-950">
			<div className="mb-4 mt-2">
				<BackButton href="/weight-records">Back to all records</BackButton>
			</div>
			{isSuccess ? (
				<SuccessStep
					title="Update Success!"
					description="The weight record has successfully been updated"
					link="/weight-records"
					linkText="View all records"
				/>
			) : (
				<GeneralForm
					title={`Edit Weight Record #${id}`}
					description="Fill in the form to edit this record"
					onSubmit={onSubmit}
					schema={updateWeightRecordSchema}
					fields={weightRecordFields}
				/>
			)}
		</div>
	);
}
