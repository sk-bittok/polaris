import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { CircleAlert, Trash2 } from "lucide-react";

const DeleteDialogue = ({
	confirmDelete,
	children,
}: {
	confirmDelete: () => void;
	children: React.ReactNode;
}) => (
	<Dialog>
		<DialogTrigger asChild>{children}</DialogTrigger>
		<DialogContent className="sm:max-w-[435px]">
			<DialogHeader>
				<DialogTitle>Remove animal</DialogTitle>
				<DialogDescription>
					<span className="flex items-center mb-4">
						<CircleAlert size={24} className="mr-2" />
						This action cannot be undone. Are you sure you want to permanently
						delete this record from our servers?
					</span>
				</DialogDescription>
			</DialogHeader>

			<div className="flex items-center justify-end">
				<Button
					onClick={confirmDelete}
					type="button"
					className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
				>
					<Trash2 className="mr-2" size={20} />
					Delete
				</Button>
			</div>
		</DialogContent>
	</Dialog>
);

export default DeleteDialogue;
