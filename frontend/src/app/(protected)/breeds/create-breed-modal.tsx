import CustomFormField from "@/components/form-field";
import { Form } from "@/components/ui/form";
import { registerBreedSchema, RegisterBreedSchema, Category } from "@/models/livestock";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DialogHeader, DialogTitle, DialogDescription, DialogContent, Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";

const speciesOptions = [
  { label: "Cattle", value: Category.Cattle },
  { label: "Sheep", value: Category.Sheep },
  { label: "Goat", value: Category.Goat },
  { label: "Pig", value: Category.Pig },
  { label: "Chicken", value: Category.Chicken },
];

type Props = {
  isOpen: boolean;
  onClose: () => void,
  onCreate: (data: RegisterBreedSchema) => void,
  children: React.ReactNode,
}

export default function CreateBreedModal({ isOpen, onClose, onCreate, children }: Props) {
  const [formData, setFormData] = useState<RegisterBreedSchema>({
    specie: "",
    name: "",
    description: "",
    maleWeightRange: "",
    femaleWeightRange: "",
    gestationPeriod: "",
  });

  const form = useForm<RegisterBreedSchema>({
    resolver: zodResolver(registerBreedSchema),
    mode: 'onChange',
    defaultValues: formData
  });

  const handleSubmit = (data: RegisterBreedSchema) => {
    onCreate(data);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register new breed</DialogTitle>
          <DialogDescription>Register a new breed. Click save when your are done</DialogDescription>
        </DialogHeader>

        {/* Scrollabel form area */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-130px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="">
              <div className="space-y-5">

                {/* First column */}
                <div className="space-y-5">
                  <CustomFormField
                    control={form.control}
                    name="specie"
                    type="select"
                    options={speciesOptions}
                    placeholder="Select a specie"
                    label="Species"
                    inputClassName="w-full"
                  />

                  <CustomFormField
                    control={form.control}
                    name="name"
                    placeholder="i.e. Hereford, Dorper"
                    label="Name"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CustomFormField
                      control={form.control}
                      name="maleWeightRange"
                      placeholder="e.g., 1000-1200 kg"
                      label="Male Weight Range"
                    />

                    {/* Second column */}
                    <CustomFormField
                      control={form.control}
                      name="femaleWeightRange"
                      placeholder="e.g., 550-750 kg"
                      label="Female Weight Range"
                    />
                  </div>

                  <CustomFormField
                    control={form.control}
                    name="gestationPeriod"
                    placeholder="e.g., 278 days"
                    label="Gestation Period"
                  />

                  {/* Full width description field */}
                  <CustomFormField
                    control={form.control}
                    name="description"
                    type="textarea"
                    placeholder="Describe the breed's characteristics, history, purpose, and notable features..."
                    label="Description"
                    inputClassName="min-h-32"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 mt-2 rounded-lg shadow-md flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >Cancel
                </button>

                <button
                  type="submit" className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:hover:bg-green-600 disabled:cursor-not-allowed"
                >
                  Create Breed
                </button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

