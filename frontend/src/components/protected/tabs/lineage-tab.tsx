import {
	extractErrorMessage,
	formatters,
	extractErrorStatus,
} from "@/lib/utils";
import type { Livestock } from "@/models/livestock";
import {
	ChevronRight,
	Mars,
	Users,
	Venus,
	GitBranch,
	Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
	HeaderButton,
	SearchAndFilter,
	ErrorStateView,
	LoadingStateView,
} from "../utilities";
import TabHeader from "./tab-header";
import OffspringDialogue from "../modals/offspring-dialogue";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { LinkOffspring } from "@/lib/schemas/animal";
import { toast } from "sonner";
import { useLinkOffspringMutation } from "@/state/api";

type Props = {
	className?: string;
	data: Livestock;
	offspring?: Livestock[];
	isLoading?: boolean;
	error?: FetchBaseQueryError | SerializedError;
	isError: boolean;
};

export default function LineageTab({
	className: tabsClassNames,
	data,
	offspring = [],
	isLoading = false,
	isError = false,
	error,
}: Props) {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterGender, setFilterGender] = useState("");
	const [isModalOpen, setModalOpen] = useState(false);
	const [linkOffspring] = useLinkOffspringMutation();

	const onClose = () => {
		setModalOpen(false);
	};

	const onSubmit = async (offspringData: LinkOffspring) => {
		try {
			const response = await linkOffspring(offspringData);
			if (response.data && response.error === undefined) {
				toast.success("Offspring linked successfully", {
					position: "top-center",
					duration: 5000,
				});
				return;
			}
			const error = response.error;
			const message = extractErrorMessage(error);
			toast.error(message, {
				position: "top-center",
				duration: 4000,
			});
		} catch (error) {
			toast.error("Failed to link offspring:", {
				position: "top-center",
			});
		}
	};

	if (isError) {
		const message = extractErrorMessage(error);
		const status = extractErrorStatus(error);
		return <ErrorStateView message={message} title={`Error: ${status}`} />;
	}

	if (isLoading) {
		return <LoadingStateView message="Lineage loading..." />;
	}

	// Filter offspring based on search and gender filter
	const filteredOffspring = offspring.filter((child) => {
		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const searchableFields = [
				child.name,
				child.tagId,
				child.breedName,
			].filter(Boolean);
			if (
				!searchableFields.some((field) => field?.toLowerCase().includes(query))
			) {
				return false;
			}
		}

		// Gender filter
		return !filterGender || child.gender === filterGender;
	});

	const getUniqueGenders = () => {
		const genders = [...new Set(offspring.map((child) => child.gender))];
		return genders.map((gender) => (gender === "male" ? "Male" : "Female"));
	};

	const uniqueGenders = getUniqueGenders();

	const renderParentCard = (
		type: "male" | "female",
		name?: string,
		id?: string,
		tagId?: string,
	) => {
		const isMale = type === "male";
		const bgColor = isMale
			? "bg-blue-50 dark:bg-blue-900/20"
			: "bg-pink-50 dark:bg-pink-900/20";
		const iconBgColor = isMale
			? "bg-blue-100 dark:bg-blue-800"
			: "bg-pink-100 dark:bg-pink-800";
		const textColor = isMale
			? "text-blue-600 dark:text-blue-300"
			: "text-pink-600 dark:text-pink-300";
		const Icon = isMale ? Mars : Venus;
		const term = isMale
			? formatters.getFatherTerm(data.specieName)
			: formatters.getMotherTerm(data.specieName);

		return (
			<div className={`${bgColor} rounded-lg p-4 flex items-center gap-3`}>
				<div className={`${iconBgColor} p-3 rounded-full`}>
					<Icon className={textColor} size={20} />
				</div>
				<div className="flex-1">
					<p className="text-xs text-gray-500 dark:text-gray-400">{term}</p>
					{name ? (
						<Link
							href={`/livestock/${id}`}
							className={`${textColor} hover:underline font-medium flex items-center gap-1`}
						>
							{name}
							<ChevronRight size={14} />
						</Link>
					) : (
						<div className={textColor}>
							<p className="font-medium">Unknown</p>
						</div>
					)}
					{tagId && (
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							Tag: {tagId}
						</p>
					)}
				</div>
			</div>
		);
	};

	const renderOffspringCard = (child: any) => {
		const isMale = child.gender === "male";
		const borderColor = isMale
			? "border-blue-200 dark:border-blue-800"
			: "border-pink-200 dark:border-pink-800";
		const textColor = isMale
			? "text-blue-600 dark:text-blue-300"
			: "text-pink-600 dark:text-pink-300";
		const Icon = isMale ? Mars : Venus;

		return (
			<div
				key={child.id}
				className={`border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
			>
				<div className="flex items-center gap-3 mb-2">
					<Icon className={textColor} size={16} />
					<Link
						href={`/livestock/${child.pid}`}
						className={`${textColor} hover:underline font-medium flex items-center gap-1`}
					>
						{child.name}
						<ChevronRight size={12} />
					</Link>
				</div>

				<div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
					{child.tagId && <p>Tag: {child.tagId}</p>}
					{child.breed && <p>Breed: {child.breed}</p>}
					{child.birthDate && (
						<p>Born: {new Date(child.birthDate).toLocaleDateString()}</p>
					)}
				</div>
			</div>
		);
	};

	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${tabsClassNames}`}
		>
			<TabHeader icon={GitBranch} title="Family Tree">
				<OffspringDialogue
					isOpen={isModalOpen}
					onClose={onClose}
					onCreate={onSubmit}
					parentId={data.pid}
				>
					<HeaderButton
						onClick={() => setModalOpen(true)}
						label="Link Offspring"
						icon={Plus}
					/>
				</OffspringDialogue>
			</TabHeader>

			{/* Parents Section */}
			<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
				<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
					Parents
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{renderParentCard(
						"male",
						data.parentMaleName,
						data.parentMaleId,
						data.parentMaleTagId,
					)}
					{renderParentCard(
						"female",
						data.parentFemaleName,
						data.parentFemaleId,
						data.parentFemaleTagId,
					)}
				</div>
			</div>

			{/* Offspring Section */}
			<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
						Offspring
					</h3>
					<span className="text-sm text-gray-500 dark:text-gray-400">
						{offspring.length} record{offspring.length !== 1 ? "s" : ""}
					</span>
				</div>

				{offspring.length > 0 && (
					<div className="mb-4">
						<SearchAndFilter
							searchQuery={searchQuery}
							filterType={filterGender}
							filterTargets={uniqueGenders}
							onSearch={setSearchQuery}
							onFilter={setFilterGender}
							searchPlaceholder="Search offspring..."
							filterLabel="Gender"
						/>
					</div>
				)}

				{offspring.length === 0 ? (
					<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
						<Users
							size={24}
							className="text-gray-400 dark:text-gray-500 mb-2"
						/>
						<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
							No offspring records found
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
							When this animal has offspring, they will appear here
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredOffspring.map(renderOffspringCard)}
					</div>
				)}

				{offspring.length > 0 && filteredOffspring.length === 0 && (
					<div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
						<Users
							size={24}
							className="text-gray-400 dark:text-gray-500 mb-2"
						/>
						<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
							No offspring match your search criteria
						</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Try adjusting your search or filter settings
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
