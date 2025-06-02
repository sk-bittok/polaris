import type { Livestock } from "@/models/livestock";
import { Info, Mars, Venus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Reusable info display component
type InfoCardProps = {
	label: string;
	value: string | number | ReactNode;
	className?: string;
	showBorder?: boolean;
};

export function InfoCard({
	label,
	value,
	className = "",
	showBorder = true,
}: InfoCardProps) {
	const borderClass = showBorder
		? "border-b border-gray-100 dark:border-gray-700 pb-2"
		: "";

	return (
		<div className={`flex justify-between ${borderClass} ${className}`}>
			<span className="text-gray-500 dark:text-gray-400">{label}</span>
			<span className="text-gray-900 dark:text-white font-medium">{value}</span>
		</div>
	);
}

// Reusable gender component with icons
type GenderDisplayProps = {
	gender: string;
	className?: string;
};

export function GenderDisplay({ gender, className = "" }: GenderDisplayProps) {
	const genderIcon =
		gender === "male" ? (
			<Mars size={14} className="text-blue-500" />
		) : (
			<Venus size={14} className="text-pink-500" />
		);

	return (
		<span className={`capitalize flex items-center gap-1 ${className}`}>
			{gender}
			{genderIcon}
		</span>
	);
}

//Reusable card wrapper component
type CardProps = {
	title: string;
	icon?: LucideIcon;
	children: ReactNode;
	className?: string;
};

export function Card({
	title,
	icon: Icon,
	children,
	className = "",
}: CardProps) {
	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}
		>
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
				{Icon && (
					<Icon size={18} className="text-gray-500 dark:text-gray-400" />
				)}
				{title}
			</h2>
			<div className="space-y-3 text-sm">{children}</div>
		</div>
	);
}

// Container for multiple InfoCards
type InfoSectionProps = {
	children: ReactNode;
	className?: string;
};

export function InfoSection({ children, className = "" }: InfoSectionProps) {
	return <div className={`space-y-3 text-sm ${className}`}>{children}</div>;
}

type Props = {
	data: Livestock;
};

export default function BasicInfo({ data }: Props) {
	return (
		<Card title="Basic Information" icon={Info}>
			<InfoSection>
				<InfoCard label="Tag ID" value={data.tagId} />
				<InfoCard
					label="Category"
					value={<span className="capitalize">{data.specieName}</span>}
				/>
				<InfoCard
					label="Breed"
					value={<span className="capitalize">{data.breedName}</span>}
				/>
				<InfoCard
					label="Status"
					value={<span className="capitalize">{data.status}</span>}
				/>
				<InfoCard
					label="Gender"
					value={<GenderDisplay gender={data.gender} />}
					showBorder={false}
				/>
			</InfoSection>
		</Card>
	);
}
