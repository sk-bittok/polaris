import type React from "react";
import type { Control, ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { FormField as ShadcnFormField, FormControl, FormMessage, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";


type FormFieldProps<TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
        label: string;
        description?: string;
        placeholder?: string;
        type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
        className?: string;
        inputClassName?: string;
        control: Control<TFieldValues>,
        name: TName;
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
    ...props
}: FormFieldProps<TFieldValues, TName>) {
    return (
        <ShadcnFormField control={control} name={name} {...props} render={({ field }) => (
            <FormItem className={className}>
                <div className="flex items-center justify-between">
                    <FormLabel>{label}</FormLabel>
                    <FormMessage />
                </div>

                <FormControl>
                    <Input placeholder={placeholder} type={type} className={inputClassName} {...field} value={type === 'number' ? Number(field.value) : field.value} />
                </FormControl>
            </FormItem>
        )} />
    );
}