import CustomFormField from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { UpdateBreedSchema, updateBreedSchema } from "@/lib/schemas/animal";
import { Category } from "@/models/livestock";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/react-dialog";
import React from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";


type Props = {
  isOpen: boolean,
  children: React.ReactNode,
  onUpdate: (data: UpdateBreedSchema) => void,
  onClose: () => void,
}

const categoryOptions = [
  { label: "Cattle", value: Category.Cattle },
  { label: "Sheep", value: Category.Sheep },
  { label: "Goat", value: Category.Goat },
  { label: "Pig", value: Category.Pig },
  { label: "Chicken", value: Category.Chicken },
];

export default function UpdateBreedModal({ isOpen, onClose, onUpdate, children }: Props) {
  const form = useForm<UpdateBreedSchema>({
    resolver: zodResolver(updateBreedSchema),
    mode: 'onChange',
    defaultValues: {
      specie: "",
      name: "",
      maleWeightRange: "",
      femaleWeightRange: "",
      gestationPeriod: "",
      description: ""
    }
  });

  const handleSubmit = (data: UpdateBreedSchema) => {
    onUpdate(data);
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
          <DialogTitle>Update breed</DialogTitle>
          <DialogDescription>Update the record. Click save when done.</DialogDescription>
        </DialogHeader>

        {/* Scrollable area */}
        <div className="overflow-y-auto p-2 max-h-[calc(90vh-130px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <CustomFormField
                control={form.control}
                name="specie"
                type="select"
                options={categoryOptions}
                placeholder="Select livestock category"
                label="Category"
                inputClassName="w-full"
              />

              <CustomFormField
                control={form.control}
                name="name"
                placeholder="breed name i.e. Hereford, Dorper, Guernsey"
                label="Name"
              />

              <CustomFormField
                control={form.control}
                name="maleWeightRange"
                placeholder="i.e. 800-1000"
                label="Male Weight Range"
              />

              <CustomFormField
                control={form.control}
                name="femaleWeightRange"
                placeholder="i.e. 500-680"
                label="Female Weight Range"
              />

              <CustomFormField
                control={form.control}
                name="gestationPeriod"
                placeholder="i.e. 185"
                label="Gestation Period"
              />

              <CustomFormField
                control={form.control}
                name="description"
                placeholder="Describe the breed's characteristics, history, purprose, notable features ..."
                label="Description"
                type="textarea"
                inputClassName="min-h-36"
              />

              <div className="border-t text-sm font-medium mt-2 flex items-center justify-end gap-4 p-6" >
                <Button onClick={handleClose} type="button"
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white"
                >Cancel</Button>

                <Button type="submit"
                  className="flex items-center px-4 py-2 text-white transition-colors "
                >
                  <Save className="" size={20} />
                  Save</Button>
              </div>
            </form>
          </Form>

        </div>
      </DialogContent>
    </Dialog>
  );
}
