import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";
import type React from "react";


export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
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
                    <form >
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex item-center">
                                        <Label htmlFor="password" >Password</Label>
                                        <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">Forgot your password?</a>
                                    </div>
                                    <Input id="password" type="password" placeholder="********" required />
                                </div>

                                <Button className="w-full">
                                    Login
                                </Button>
                            </div>

                            <div>
                                Don&apos;t have an account?&nbsp;
                                <a href="/register" className="underline underline-offset-4">Sign up</a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}