import Link from "next/link";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function ErrorState({
  title,
  message,
  actionLabel,
  actionHref,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-red-700 dark:text-red-300 text-2xl font-bold">
        {title}
      </h2>
      <p className="text-red-500 dark:text-red-400 mt-2">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <button
            type="button"
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            {actionLabel}
          </button>
        </Link>
      )}
    </div>
  );
}
