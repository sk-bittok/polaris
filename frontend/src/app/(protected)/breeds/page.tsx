"use client";

import type { Breed } from "@/models/livestock";
import { useCreateBreedMutation, useGetBreedsQuery } from "@/state/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, X, ChevronRight } from "lucide-react";
import type { RegisterBreedSchema } from "@/lib/schemas/animal";
import { BreedDialogue } from "@/components/protected/modals";
import { extractErrorStatus, extractErrorMessage } from "@/lib/utils";
import {
	ErrorStateView,
	LoadingStateView,
} from "@/components/protected/utilities";
import { toast } from "sonner";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectGroup,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BreedPage() {
	const { isError, isLoading, isSuccess, data, error } = useGetBreedsQuery();
	const [isModalOpen, setModalOpen] = useState(false);
	const [createBreed] = useCreateBreedMutation();
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSpecie, setFilterSpecie] = useState("all");
	const [activeInitial, setActiveInitial] = useState("");

	const handleCreateBreed = async (breed: RegisterBreedSchema) => {
		try {
			const response = await createBreed(breed);
			if (response.data && response.error !== undefined) {
				return toast.success("Breed added successfully", {
					position: "top-center",
				});
			}
		} catch (e) {
			console.error(e);
		}
	};

	let speciesList: string[] = [];
	let filteredBreeds = [];
	let groupedBreeds = {};
	let allInitials: string[] = [];

	if (isSuccess && data) {
		speciesList = [...new Set(data.map((breed) => breed.specie))];
		filteredBreeds = data
			.filter(
				(breed) =>
					breed.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
					(filterSpecie === "all" || breed.specie === filterSpecie),
			)
			.sort((a, b) => a.name.localeCompare(b.name));
		groupedBreeds = filteredBreeds.reduce((groups, breed) => {
			const initial = breed.name[0].toUpperCase();
			if (!groups[initial]) {
				groups[initial] = [];
			}
			groups[initial].push(breed);
			return groups;
		}, {});
		allInitials = Object.keys(groupedBreeds).sort();
	}
	const scrollToInitial = (initial: string) => {
		const element = document.getElementById(`initial-${initial}`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
			setActiveInitial(initial);
		}
	};

	if (isError) {
		return (
			<ErrorStateView
				title={`Error ${extractErrorStatus(error)}`}
				message={extractErrorMessage(error)}
			/>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 bg-background">
			{/* Header with title and modal opener button */}
			<div className="flex flex-col md:flex-row md:items-center mb-8 justify-between">
				<h1 className="font-bold text-3xl text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
					Breeds
				</h1>

				<BreedDialogue
					isOpen={isModalOpen}
					onCreate={handleCreateBreed}
					onClose={() => setModalOpen(false)}
				>
					<Button
						onClick={() => setModalOpen(true)}
						className="bg-blue-500 dark:bg-blue-600 hover:opacity-85 text-white flex items-center"
					>
						<Plus className="mr-2 h-5 w-5 text-white" />
						Add New Breed
					</Button>
				</BreedDialogue>
			</div>

			{/* Search and filter section */}
			<div className="bg-white dark:bg-black rounded-lg shadow-md p-4 mb-8">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-grow relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400 dark:text-gray-600" />
						</div>
						<Input
							type="text"
							placeholder="Search breeds..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 w-[280px] bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
						/>
					</div>

					<div className="relative w-full md:w-64">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Filter className="w-5 h-5 text-gray-400 dark:text-gray-600" />
						</div>
						<Select
							value={filterSpecie}
							onValueChange={(value) => setFilterSpecie(value)}
						>
							<SelectTrigger className="w-[180px] pl-10 pr-4 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 appearance-none">
								<SelectValue placeholder="All" />
							</SelectTrigger>
							<SelectContent className="">
								<SelectGroup>
									<SelectLabel>Categories</SelectLabel>
									<SelectItem value="all" defaultChecked>
										All
									</SelectItem>
									{speciesList.map((specie) => (
										<SelectItem key={specie} value={specie}>
											{specie.charAt(0).toUpperCase() + specie.slice(1)}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Alphabetical navigation */}
			<div className="hidden md:flex justify-center mb-6 overflow-x-auto">
				<div className="flex space-x-1">
					{allInitials.map((initial) => (
						<button
							type="button"
							key={initial}
							onClick={() => scrollToInitial(initial)}
							className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
								activeInitial === initial
									? "bg-blue-600 text-white dark:bg-blue-800 dark:text-gray-50"
									: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
							}`}
						>
							{initial}
						</button>
					))}
				</div>
			</div>

			{/* Content Section */}
			<div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
				{isLoading ? (
					<LoadingStateView message="Loading breeds" />
				) : filteredBreeds.length === 0 ? (
					<div className="text-center py-16">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-chart-1 rounded-full mb-4">
							<Search className="text-foreground w-8 h-8" />
						</div>
						<h3 className="text-lg font-medium text-foreground mb-1">
							No breeds found
						</h3>
						<p className="text-gray-500">
							{searchTerm || filterSpecie
								? "Try adjusting your search or filter"
								: "No breeds have been added yet"}
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-300 dark:divide-gray-700 space-y-4">
						{Object.keys(groupedBreeds)
							.sort()
							.map((initial) => (
								<div className="px-6" key={initial} id={`initial-${initial}`}>
									<div className="sticky top-0 bg-gray-100 dark:bg-gray-800 px-4 py-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">
										{initial}
									</div>
									<ul className="divide-y divide-gray-200 dark:divide-gray-800">
										{groupedBreeds[initial].map((breed: Breed) => (
											<li
												key={breed.id}
												className="hover:bg-gray-50 dark:hover:bg-gray-950"
											>
												<a
													href={`/breeds/${breed.id}`}
													className="block py-4 px-4"
												>
													<div className="flex items-center justify-between">
														<div>
															<h3 className="text-lg font-medium text-foreground">
																{breed.name}
															</h3>
															<div className="flex items-center mt-1">
																<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 capitalize">
																	{breed.specie}
																</span>
																<span className="ml-2 text-sm text-gray-500">
																	10
																</span>
															</div>
														</div>
														<ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600" />
													</div>
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
					</div>
				)}
			</div>
		</div>
	);
}
