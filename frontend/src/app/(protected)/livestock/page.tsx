"use client";

import { useGetLivestockQuery } from "@/state/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Status } from "@/models/livestock";

export default function LivestockListPage() {
  const { data, isError, isLoading, isSuccess, error } = useGetLivestockQuery();

  if (isError && data === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 dark:bg-red-900 p-8 rounded-lg shadow-md text-center">
          {error.error ? (
            <>
              <h2 className="text-red-700 dark:text-red-300 text-2xl font-bold">
                Error: 500
              </h2>
              <p className="text-red-500 dark:text-red-400">
                An error occurred: {error.error}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-red-700 dark:text-red-300 text-2xl font-bold">
                Error: {error?.status}
              </h2>
              <p className="text-red-500 dark:text-red-400">
                An error occurred: {error?.data.message}
              </p>
            </>
          )}
          <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white">
            <Link href="/livestock">Return to Livestock</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Livestock</h1>
        <Link
          href="/livestock/new"
          className="flex items-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
        >
          <Plus className="mr-2 w-5 h-5 font-bold" />
          Add new
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : isSuccess && data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No livestock yet.</p>
        </div>
      ) : (
        <div className="overflow-y-auto rounded-xl shadow-sm">
          <table className="min-w-full bg-white dark:bg-gray-900 ">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tag ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Breed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((livestock) => (
                <tr key={livestock.pid} className="hover:opacity-80 ">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                    {livestock.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                    {livestock.tagId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                    {livestock.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100 ">
                    {livestock.specieName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                    {livestock.breedName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                    {livestock.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${livestock.status === Status.Active
                          ? "bg-green-100 text-green-800"
                          : livestock.status === Status.Sold
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                            : livestock.status === Status.Deceased
                              ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                              : "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        }`}
                    >
                      {livestock.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    {formatDistanceToNow(new Date(livestock.updatedAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    <Link
                      href={`/livestock/${livestock.pid}`}
                      className="dark:text-white text-green-900 mr-3 bg-green-100 dark:bg-green-800 rounded-lg px-3 py-1"
                    >
                      View
                    </Link>
                    <Link
                      href={`/livestock/${livestock.pid}/edit`}
                      className="text-indigo-900 dark:text-white bg-indigo-100 dark:bg-indigo-800 rounded-lg px-3 py-1"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
