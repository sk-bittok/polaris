/// The edit and new form use the exact same format when
// it comes to collecting data.

import CustomFormField from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Category, Gender, Status } from "@/models/livestock";
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  FishSymbol,
  Key,
  PoundSterling,
  Save,
} from "lucide-react";
import Link from "next/link";

type Props = {
  form?: any;
  onNext?: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
};

const categoryOptions = [
  { label: "Cattle", value: Category.Cattle },
  { label: "Sheep", value: Category.Sheep },
  { label: "Goat", value: Category.Goat },
  { label: "Pig", value: Category.Pig },
  { label: "Chicken", value: Category.Chicken },
];

const genderOptions = [
  { label: "Male", value: Gender.Male },
  { label: "Female", value: Gender.Female },
  { label: "Unkown", value: Gender.Unkown },
];

const statusOptions = [
  { label: "Active", value: Status.Active },
  { label: "Sold", value: Status.Sold },
  { label: "Transferred", value: Status.Transferred },
  { label: "Deceased", value: Status.Deceased },
];

function FormHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2 mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-balance text-muted-foreground italic">
        {description}
      </p>
    </div>
  );
}

function FormBody({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

function NextButton({
  onNext,
  disabled,
}: {
  onNext?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      className="flex items-center justify-center w-full text-white"
      onClick={onNext}
      disabled={disabled}
      type="button"
    >
      Next <ChevronRight className="mr-2" />
    </Button>
  );
}

function BackButton({
  onBack,
  disabled,
}: {
  onBack?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      className="flex items-center justify-center w-full"
      type="button"
      variant="outline"
      onClick={onBack}
      disabled={disabled}
    >
      <ChevronLeft className="ml-2" />
      Back
    </Button>
  );
}

const formClassName =
  "bg-gray-50 dark:bg-gray-950 p-4 md:p-6 rounded-lg shadow-md";

// Step 1: Collects basic infor regarding the livestock
export function BasicInfoStepForm({ form, onNext }: Props) {
  return (
    <div className={formClassName}>
      <FormHeader
        title="Basic Information"
        description="General information about the livestock"
      />

      <FormBody>
        <CustomFormField
          control={form.control}
          name="specie"
          label="Category"
          type="select"
          inputClassName="w-full"
          options={categoryOptions}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <CustomFormField
            control={form.control}
            name="status"
            label="Status"
            type="select"
            options={statusOptions}
            inputClassName="w-full"
          />
          <CustomFormField
            control={form.control}
            name="gender"
            label="Gender"
            type="select"
            inputClassName="w-full"
            options={genderOptions}
          />
        </div>

        <CustomFormField
          control={form.control}
          name="breed"
          label="Breed"
          placeholder="i.e. Hereford, Nelore"
        />

        <CustomFormField
          control={form.control}
          name="name"
          label="Name"
          placeholder="i.e. Daisy, Ferdinand e.t.c"
        />
        <CustomFormField
          control={form.control}
          name="tagId"
          label="Tag ID"
          placeholder="ID on the ear tag"
        />

        <NextButton onNext={onNext} />
      </FormBody>
    </div>
  );
}

// Step 2: Parentage Historical Information
export function ParentageInfoStepForm({ form, onNext, onBack }: Props) {
  return (
    <div className={formClassName}>
      <FormHeader
        title="Parentage Information"
        description="Fill any parentage info you know"
      />

      <FormBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <CustomFormField
            control={form.control}
            label="Birth Weight"
            name="weightAtBirth"
            placeholder="Values must be in KG"
          />

          <CustomFormField
            control={form.control}
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <CustomFormField
            control={form.control}
            label="Male Parent Tag ID"
            name="parentMaleId"
            placeholder="Tag ID of the father"
          />

          <CustomFormField
            control={form.control}
            label="Female Parent Tag ID"
            name="parentFemaleId"
            placeholder="Tag ID of the mother"
          />
        </div>

        <BackButton onBack={onBack} />
        <NextButton onNext={onNext} />
      </FormBody>
    </div>
  );
}

// Step 3: Purchase Information
export function PuchaseInfoStepForm({ form, onNext, onBack }: Props) {
  return (
    <div className={formClassName}>
      <FormHeader
        title="Purchase Information"
        description="Complete if the animal was procured"
      />

      <FormBody>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <CustomFormField
              control={form.control}
              name="purchasePrice"
              label="Purchase Price"
              placeholder="3000"
            />
          </div>
          <div className="col-span-1">
            <CustomFormField
              control={form.control}
              name="purchasePricePence"
              label="Cents"
              placeholder="50"
            />
          </div>
        </div>

        <CustomFormField
          control={form.control}
          name="purchaseDate"
          label="Purchase Date"
          type="date"
        />

        <BackButton onBack={onBack} />
        <NextButton onNext={onNext} />
      </FormBody>
    </div>
  );
}

// Step 4: Optional Information
export function AdditionalInfoStepForm({ form, isSubmitting, onBack }: Props) {
  return (
    <div className={formClassName}>
      <FormHeader
        title="Additional Information"
        description="Add any details about the animal"
      />

      <FormBody>
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

        <BackButton onBack={onBack} disabled={isSubmitting} />

        <Button className="flex items-center justify-center text-white w-full">
          <Save className="ml-2" size={16} /> Add Livestock
        </Button>
      </FormBody>
    </div>
  );
}

export function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { icon: Key, label: "Basic Info" },
    { icon: FishSymbol, label: "Parentage" },
    { icon: PoundSterling, label: "Purchase" },
    { icon: CirclePlus, label: "Additional" },
    { icon: CheckCircle2, label: "Complete" },
  ];

  return (
    <div className="mb-8">
      {/* Larger screens */}
      <div className="hidden md:flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <span
            key={`label-${index}`}
            className={cn(
              "text-xs text-center flex-1",
              currentStep >= index + 1
                ? "text-blue-600 font-medium"
                : "text-gray-500",
            )}
          >
            {step.label}
          </span>
        ))}
      </div>

      {/* icons and connectors */}
      <div className="flex items-center justify-center">
        {steps.map((Step, index) => (
          <div key={`step-${index}`} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full text-white transition-colors",
                currentStep >= index + 1
                  ? "bg-blue-600 dark:bg-blue-300"
                  : "bg-gray-300 dark:bg-gray-600",
              )}
              aria-label={`Step ${index + 1}: ${steps[index].label}`}
            >
              <Step.icon size={20} />
            </div>

            {/* Connecting line execept for the last one */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 w-8 md:w-12 flex-grow transition-colors",
                  currentStep > index + 1
                    ? "bg-blue-600 dark:bg-blue-300"
                    : "bg-gray-300 dark:bg-gray-600",
                )}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 5: Success
export function SuccessStep() {
  return (
    <div className="bg-white dark:bg-black p-6 md:p-8 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-full">
          <CheckCircle2
            size={64}
            className="text-green-500 dark:text-green-400"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">Registration Complete!</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        The livestock has been successfully added to your records.
      </p>

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
          className="text-white px-4 py-2 rounded-lg bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500"
        >
          View All Livestock
        </Link>
      </div>
    </div>
  );
}
