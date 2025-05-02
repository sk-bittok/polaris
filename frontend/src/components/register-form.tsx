'use client';

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2, ChevronRight, Building, User, ChevronLeft } from "lucide-react";
import type { RegisterOrgAndUser, CompanyForm, UserForm } from "@/models/auth";
import { useForm } from "react-hook-form";
import { companyFormSchema, SubscriptionType, userFormSchema } from "@/models/auth";
import { Form,  FormField, FormItem, FormLabel } from "./ui/form";
import CustomFormField from "./form-field";
import { FormControl, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useRegisterAdminMutation } from "@/state/api";
import { useRouter } from "next/navigation";

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<RegisterOrgAndUser>({
        organisation: {
            companyName: "",
            companyAddress: "",
            companyEmail: "",
            companyPhone: "",
            subscriptionType: SubscriptionType.Basic
        },
        user: {
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            confirmPassword: ""
        }
    });
    const companyForm = useForm<CompanyForm>({
        resolver: zodResolver(companyFormSchema),
        mode: "onChange",
        defaultValues: formData.organisation
    });
    const userForm = useForm<UserForm>({
        resolver: zodResolver(userFormSchema),
        mode: "onChange",
        defaultValues: formData.user
    });
    const router = useRouter();
    const [registerUser] = useRegisterAdminMutation();

    const onCompanySubmit = (data: CompanyForm) => {
        setFormData((prev) => ({
            ...prev,
            organisation: data
        }));
        setCurrentStep(2);
    };
    const onUserSubmit = async (data: UserForm) => {
        setFormData((prev) => ({
            ...prev,
            user: data
        }));
        const completeData = {
            organisation: formData.organisation,
            user: data
        };
        const response = await registerUser(completeData);
        if (response.data?.message) {
            setCurrentStep(3);
        }
    }
    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    }
    const StepIndicator = () => {
        return (
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"} text-white`}>
                        <Building size={24} />
                    </div>
                    <div className={`h-1 w-12 ${currentStep > 1 ? "bg-blue-600" : "bg-gray-300"}`} />
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"} text-white`}>
                        <User size={24} />
                    </div>
                    <div className={`h-1 w-12 ${currentStep > 1 ? "bg-blue-600" : "bg-gray-300"}`} />
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"} text-white`}>
                        <CheckCircle2 size={24} />
                    </div>
                </div>
            </div>
        )
    };

    const CompanyForm = () => {
        return (
            <Form  {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold">Create an Account</h1>
                        <p className="text-balance text-sm text-muted-foreground">Enter your company information</p>
                    </div>

                    <CustomFormField control={companyForm.control} name="companyName" label="Company name" placeholder="Pied piper" />
                    <CustomFormField control={companyForm.control} name="companyEmail" label="Company email" placeholder="company@mail.org" />
                    <CustomFormField control={companyForm.control} name="companyAddress" label="Company address" placeholder="25 Privet Drive" />
                    <CustomFormField control={companyForm.control} name="companyPhone" label="Company phone" placeholder="+254701234567" />
                    <FormField
                        control={companyForm.control}
                        name="subscriptionType"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Subscription</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={formData.organisation.subscriptionType}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a subscription" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={SubscriptionType.Basic}>Basic</SelectItem>
                                        <SelectItem value={SubscriptionType.Business}>Business</SelectItem>
                                        <SelectItem value={SubscriptionType.Enterprise}>Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="w-full" type="submit">
                        Next <ChevronRight size={16} className="ml-1" />
                    </Button>
                </form>
            </Form>
        )
    }

    const PersonalForm = () => {
        return (
            <Form {...userForm}>
                <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={userForm.handleSubmit(onUserSubmit)}>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-2xl font-bold">Create an Account</h1>
                        <p className="text-balance text-sm text-muted-foreground">Personal information</p>
                    </div>
                    <CustomFormField control={userForm.control} name="email" label="Email" placeholder="user@example.com" type="email" />
                    <CustomFormField control={userForm.control} name="firstName" label="First name" placeholder="John" />
                    <CustomFormField control={userForm.control} name="lastName" label="Last name" placeholder="Pork" />
                    <CustomFormField control={userForm.control} name="password" label="Password" placeholder="********" type="password" />
                    <CustomFormField control={userForm.control} name="confirmPassword" label="Confirm password" placeholder="********" type="password" />
                    <Button className="w-full" type="submit">
                        Sign up
                    </Button>
                    <Button className="w-full bg-gray-300 hover:bg-gray-400" onClick={handleBack}>
                        <ChevronLeft size={16} className="mr-1" />  Back
                    </Button>
                </form>
            </Form>
        )
    }

    const SuccessStep = () => {
        return (
            <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                    <CheckCircle2 size={64} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Registration complete</h2>
                <p>Thank you for registering {formData?.user.firstName}.
                    &nbsp;Your account for {formData?.organisation.companyName} has been created successfully
                </p>
                <Button className="w-full mt-2" onClick={() => router.push("/login")}>
                    Proceed to login
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto p-8 shadow-md rounded-lg">
            <StepIndicator />
            <div>
                {currentStep === 1 && <CompanyForm />}
                {currentStep === 2 && <PersonalForm />}
                {currentStep === 3 && <SuccessStep />}
            </div>
            <div className="text-center text-sm mt-4">
                Have an account?&nbsp;
                <a href="/login" className="underline underline-offset-4 hover:text-blue-500">Sign in</a>
            </div>
        </div>
    )
}