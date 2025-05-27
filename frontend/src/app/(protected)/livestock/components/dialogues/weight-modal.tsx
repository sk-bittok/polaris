import CustomFormField from "@/components/form-field";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
	type NewWeightRecord,
	newWeightRecordSchema,
} from "@/lib/schemas/records";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";

type Props = {
	isOpen: boolean;
	onCreate: (data: NewWeightRecord) => void;
	onClose: () => void;
	children: ReactNode;
};

export default function WeightRecordDialog({
	children,
	onCreate,
	onClose,
	isOpen,
}: Props) {
	const form = useForm<NewWeightRecord>({
		resolver: zodResolver(newWeightRecordSchema),
		mode: "onBlur",
	});

	const handleSubmit = (data: NewWeightRecord) => {
		console.table(data);
		onCreate(data);
		onClose();
	};

	const handleClose = () => {
		form.reset();
		onClose();
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
				<DialogHeader>
					<DialogTitle>New Weight Record</DialogTitle>
					<DialogDescription>
						Add a new weight record for this livestock
					</DialogDescription>
				</DialogHeader>
				{/* Scrollable area */}
				<div className="max-h-[calc(90vh-130px)] overflow-y-auto">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<CustomFormField
								control={form.control}
								name="tagId"
								label="Tag ID"
								placeholder="ID on the ear"
							/>

							<CustomFormField
								control={form.control}
								name="mass"
								label="Weight"
								placeholder="Specify the weight in Kilogrammes"
							/>

							<CustomFormField
								control={form.control}
								name="recordDate"
								type="date"
								label="Date of Measurement"
							/>

							<CustomFormField
								control={form.control}
								name="notes"
								label="Notes"
								type="textarea"
								placeholder="Any additional thoughts, knowledge, e.t.c"
								inputClassName="min-h-36"
							/>

							<div className="flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => handleClose()}
									className="bg-red-500 dark:bg-red-600 hover:opacity-80 px-4 py-2 rounded-lg text-white"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="flex items-center gap-1 bg-blue-500 dark:bg-blue-600 hover:opacity-80 px-4 py-2 rounded-lg text-white"
								>
									<Save className="h-4 w-4 text-gray-800 dark:text-gray-100" />
									Submit
								</button>
							</div>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
