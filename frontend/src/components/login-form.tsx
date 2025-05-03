'use client';

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import type React from "react";
import { Form } from "./ui/form";
import { useForm } from "react-hook-form";
import { type LoginFormType as LoginFormSchema, loginFormSchema } from "@/models/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomFormField from "./form-field";
import { useLoginUserMutation } from "@/state/api";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const navigator = useRouter();
  const [formData, setFormData] = useState<LoginFormSchema>({
    email: "",
    password: ""
  });

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: formData
  });

  const [loginUser] = useLoginUserMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const onSubmit = async (data: LoginFormSchema) => {
    setFormData(data);
    const response = await loginUser(data);

    if (response.data && isAuthenticated) {
      toast.success(`Welcome back ${response.data.name}`, {
        position: "top-center"
      });
      navigator.push("/dashboard");
      return;
    }

    if (response.error) {
      const responseError = response.error;

      if ('data' in responseError) {
        const errorResponse = responseError.data as { message?: string };
        toast.error(`Error ${errorResponse?.message ?? 'Unkown errror'}`, {
          position: 'top-center'
        })
      } else {
        // Likely a SerializedError
        toast.error('Unexpected error occurred', {
          position: 'top-center'
        })
      }

    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your email and password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <CustomFormField<LoginFormSchema> control={form.control} label="Email" name="email" placeholder="user@mail.net" />
                  <CustomFormField<LoginFormSchema> control={form.control} label="Password" name="password" type="password" placeholder="********" />

                  <Button className="w-full">
                    Login
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Don&apos;t have an account?&nbsp;
                  <a href="/register" className="underline underline-offset-4">Sign up</a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
