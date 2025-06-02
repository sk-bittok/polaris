import { formatters } from "@/lib/utils";
import type { Livestock } from "@/models/livestock";
import {
	BasicInfo,
	NotesCard,
	ParentageInfo,
	ProfileCard,
	PurchaseInfo,
} from "./overview";
import { useRouter } from "next/navigation";

type Props = {
	className?: string;
	data: Livestock;
	id: string;
};

export default function OverviewTab({ data, id, className }: Props) {
	const router = useRouter();

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Profile Card */}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
				<ProfileCard data={data} />
			</div>
			{/* Tabs Content */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Basic Info */}
				<BasicInfo data={data} />
				{/* Purchase Info */}
				<PurchaseInfo data={data} />
				{/* Parentage Info */}
				<ParentageInfo data={data} />
				{/* Notes card */}
				<NotesCard data={data} id={id} router={router} />
			</div>
		</div>
	);
}
