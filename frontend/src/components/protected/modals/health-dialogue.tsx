import {
  type NewHealthRecord,
  newHealthRecordSchema,
} from "@/lib/schemas/records";
import type { ReactNode } from "react";
import FormDialogue, { type FormFieldsConfig } from "./modal";
import { Save } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewHealthRecord) => void;
  children: ReactNode;
};

const healthRecordFields: FormFieldsConfig[] = [
  {
    name: "tagId",
    label: "Tag ID",
    placeholder: "ID on the ear tag",
    gridColumn: "half",
  },
  {
    name: "recordDate",
    label: "Date",
    type: "date",
    gridColumn: "half",
  },
  {
    name: "recordType",
    label: "Type",
    placeholder: "i.e. treatment, vaccination",
  },
  {
    name: "treatment",
    label: "Treatment",
    placeholder: "i.e. antibiotics, vaccine, suppliments",
  },
  {
    name: "description",
    label: "Description",
    placeholder: "why was it required",
  },
  {
    name: "medicine",
    label: "Medicine",
    placeholder: "if any",
    gridColumn: "half",
  },
  {
    name: "dosage",
    label: "Dosage",
    placeholder: "if drug given",
    gridColumn: "half",
  },
  {
    name: "cost",
    label: "Cost",
    placeholder: "if necessary",
    gridColumn: "half",
  },
  {
    name: "performedBy",
    label: "Vetinary",
    placeholder: "if any",
    gridColumn: "half",
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

export default function HealthRecordDialogue({
  isOpen,
  onClose,
  onCreate,
  children,
}: Props) {
  return (
    <FormDialogue<NewHealthRecord>
      isOpen={isOpen}
      onClose={onClose}
      onCreate={onCreate}
      title="Record new weight"
      description="Add a new weight record for this livestock"
      schema={newHealthRecordSchema}
      fields={healthRecordFields}
      formMode="onBlur"
      submitButtonText="Save"
      submitButtonIcon={<Save className="w-4 h-4" />}
    >
      {children}
    </FormDialogue>
  );
}
