import CustomFormField from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Save } from "lucide-react";
import type { HTMLInputTypeAttribute, ReactNode } from "react";
import {
	type FieldPath,
	type FieldValues,
	useForm,
	type UseFormProps,
} from "react-hook-form";
import type { z } from "zod";

export type FormFieldsConfig<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
	label: string;
	placeholder?: string;
	type?: HTMLInputTypeAttribute;
	inputClassName?: string;
	gridColumn?: "full" | "half";
	options?: { label: string; value: string }[];
};

type FormDialogProps<T extends Record<string, any>> = {
	title: string;
	description: string;
	isOpen: boolean;
	onClose: () => void;
	onCreate: (data: T) => void;
	children: ReactNode;
	schema: z.ZodSchema<T>;
	fields: FormFieldsConfig[];
	formMode?: UseFormProps<T>["mode"];
	submitButtonText?: string;
	submitButtonIcon?: ReactNode;
	defaultValues?: Partial<T>;
};

export default function FormDialogue<T extends Record<string, any>>({
	isOpen,
	title,
	description,
	onClose,
	onCreate,
	children,
	schema,
	fields,
	formMode = "onBlur",
	submitButtonIcon = <Save size={16} />,
	submitButtonText = "Submit",
}: FormDialogProps<T>) {
	const form = useForm<T>({
		resolver: zodResolver(schema),
		mode: formMode,
	});

	const handleClose = () => {
		form.reset();
		onClose();
	};
	const handleSubmit = (data: T) => {
		onCreate(data);
		form.reset();
		onClose();
	};

	// Group fields by their grid configuration
	const renderFields = () => {
		const elements: ReactNode[] = [];
		let i = 0;

		while (i < fields.length) {
			const currentField = fields[i];
			const nextField = fields[i + 1];

			// Check if adjacent fields should be in a grid
			if (
				currentField.gridColumn === "half" &&
				nextField.gridColumn === "half"
			) {
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
							type={currentField.type}
							options={currentField.options}
							inputClassName={currentField.inputClassName}
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
				// Render a single field
				elements.push(
					<CustomFormField
						control={form.control}
						key={currentField.name}
						name={currentField.name}
						label={currentField.label}
						placeholder={currentField.placeholder}
						type={currentField.type}
						options={currentField.options}
						inputClassName={currentField.inputClassName}
					/>,
				);
				i += 1;
			}
		}
		return elements;
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					handleClose();
				}
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader className="flex items-center justify-center">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{/* Scrollable form area */}
				<div className="max-h-[calc(90vh-130px)] overflow-y-auto p-2">
					{/* Render the Form */}
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							{renderFields()}
							<div className="flex items-center justify-end gap-2 text-sm">
								<Button
									type="button"
									variant="outline"
									onClick={() => handleClose()}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="flex items-center gap-2 text-white"
								>
									{submitButtonIcon}
									{submitButtonText}
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
