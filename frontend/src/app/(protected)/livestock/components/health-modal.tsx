import CustomFormField from "@/components/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import {
  type NewHealthRecord,
  newHealthRecordSchema,
} from "@/lib/schemas/records";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import type React from "react";
import { useForm } from "react-hook-form";

type Props = {
  isOpen: boolean;
  onCreate: (data: NewHealthRecord) => void;
  onClose: () => void;
  children: React.ReactNode;
};

export default function HealthRecordDialog({
  isOpen,
  onCreate,
  onClose,
  children,
}: Props) {
  const form = useForm<NewHealthRecord>({
    resolver: zodResolver(newHealthRecordSchema),
    mode: "onChange",
  });
  const handleClose = () => {
    form.reset();
    onClose();
  };
  const handleSubmit = (data: NewHealthRecord) => {
    onCreate(data);
    form.reset();
    onClose();
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>New health record</DialogTitle>
          <DialogDescription>
            Add a treatment, vaccination, or other medical procedure
          </DialogDescription>
        </DialogHeader>
        {/* Scrollable form secttion */}
        <div className="overflow-y-auto p-2 max-h-[calc(120vh-130px)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <CustomFormField
                  control={form.control}
                  name="tagId"
                  label="Tag ID"
                  placeholder="Tag ID on the ear"
                />
                <CustomFormField
                  control={form.control}
                  name="recordDate"
                  label="Record Date"
                  type="date"
                />
              </div>
              <CustomFormField
                control={form.control}
                name="recordType"
                label="Type"
                placeholder="i.e. treatment, vaccination, e.t.c"
              />
              <CustomFormField
                control={form.control}
                name="treatment"
                label="Treatment"
                placeholder="i.e. Antibiotics, vaccine, suppliments"
              />
              <CustomFormField
                control={form.control}
                name="description"
                label="Description"
                placeholder="Describe what ailed the animal"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <CustomFormField
                  control={form.control}
                  name="medicine"
                  label="Medicine"
                  placeholder="drug given if possible"
                />
                <CustomFormField
                  control={form.control}
                  name="dosage"
                  label="Dosage"
                  placeholder="dosage in mgs if necessary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <CustomFormField
                  control={form.control}
                  name="cost"
                  label="Cost"
                  placeholder="cost of treatment if necessary"
                />
                <CustomFormField
                  control={form.control}
                  name="performedBy"
                  label="Vetinarian"
                  placeholder="Name of the vetinary"
                />
              </div>
              <CustomFormField
                control={form.control}
                name="notes"
                label="Notes"
                type="textarea"
                placeholder="Any additional thoughts, observations e.t.c"
                inputClassName="min-h-32"
              />

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-red-500 px-4 py-2 rounded-lg dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                >
                  <Save className="h-4 w-4 text-gray-800 dark:text-gray-100" />
                  Save
                </button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
