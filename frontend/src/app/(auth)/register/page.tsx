import { RegisterForm } from "@/components/register-form";
import { GalleryVerticalEnd } from "lucide-react";


export default function RegisterPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex p-6 md:p-10 flex-col gap-4">
                <div className="flex justify-center gap-2 font-medium">
                    <a href="/" className="flex items-center gap-2 font-medium">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Polaris Inc.
                    </a>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <RegisterForm />
                    </div>
                </div>
            </div>

            <div className="relative hidden bg-muted lg:block">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-400 to to-purple-600 via-indigo-500 dark:from-blue-600 dark:to-purple-400 dark:via-indigo-500 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}