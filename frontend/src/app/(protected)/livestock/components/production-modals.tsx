import CustomFormField from "@/components/form-field";
import { Button } from "@/components/ui/button";
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
  NewProductRecord,
  newProductRecordSchema,
} from "@/lib/schemas/records";
import { useNewLivestockProductionRecordMutation } from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewProductRecord) => void;
  children: ReactNode;
};

export default function ProductDialog({
  isOpen,
  onCreate,
  onClose,
  children,
}: Props) {
  const form = useForm<NewProductRecord>({
    resolver: zodResolver(newProductRecordSchema),
    mode: "onChange",
  });

  const [addProductionRecord] = useNewLivestockProductionRecordMutation();

  const onSubmit = async (data: NewProductRecord) => {
    onCreate(data);
    form.reset();
    onClose();
  };

  const handleClose = () => {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Production Record</DialogTitle>
          <DialogDescription>
            Add a new milk, egg or other product record
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto p-2 max-h-[calc(90vh-130px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CustomFormField
                control={form.control}
                name="tagId"
                label="Tag ID"
                placeholder="ID on the ear tag"
              />
              <CustomFormField
                control={form.control}
                name="productionType"
                label="Production Type"
                placeholder="i.e. milk, eggs, wool, e.t.c"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  name="quantity"
                  label="Quantity"
                  placeholder="i.e. 30, 7.5"
                />
                <CustomFormField
                  control={form.control}
                  name="unit"
                  label="Unit"
                  placeholder="i.e litres, kg, bales"
                  inputClassName="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  control={form.control}
                  name="recordDate"
                  label="Date of produce"
                  type="date"
                />
                <CustomFormField
                  control={form.control}
                  name="quality"
                  label="Quality"
                  placeholder="quality of the product"
                />
              </div>

              <CustomFormField
                control={form.control}
                name="notes"
                label="Notes"
                placeholder="Any additional notes or remarks about the produce"
                type="textarea"
                inputClassName="min-h-32"
              />

              <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="text-white flex items-center gap-2"
                >
                  <Save size={16} />
                  Add Record
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
