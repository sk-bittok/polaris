import { CheckCheck } from "lucide-react";
import Link from "next/link";

interface Props {
    title: string;
    description: string;
    link: string;
    linkText: string;
}

export default function SuccessStep({ title, description, link, linkText }: Props) {

    return (
        <div className="p-6 md:p-8 rounded-xl shadow-md text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-full">
                    <CheckCheck size={64} className="text-green-500 dark:text-green-400" />
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">{title}</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={link} className="text-white px-4 py-2 bg-blue-500 dark:bg-blue-600 hover:opacity-85 rounded-lg" >{linkText}</Link>
            </div>
        </div>
    )
}