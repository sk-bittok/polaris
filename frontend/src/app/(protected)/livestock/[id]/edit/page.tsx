"use client";

import { Form } from "@/components/ui/form";
import {
	type UpdateLivestockSchema,
	updateLivestockSchema,
} from "@/lib/schemas/animal";
import type { UpdateLivestock } from "@/models/livestock";
import {
	useGetLivestockByIdQuery,
	useUpdateLivestockByIdMutation,
} from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	AdditionalInfoStepForm,
	BasicInfoStepForm,
	ParentageInfoStepForm,
	PuchaseInfoStepForm,
	StepIndicator,
	SuccessStep,
} from "../../components/forms";

export default function EditLivestock({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = use(params);
	const id = resolvedParams.id;
	const router = useRouter();

	const [currentStep, setCurrentStep] = useState(1);

	const { data, isSuccess, isError, error, isLoading } =
		useGetLivestockByIdQuery(id);

	const form = useForm<UpdateLivestockSchema>({
		resolver: zodResolver(updateLivestockSchema),
		mode: "onChange",
		defaultValues: {
			specie: null,
			breed: undefined,
			name: undefined,
			gender: null,
			status: null,
			tagId: undefined,
			dateOfBirth: undefined,
			weightAtBirth: undefined,
			maleParentId: undefined,
			femaleParentId: undefined,
			purchaseDate: undefined,
			purchasePrice: 0,
			purchasePricePence: 0,
			notes: "",
			currentWeight: undefined,
		},
	});

	const [updateLivestock] = useUpdateLivestockByIdMutation();

	useEffect(() => {
		if (isError) {
			toast.error(`An error occurred ${JSON.stringify(error)}`);
			router.push("/livestock");
		}
	}, [isError, error, router]);

	useEffect(() => {
		if (isSuccess && data !== undefined) {
			form.reset({
				specie: data.specieName,
				breed: data.breedName,
				name: data.name,
				gender: data.gender,
				status: data.status,
				tagId: data.tagId,
				// Parentage
				dateOfBirth: data.dateOfBirth,
				weightAtBirth: data.weightAtBirth,
				maleParentId: data.parentMaleTagId,
				femaleParentId: data.parentFemaleTagId,
				//Purchase
				purchaseDate: data.purchaseDate,
				purchasePrice:
					data.purchasePrice !== undefined && data.purchasePrice !== null
						? Number.parseInt(data.purchasePrice.toString().split(".")[0])
						: 0,
				purchasePricePence:
					data.purchasePrice !== undefined && data.purchasePrice !== null
						? Number.parseInt(data.purchasePrice.toString().split(".")[1])
						: 0,
				// additional
				notes: data.notes,
				currentWeight: data.currentWeight,
			});
		}
	}, [isSuccess, data, form]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-screen">
				<div className="w-16 h-16 rounded-full animate-spin border-b-4 border-t-4 border-blue-500 dark:border-blue-400" />
				<p className="mt-4 text-gray-600 dark:text-gray-300">
					Loading livestock information...
				</p>
			</div>
		);
	}

	const { trigger, handleSubmit } = form;

	const handleNext = async (step: number) => {
		setCurrentStep(step + 1);
	};

	const handleBack = async (step: number) => {
		setCurrentStep(step - 1);
	};

	const onSubmit = async (data: UpdateLivestockSchema) => {
		try {
			let purchasePrice = null;
			let currentWeight = null;
			let weightAtBirth = null;

			if (data.purchasePrice) {
				// Get rid of the fractional point.
				const figureString = data.purchasePrice.toString().split(".")[0];
				let figure: string | null = null;
				if (data.purchasePricePence) {
					figure = `${figureString}${data.purchasePricePence}`;
				}

				figure = `${figureString}00`;

				purchasePrice = Number.parseInt(figure);
			}

			if (data.currentWeight) {
				let figure = null;
				const figureString = data.currentWeight.toString();

				if (figureString.includes(".")) {
					const figureArray = figureString.split(".")[0];
					const figureKg = figureArray[0];
					const figureGrams = figureArray[1];
					figure = `${figureKg}${figureGrams}`;
				} else {
					figure = `${figureString}00`;
				}
				currentWeight = Number.parseInt(figure);
			}

			if (data.weightAtBirth) {
				let figure = null;
				const figureString = data.weightAtBirth.toString();

				if (figureString.includes(".")) {
					const figureArray = figureString.split(".")[0];
					const figureKg = figureArray[0];
					const figureGrams = figureArray[1];
					figure = `${figureKg}${figureGrams}`;
				} else {
					figure = `${figureString}00`;
				}
				weightAtBirth = Number.parseInt(figure);
			}

			const jsonData: UpdateLivestock = {
				name: data.name,
				breed: data.breed,
				tagId: data.tagId,
				specie: data.specie,
				gender: data.gender,
				status: data.status,
				purchaseDate: data.purchaseDate,
				notes: data.notes,
				currentWeight: currentWeight,
				dateOfBirth: data.dateOfBirth,
				femaleParentId: data.femaleParentId,
				maleParentId: data.maleParentId,
				purchasePrice: purchasePrice,
				weightAtBirth: weightAtBirth,
			};
			const response = await updateLivestock({ data: jsonData, id });

			if (!response.data) {
				toast.error("An error occurred, try again later.");
				return;
			}
			toast.success("Record updated successfully");
			router.push(`/livestock/${id}`);
			return;
		} catch (e) {
			toast.error("Something went wrong, on our end");
		}
	};

	return (
		<div className="max-w-xl mx-auto p-4 md:p-8">
			<StepIndicator currentStep={currentStep} />

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					{currentStep === 1 && (
						<BasicInfoStepForm form={form} onNext={() => handleNext(1)} />
					)}
					{currentStep === 2 && (
						<ParentageInfoStepForm
							form={form}
							onNext={() => handleNext(2)}
							onBack={() => handleBack(2)}
						/>
					)}
					{currentStep === 3 && (
						<PuchaseInfoStepForm
							form={form}
							onNext={() => handleNext(3)}
							onBack={() => handleBack(3)}
						/>
					)}
					{currentStep === 4 && (
						<AdditionalInfoStepForm
							form={form}
							onBack={() => handleBack(4)}
							isSubmitting={form.formState.isSubmitting}
						/>
					)}
					{currentStep === 5 && <SuccessStep />}
				</form>
			</Form>
		</div>
	);
}
