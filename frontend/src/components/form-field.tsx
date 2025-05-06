import type React from "react";
import type { Control, ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { FormField as ShadcnFormField, FormControl, FormMessage, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ReactNode } from "react";


type FormFieldProps<TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    label: string | ReactNode;
    description?: string;
    placeholder?: string;
    type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
    className?: string;
    inputClassName?: string;
    control: Control<TFieldValues>,
    name: TName;
    options?: { label: string, value: string }[];
  } & Omit<ControllerProps<TFieldValues, TName>, 'render' | 'control' | 'name'>;

export default function CustomFormField<TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  label,
  description,
  placeholder,
  type = 'text',
  className,
  inputClassName,
  control,
  name,
  options,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <ShadcnFormField control={control} name={name} {...props} render={({ field }) => (
      <FormItem className={className}>
        <div className="flex items-center justify-between">
          <FormLabel className={className} >{label}</FormLabel>
          <FormMessage />
        </div>

        <FormControl>
          {(() => {
            switch (type) {
              case 'textarea':
                return (
                  <Textarea
                    placeholder={placeholder}
                    className={inputClassName}
                    {...field}
                  />
                );
              case 'select':
                return (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={inputClassName}>
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              default:
                return (
                  <Input
                    placeholder={placeholder}
                    type={type}
                    className={inputClassName}
                    {...field}
                    value={type === 'number' ? Number(field.value) : field.value}
                  />
                );
            }
          })()}
        </FormControl>
      </FormItem>
    )} />
  );
}
