import {
  type NewOffspringRecord,
  newOffspringRecordSchema,
} from "@/lib/schemas/records";
import type { ReactNode } from "react";
import FormDialogue, { type FormFieldsConfig } from "./modal";
import { Plus } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: NewOffspringRecord) => void;
  children: ReactNode;
  parentId: string;
};

const offspringFields: FormFieldsConfig[] = [
  {
    name: "name",
    label: "Offspring Name",
    placeholder: "Enter name for the offspring",
    gridColumn: "half",
  },
  {
    name: "tagId",
    label: "Tag ID",
    placeholder: "ID on the ear tag",
    gridColumn: "half",
  },
  {
    name: "gender",
    label: "Gender",
    placeholder: "Select gender",
    gridColumn: "half",
  },
  {
    name: "birthDate",
    label: "Birth Date",
    type: "date",
    gridColumn: "half",
  },
  {
    name: "breed",
    label: "Breed",
    placeholder: "Enter breed information",
    gridColumn: "half",
  },
  {
    name: "color",
    label: "Color/Markings",
    placeholder: "Describe color or distinctive markings",
    gridColumn: "half",
  },
  {
    name: "weight",
    label: "Birth Weight (kg)",
    type: "number",
    placeholder: "Enter birth weight",
    gridColumn: "half",
  },
  {
    name: "healthStatus",
    label: "Health Status",
    placeholder: "Select health status",
    gridColumn: "half",
  },
  {
    name: "notes",
    label: "Additional Notes",
    type: "textarea",
    placeholder: "Any additional information about the offspring, birth complications, special care needed, etc.",
    inputClassName: "min-h-32",
  },
];

export default function OffspringDialogue({
  isOpen,
  onClose,
  onCreate,
  children,
  parentId,
}: Props) {
  const handleCreate = (data: NewOffspringRecord) => {
    // Add the parent ID to the offspring data
    const offspringData = {
      ...data,
      parentId,
    };
    onCreate(offspringData);
  };

  return (
    <FormDialogue<NewOffspringRecord>
      isOpen={isOpen}
      onClose={onClose}
      onCreate={handleCreate}
      title="Link New Offspring"
      description="Add a new offspring record and link it to this parent"
      schema={newOffspringRecordSchema}
      fields={offspringFields}
      formMode="onBlur"
      submitButtonText="Link Offspring"
      submitButtonIcon={<Plus className="w-4 h-4" />}
    >
      {children}
    </FormDialogue>
  );
}