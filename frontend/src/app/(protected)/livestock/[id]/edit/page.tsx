'use client';

import { updateLivestockSchema, type UpdateLivestockSchema } from "@/lib/schemas/animal";
import { useGetLivestockByIdQuery, useUpdateLivestockByIdMutation } from "@/state/api";
import { use, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormField from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, ChevronRight, CirclePlus, FishSymbol, Key, PoundSterling, Save } from "lucide-react";
import { Category, Gender, Livestock, Status } from "@/models/livestock";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import Link from "next/link";

export default function EditLivestock({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = Number.parseInt(resolvedParams.id);
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);

  // const { data, isSuccess } = useGetLivestockByIdQuery(id);
  //
  // let livestock: Livestock;
  //
  // if (isSuccess && data !== undefined) {
  //   livestock = data;
  // }

  const form = useForm<UpdateLivestockSchema>({
    resolver: zodResolver(updateLivestockSchema),
    mode: 'onChange',
    // defaultValues: {
    //   specie: livestock !== undefined ? livestock.specieName : '',
    // }
  });
  const [updateLivestock] = useUpdateLivestockByIdMutation();

  const { trigger, handleSubmit } = form;

  const handleNext = async (step: number) => {

    setCurrentStep(step + 1);
  };

  const handleBack = async (step: number) => {
    setCurrentStep(step - 1);
  }

  const onSubmit = async (data: UpdateLivestockSchema) => {
    try {
      const response = await updateLivestock({ data, id });

      if (!response.data) {
        toast.error("An error occurred, try again later.");
        return;
      }

      toast.success('Record updated successfully');
      router.push(`/livestock/${id}`);
      return;
    } catch (e) {
      toast.error('Something went wrong, on our end');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <StepIndicator currentStep={currentStep} />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {currentStep === 1 && <BasicInfoStep form={form} onNext={() => handleNext(1)} />}
          {currentStep === 2 && <ParentageStep form={form} onNext={() => handleNext(2)} onBack={() => handleBack(2)} />}
          {currentStep === 3 && <PurchaseStep form={form} onNext={() => handleNext(3)} onBack={() => handleBack(3)} />}
          {currentStep === 4 && <OptionalInfoStep form={form} onBack={() => handleBack(4)} isSubmitting={form.formState.isSubmitting} />}
          {currentStep === 5 && <SuccessStep />}
        </form>
      </Form>
    </div>
  );
}

function BasicInfoStep({ form, onNext }: { form: any, onNext: () => void }) {
  return (
    <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <h1 className="text-2xl font-bold tracking-tighter">Basic Information</h1>
        <p className="text-sm text-balance text-muted-foreground italic">General information about the particular animal</p>
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
              { label: "Male", value: Gender.Male },
              { label: "Female", value: Gender.Female },
              { label: "Unknown", value: Gender.Unkown }
            ]}
            inputClassName="w-full"
          />
          <CustomFormField
            control={form.control}
            name="status"
            label="Status"
            type="select"
            options={[
              { label: "Active", value: Status.Active },
              { label: "Sold", value: Status.Sold },
              { label: "Transferred", value: Status.Transferred },
              { label: "Deceased", value: Status.Deceased },
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

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
        </div>

        <Button
          type="button"
          onClick={onNext}
          className="w-full py-6 dark:text-white" >
          Continue to Parentage <ChevronRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Step 2
function ParentageStep({ form, onNext, onBack }: { form: any, onNext: () => void, onBack: () => void }) {
  return (
    <div className="bg-white dark:bg-black p-4 md:p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center gap-2 text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tighter">Parentage History</h1>
        <p className="text-balance text-sm text-muted-foreground italic">Optional: Fill in any known parentage information</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <CustomFormField
            control={form.control}
            name="weightAtBirth"
            label="Birth Weight (kg)"
            placeholder="0.00"
          />

          <CustomFormField
            control={form.control}
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            inputClassName="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
        <h1 className="text-2xl font-bold tracking-tighter">Purchase Information</h1>
        <p className="text-balance text-sm text-muted-foreground italic">Optional: Complete if the animal was purchased</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="">
            <CustomFormField
              control={form.control}
              name="purchasePrice"
              label="Purchase Price"
              placeholder="0"
            />
          </div>

          <div className="">
            <CustomFormField
              control={form.control}
              name="purchasePricePence"
              label="Cents"
              placeholder="00"
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
        <h1 className="text-2xl font-bold tracking-tighter">Additional Information</h1>
        <p className="text-balance text-sm text-muted-foreground italic">Optional: Add any additional details about the animal</p>
      </div>

      <div className="space-y-6">
        <CustomFormField
          control={form.control}
          name="currentWeight"
          label="Current Weight (kg)"
          placeholder="0.00"
        />

        <CustomFormField
          control={form.control}
          name="notes"
          label="Notes"
          type="textarea"
          placeholder="Any additional information or remarks about the animal"
          inputClassName="min-h-36 min-w-[460px]"
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

        <Link
          href="/livestock"
          className="dark:text-white px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500"
        >
          View All Livestock
        </Link>
      </div>
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
                currentStep >= index + 1 ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600")} aria-label={`Step ${index + 1}: ${steps[index].label}`}
            >
              <Step.icon size={20} />
            </div>

            {/* Connecting line execept for the last one */}
            {index < steps.length - 1 && (
              <div
                className={cn("h-1 w-8 md:w-12 flex-grow transition-colors",
                  currentStep > index + 1 ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600")} aria-hidden='true'
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
