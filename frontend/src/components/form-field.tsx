import type React from "react";
import type { Control, ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import { FormField as ShadcnFormField, FormControl, FormMessage, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ReactNode } from "react";
import { Popover, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "./ui/calendar";


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
    step?: string;
    min?: string;
    max?: string;
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
  min,
  max,
  step,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <ShadcnFormField control={control} name={name} {...props} render={({ field }) => (
      <FormItem className={className}>
        <div className="flex items-center justify-between">
          <FormLabel className={className} >{label}</FormLabel>
          <FormMessage />
        </div>

        {type === 'date' ? (
          <Popover>
            <PopoverTrigger asChild>
              <FormControl >
                <Button
                  variant='outline'
                  className={cn("w-[240px] pl-3 text-left font-normal", !field.value && 'text-muted-foreground')}
                >
                  {field.value ? (
                    format(new Date(field.value), "yyyy-MM-dd")
                  ) : (
                    <span>Pick a date</span>
                  )
                  }
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-lg" align="start" sideOffset={5}>
              <Calendar
                mode="single"
                selected={field.value} onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1990-01-01")
                }
                initialFocus
                className="border rounded-md"
              />
            </PopoverContent>
          </Popover>
        ) : (
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

                case 'number':
                  return (
                    <Input
                      placeholder={placeholder}
                      max={max}
                      min={min}
                      step={step}
                      className={inputClassName}
                    />
                  );

                default:
                  return (
                    <Input
                      placeholder={placeholder}
                      type={type}
                      className={inputClassName}
                      {...field}
                      value={field.value ?? ''}
                    />
                  );
              }
            })()}
          </FormControl>
        )}
      </FormItem>
    )} />
  );
}
