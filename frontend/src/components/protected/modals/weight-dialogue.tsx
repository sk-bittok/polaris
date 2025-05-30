import {
  type NewWeightRecord,
  newWeightRecordSchema,
} from "@/lib/schemas/records";
import type { ReactNode } from "react";
import FormDialogue, { type FormFieldsConfig } from "./modal";
import { Save } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewWeightRecord) => void;
  children: ReactNode;
};

const weightRecordFields: FormFieldsConfig[] = [
  {
    name: "tagId",
    label: "Tag ID",
    placeholder: "ID on the ear tag",
  },
  {
    name: "mass",
    label: "Weight",
    placeholder: "Specify the weight in Kilogrammes",
  },
  {
    name: "recordDate",
    label: "Date of Measurement",
    type: "date",
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder:
      "Any additional thoughts, knowledge, reasons about the weight e.t.c.",
    inputClassName: "min-h-36",
  },
];

export default function WeightRecordDialogue({
  isOpen,
  onClose,
  onCreate,
  children,
}: Props) {
  return (
    <FormDialogue<NewWeightRecord>
      isOpen={isOpen}
      onClose={onClose}
      onCreate={onCreate}
      title="Record new weight"
      description="Add a new weight record for this livestock"
      schema={newWeightRecordSchema}
      fields={weightRecordFields}
      formMode="onBlur"
      submitButtonText="Save"
      submitButtonIcon={<Save className="w-4 h-4" />}
    >
      {children}
    </FormDialogue>
  );
}
