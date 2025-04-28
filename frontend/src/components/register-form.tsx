import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import type React from "react";


export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Create an account to get started
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form >
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="user@example.com" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input id="firstName" type="text" placeholder="John" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Surname</Label>
                                    <Input id="lastName" type="text" placeholder="Pork" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" >Password</Label>
                                    <Input id="password" type="password" placeholder="********" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword" >Confirm password</Label>
                                    <Input id="confirmPassword" type="password" placeholder="********" required />
                                </div>

                                <Button className="w-full">
                                    Login
                                </Button>
                            </div>

                            <div>
                                Have an account?&nbsp;
                                <a href="/login" className="underline underline-offset-4">Sign in</a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}