'use client';

import CustomFormField from "@/components/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Category, createLivestockSchema, CreateLivestockSchema, RegisterLivestock } from "@/models/livestock";
import { useRegisterLivestockMutation } from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, CirclePlus, FishSymbol, Key, PoundSterling, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

export default function RegisterNewLivestock() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formStatus, setFormStatus] = useState({ isSubmitting: false, isError: false, message: "" });

  // Use a single form instance for all steps
  const form = useForm<CreateLivestockSchema>({
    resolver: zodResolver(createLivestockSchema),
    mode: 'onBlur',
    defaultValues: {
      // Mandatory fields
      specie: Category.Cattle,
      gender: "female",
      status: "active",
      breed: "",
      name: "",
      tagId: "",

      // Optional fields have undefined default values
    }
  });

  const { handleSubmit, trigger, formState: { errors } } = form;

  // Fields to validate for each step
  const stepValidationFields = {
    1: ["specie", "gender", "status", "breed", "name", "tagId"],
    2: [],  // Parentage fields are optional
    3: [],  // Purchase fields are optional
    4: []   // Optional fields are, well, optional
  };

  const handleNext = async (step: number) => {
    // Validate fields for current step
    const isValid = await trigger(stepValidationFields[step as keyof typeof stepValidationFields]);

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

    const jsonData: RegisterLivestock = {
      ...data
    };

    try {
      const response = await registerLivestock(jsonData);

      if (response.data) {
        // On success
        setCurrentStep(5);
        setFormStatus({ isSubmitting: false, isError: false, message: "Livestock registered successfully!" });
        console.table((response.data));
        return;
      }

      console.table(response);
      setFormStatus({ isSubmitting: false, isError: true, message: "Registration failed" });
      return;

    } catch (error) {
      setFormStatus({
        isSubmitting: false,
        isError: true,
        message: "Failed to register livestock. Please try again."
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

          {currentStep === 1 && <MandatoryInfoStep form={form} onNext={() => handleNext(1)} />}
          {currentStep === 2 && <ParentageStep form={form} onNext={() => handleNext(2)} onBack={handleBack} />}
          {currentStep === 3 && <PurchaseStep form={form} onNext={() => handleNext(3)} onBack={handleBack} />}
          {currentStep === 4 && <OptionalInfoStep form={form} onBack={handleBack} isSubmitting={formStatus.isSubmitting} />}
          {currentStep === 5 && <SuccessStep />}
        </form>
      </Form>
    </div>
  );
}


function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { icon: Key, label: 'Basic Info' },
    { icon: FishSymbol, label: 'Parentage' },
    { icon: PoundSterling, label: 'Purchase' },
    { icon: CirclePlus, label: 'Additional' },
    { icon: CheckCircle2, label: 'Complete' }
  ];

  return (
    <div className="mb-8">

      {/* Larger screens */}
      <div
        className="hidden md:flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <span
            key={`label-${index}`}
            className={cn('text-xs text-center flex-1', currentStep >= index + 1 ? 'text-blue-600 font-medium' : 'text-gray-500')}>
            {step.label}
          </span>
        ))}
      </div>

      {/* icons and connectors */}
      <div className="flex items-center justify-center">
        {steps.map((Step, index) => (
          <div
            key={`step-${index}`}
            className="flex items-center"
          >
            <div
              className={cn("flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-white transition-colors",
                currentStep >= index + 1 ? "bg-blue-600" : "bg-gray-300")} aria-label={`Step ${index + 1}: ${steps[index].label}`}
            >
              <Step.icon size={20} />
            </div>

            {/* Connecting line execept for the last one */}
            {index < steps.length - 1 && (
              <div
                className={cn("h-1 w-8 md:w-12 flex-grow transition-colors",
                  currentStep > index + 1 ? "bg-blue-600" : "bg-gray-300")} aria-hidden='true'
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Basic inforamtaion about the livestock such as its name, category, breed e.t.c.
function MandatoryInfoStep({ form, onNext }: { form: any, onNext: () => void }) {
  return (
    <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center gap-2 text-center mb-6">
        <h1 className="text-2xl font-bold">Animal Information</h1>
        <p className="text-balance text-sm text-muted-foreground"> All fields are required</p>
      </div>

      <div className="space-y-6">
        <CustomFormField
          control={form.control}
          name="specie"
          label="Category"
          type="select"
          inputClassName="w-full"
          options={[
            { label: "Cattle", value: Category.Cattle },
            { label: "Sheep", value: Category.Sheep },
            { label: "Goat", value: Category.Goat },
            { label: "Chicken", value: Category.Chicken },
            { label: "Pig", value: Category.Pig }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            control={form.control}
            name="gender"
            label="Gender"
            type="select"
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Unknown", value: "unknown" }
            ]}
            inputClassName="w-full"

          />

          <CustomFormField
            control={form.control}
            name="status"
            label="Status"
            type="select"
            options={[
              { label: "Active", value: "active" },
              { label: "Sold", value: "sold" },
              { label: "Transferred", value: "transferred" },
              { label: "Deceased", value: "deceased" },
            ]}
            inputClassName="w-full"
          />

        </div>

        <CustomFormField
          control={form.control}
          name="breed"
          label="Breed"
          placeholder="e.g. Hereford, Angus X for crosses"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            control={form.control}
            name="name"
            label="Name"
            placeholder="e.g. Daisy"
          />

          <CustomFormField
            control={form.control}
            name="tagId"
            label="Tag ID"
            placeholder="ID on the ear tag"
          />
        </div> <Button type="button" onClick={onNext} className="w-full py-6 dark:text-white" > Continue to Parentage <ChevronRight size={16} className="ml-2" /> </Button> </div> </div>);
}

// Step 2 Parentage Information
function ParentageStep({ form, onNext, onBack }: { form: any, onNext: () => void, onBack: () => void }) {
  return (
    <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center gap-2 text-center mb-6">
        <h1 className="text-2xl font-bold">Parentage History</h1>
        <p className="text-balance text-sm text-muted-foreground">Optional: Fill in any known parentage information</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            control={form.control}
            name="weightAtBirth"
            label="Birth Weight (kg)"
            type="number"
            placeholder="0.00"
            step="0.01"
          />

          <CustomFormField
            control={form.control}
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomFormField
            control={form.control}
            name="maleParentId"
            label="Male Parent Tag ID"
            placeholder="Tag ID of the sire"
          />

          <CustomFormField
            control={form.control}
            name="femaleParentId"
            label="Female Parent Tag ID"
            placeholder="Tag ID of the dam"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="order-2 md:order-1 flex-1"
          >
            <ChevronLeft size={16} className="mr-2" /> Back
          </Button>

          <Button
            type="button"
            onClick={onNext}
            className="order-1 md:order-2 flex-1 dark:text-white"
          >
            Continue to Purchase <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step 3: Purchase Information
function PurchaseStep({ form, onNext, onBack }: { form: any, onNext: () => void, onBack: () => void }) {
  return (
    <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center gap-2 text-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Information</h1>
        <p className="text-balance text-sm text-muted-foreground">Optional: Complete if the animal was purchased</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <CustomFormField
              control={form.control}
              name="purchasePrice"
              label="Purchase Price"
              type="number"
              placeholder="0"
              step="1"
            />
          </div>

          <div className="col-span-1">
            <CustomFormField
              control={form.control}
              name="purchasePricePence"
              label="Cents"
              type="number"
              placeholder="00"
              min="0"
              max="99"
              step="1"
            />
          </div>
        </div>

        <CustomFormField
          control={form.control}
          name="purchaseDate"
          label="Date of Purchase"
          type="date"
        />

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="order-2 md:order-1 flex-1"
          >
            <ChevronLeft size={16} className="mr-2" /> Back
          </Button>

          <Button
            type="button"
            onClick={onNext}
            className="order-1 md:order-2 flex-1 dark:text-white"
          >
            Continue to Additional Info <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step 4: Optional Information
function OptionalInfoStep({
  form,
  onBack,
  isSubmitting
}: {
  form: any,
  onBack: () => void,
  isSubmitting: boolean
}) {
  return (
    <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center gap-2 text-center mb-6">
        <h1 className="text-2xl font-bold">Additional Information</h1>
        <p className="text-balance text-sm text-muted-foreground">Optional: Add any additional details about the animal</p>
      </div>

      <div className="space-y-6">
        <CustomFormField
          control={form.control}
          name="currentWeight"
          label="Current Weight (kg)"
          type="number"
          placeholder="0.00"
        />

        <CustomFormField
          control={form.control}
          name="notes"
          label="Notes"
          type="textarea"
          placeholder="Any additional information or remarks about the animal"
          inputClassName="min-h-36"
        />

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="order-2 md:order-1 flex-1 dark:text-white"
            disabled={isSubmitting}
          >
            <ChevronLeft size={16} className="mr-2" /> Back
          </Button>

          <Button
            type="submit"
            className="order-1 md:order-2 flex-1 dark:text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Save size={16} className="mr-2" /> Register Livestock
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step 5: Success
function SuccessStep() {
  return (
    <div className="bg-white dark:bg-black p-6 md:p-8 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-full">
          <CheckCircle2 size={64} className="text-green-500 dark:text-green-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">Registration Complete!</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">The livestock has been successfully added to your records.</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="dark:hover:ring-2 dark:hover:ring-green-400"
        >
          Register Another
        </Button>

        <Button
          onClick={() => window.location.href = "/livestock"}
          className="dark:text-white"
        >
          View All Livestock
        </Button>
      </div>
    </div>
  );
}
