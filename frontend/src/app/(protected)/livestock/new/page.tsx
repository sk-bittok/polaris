"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import {
	Category,
	Status,
	Gender,
	type RegisterLivestock,
} from "@/models/livestock";
import {
	type CreateLivestockSchema,
	createLivestockSchema,
} from "@/lib/schemas/animal";
import { useRegisterLivestockMutation } from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	PuchaseInfoStepForm,
	BasicInfoStepForm,
	ParentageInfoStepForm,
	AdditionalInfoStepForm,
	SuccessStep,
	StepIndicator,
} from "../components/forms";

export default function RegisterNewLivestock() {
	const [currentStep, setCurrentStep] = useState(1);
	const [formStatus, setFormStatus] = useState({
		isSubmitting: false,
		isError: false,
		message: "",
	});

	const form = useForm<CreateLivestockSchema>({
		resolver: zodResolver(createLivestockSchema),
		mode: "onChange",
		defaultValues: {
			// Mandatory fields
			specie: Category.Cattle,
			gender: Gender.Female,
			status: Status.Active,
			breed: "",
			name: "",
			tagId: "",

			// Optional fields have undefined default values
		},
	});

	const {
		handleSubmit,
		trigger,
		formState: { errors },
	} = form;

	const stepValidationFields = {
		1: ["specie", "gender", "status", "breed", "name", "tagId"],
		2: ["dateOfBirth", "weightAtBirth", "parentMaleId", "parentFemaleID"], // Parentage fields are optional
		3: ["purchasePrice", "purchasePricePence", "purchaseDate"], // Purchase fields are optional
		4: ["currentWeight", "notes"], // Optional fields are, well, optional
	};

	const handleNext = async (step: number) => {
		// Validate fields for current step
		const isValid = await trigger(
			stepValidationFields[step as keyof typeof stepValidationFields],
		);

		if (isValid) {
			setCurrentStep(step + 1);
			window.scrollTo(0, 0);
		}
	};

	const handleBack = () => {
		setCurrentStep(currentStep - 1);
		window.scrollTo(0, 0);
	};

	const [registerLivestock] = useRegisterLivestockMutation();

	const onSubmit = async (data: CreateLivestockSchema) => {
		setFormStatus({ isSubmitting: true, isError: false, message: "" });
		// The backend will convert this figures to a Decimal, therefore they should be in Rust's i64
		// i.e 540 should be 54000
		let purchasePrice = null;
		let currentWeight = null;
		let weightAtBirth = null;

		if (data.purchasePrice) {
			let figure = `${data.purchasePrice}`;

			if (data.purchasePricePence) {
				figure = `${figure}${data.purchasePricePence}`;
			} else {
				figure = `${figure}00`;
			}
			purchasePrice = Number.parseInt(figure);
		}

		if (data.currentWeight !== undefined) {
			let figure = `${data.currentWeight}00`;
			currentWeight = Number.parseInt(figure);
		}

		if (data.weightAtBirth !== undefined) {
			let figure = `${data.weightAtBirth}00`;
			weightAtBirth = Number.parseInt(figure);
		}

		const jsonData: RegisterLivestock = {
			purchasePrice: purchasePrice,
			currentWeight: currentWeight,
			weightAtBirth: weightAtBirth,
			name: data.name,
			breed: data.breed,
			tagId: data.tagId,
			gender: data.gender,
			status: data.status,
			specie: data.specie,
			dateOfBirth: data.dateOfBirth,
			purchaseDate: data.purchaseDate,
			notes: data.notes,
			femaleParentId: data.femaleParentId,
			maleParentId: data.maleParentId,
		};

		try {
			const response = await registerLivestock(jsonData);

			if (response.data) {
				// On success
				setCurrentStep(5);
				setFormStatus({
					isSubmitting: false,
					isError: false,
					message: "Livestock registered successfully!",
				});
				toast.success("Livestock successfully registerd");
				return;
			}

			setFormStatus({
				isSubmitting: false,
				isError: true,
				message: "Registration failed",
			});
			return;
		} catch (error) {
			toast.error(`Error registering livestock ${JSON.stringify(error)}`);
			setFormStatus({
				isSubmitting: false,
				isError: true,
				message: "Failed to register livestock. Please try again.",
			});
		}
	};

	return (
		<div className="max-w-xl mx-auto p-4 md:p-8">
			<StepIndicator currentStep={currentStep} />

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					{/* Display error message if submission fails */}
					{formStatus.isError && (
						<Alert variant="destructive" className="mb-4">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{formStatus.message}</AlertDescription>
						</Alert>
					)}

					{currentStep === 1 && (
						<BasicInfoStepForm form={form} onNext={() => handleNext(1)} />
					)}
					{currentStep === 2 && (
						<ParentageInfoStepForm
							form={form}
							onNext={() => handleNext(2)}
							onBack={handleBack}
						/>
					)}
					{currentStep === 3 && (
						<PuchaseInfoStepForm
							form={form}
							onNext={() => handleNext(3)}
							onBack={handleBack}
						/>
					)}
					{currentStep === 4 && (
						<AdditionalInfoStepForm
							form={form}
							onBack={handleBack}
							isSubmitting={formStatus.isSubmitting}
						/>
					)}
					{currentStep === 5 && <SuccessStep />}
				</form>
			</Form>
		</div>
	);
}
