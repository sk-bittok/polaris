import { z } from "zod";

export enum SubscriptionType {
    Basic = "basic",
    Business = "business",
    Enterprise = "enterprise",
}

export const companyFormSchema = z.object({
    companyName: z.string().min(2, { message: "Name requires 2 characters" })
        .max(200, { message: "Name is too long" }),
    companyAddress: z.string().max(200, { message: "Address is too long" })
        .nullable(),
    companyPhone: z.string().min(10, { message: "Phone is too short" })
        .max(12, { message: "Phone is too long" }).nullable(),
    companyEmail: z.string().email({ message: "Invalid email" }).nullable(),
    subscriptionType: z.enum(["basic", "business", "enterprise"], {
        message: "Basic, business and enterprise only",
    }),
});

export const userFormSchema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    firstName: z.string().min(2, { message: "Name is too short" })
        .max(50, { message: "Name is too long" }),
    lastName: z.string().min(2, { message: "Name is too short" }).max(50, {
        message: "Name is too long",
    }),
    password: z.string().min(8, { message: "Password requires 8 characters" })
        .max(48, { message: "Password must be under 48 chars" }),
    confirmPassword: z.string(),
})
    .refine((data) => data.confirmPassword === data.password, {
        message: "Passwords must match",
        path: ["confirmPassword"],
    });

export const loginFormSchema = z.object({
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(2, { message: "Password too short" })
        .max(100, { message: "Password too long" }),
});

export type CompanyForm = z.infer<typeof companyFormSchema>;
export type UserForm = z.infer<typeof userFormSchema>;

export type RegisterOrgAndUser = {
    organisation: CompanyForm;
    user: UserForm;
};

export type LoginForm = z.infer<typeof loginFormSchema>;
