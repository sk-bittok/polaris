import type { z } from "zod";
import type { FormFieldsConfig } from "./modals";
import {
	useForm,
	type UseFormReturn,
	type UseFormProps,
} from "react-hook-form";
import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormField from "../form-field";
import { Form } from "../ui/form";
import { Button } from "../ui/button";

interface Props<T extends Record<string, any>> {
	title: string;
	description: string;
	onSubmit: (data: T) => void;
	schema: z.ZodSchema<T>;
	fields: FormFieldsConfig[];
	formMode?: UseFormProps<T>["mode"];
	submitButtonText?: string;
	submitButtonIcon?: ReactNode;
	defaultValues?: Partial<T>;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function renderForm<T extends Record<string, any>>(
	fields: FormFieldsConfig[],
	form: UseFormReturn<T, any, T>,
) {
	const elements: ReactNode[] = [];
	let i = 0;

	while (i < fields.length) {
		const currentField = fields[i];
		const nextField = fields[i + 1];

		// See if adjacent fields should be placed in a grid
		if (currentField.gridColumn === "half" && nextField.gridColumn === "half") {
			// Render them in a grid
			elements.push(
				<div
					key={`grid-${i}`}
					className="grid grid-cols-1 md:grid-cols-2 gap-4"
				>
					<CustomFormField
						control={form.control}
						name={currentField.name}
						label={currentField.label}
						placeholder={currentField.placeholder}
						inputClassName={currentField.inputClassName}
						type={currentField.type}
						options={currentField.options}
					/>
					<CustomFormField
						control={form.control}
						name={nextField.name}
						label={nextField.label}
						placeholder={nextField.placeholder}
						options={nextField.options}
						type={nextField.type}
						inputClassName={nextField.inputClassName}
					/>
				</div>,
			);
			// Skip the next field because rendered
			i += 2;
		} else {
			elements.push(
				<CustomFormField
					control={form.control}
					name={currentField.name}
					key={currentField.name}
					label={currentField.label}
					placeholder={currentField.placeholder}
					type={currentField.type}
					options={currentField.options}
					inputClassName={currentField.inputClassName}
				/>,
			);
			i++;
		}
	}

	return elements;
}

export default function GeneralForm<T extends Record<string, any>>({
	title,
	description,
	onSubmit,
	schema,
	fields,
	formMode = "onBlur",
	submitButtonIcon = <Save size={16} />,
	submitButtonText = "Submit",
	defaultValues,
}: Props<T>) {
	const form = useForm<T>({
		resolver: zodResolver(schema),
		mode: formMode,
	});

	const handleSubmit = (data: T) => {
		onSubmit(data);
	};

	return (
		<div className="mx-auto max-w-xl p-4 md:p-8 rounded-lg shadow-md dark:bg-gray-900 bg-gray-100">
			<Form {...form}>
				<div className="flex flex-col items-center justify-center gap-2 mb-4">
					<h2 className="text-2xl font-bold">{title}</h2>
					<p className="text-sm">{description}</p>
				</div>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="space-y-4 p-2"
				>
					{renderForm(fields, form)}
					<div className="mt-4">
						<Button className="flex items-center gap-2 text-white w-full">
							{submitButtonIcon}
							{submitButtonText}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
