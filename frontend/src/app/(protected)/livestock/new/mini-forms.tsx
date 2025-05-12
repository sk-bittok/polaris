
import { useForm } from "react-hook-form";
import { FormLabel, Form, } from "@/components/ui/form";
import { basicInfoSchema, type BasicInfoType } from "@/lib/schemas/animal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Gender, Status } from "@/models/livestock";
import CustomFormField from "@/components/form-field";

type FormProps = {
  onNext: () => void;
};

export function BasicInfoForm({ onNext }: FormProps) {
  const form = useForm<BasicInfoType>({
    resolver: zodResolver(basicInfoSchema),
    mode: 'onChange',
    defaultValues: {
      gender: Gender.Male,
      status: Status.Active,
      category: Category.Cattle,
      breed: "",
      name: "",
      tagId: "",
    }
  });

  const onSubmit = () => {
    onNext();
  };

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <div>
            <h3>Basic Information</h3>
            <p>All fields are mandatory</p>
          </div>

          <div >
            <CustomFormField control={form.control} label="Category" name="category" inputClassName="w-full" type="select" options={[
              { label: "Cattle", value: Category.Cattle },
              { label: "Sheep", value: Category.Sheep },
              { label: "Chicken", value: Category.Chicken },
              { label: "Goat", value: Category.Goat },
              { label: "Pig", value: Category.Pig }
            ]} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomFormField control={form.control} label="Gender" name="gender" type="select" options={[
                { label: "Male", value: Gender.Male },
                { label: "Female", value: Gender.Female },
                { label: "Unkown", value: Gender.Unkown },
              ]} />
              <CustomFormField control={form.control} label="Status" name="status" type="select" options={[
                { label: "Active", value: Status.Active },
                { label: "Sold", value: Status.Sold },
                { label: "Transferred", value: Status.Transferred },
                { label: "Deceased", value: Status.Deceased },
              ]} />
            </div>

            <CustomFormField control={form.control} label="Breed" name="breed" placeholder="e.g. Hereford, Dorper" />
            <CustomFormField control={form.control} label="Name" name="name" placeholder="e.g. Chloe" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomFormField control={form.control} label="Tag ID" name="tagId" placeholder="ID on the ear tag" />
              <CustomFormField control={form.control} label="Current Weight" name="currentWeight" placeholder="Mass in Kg" />
            </div>

          </div>
        </div>
      </form>
    </Form>
  )
}
