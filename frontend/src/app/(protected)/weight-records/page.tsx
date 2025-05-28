"use client";

import LoadingSpinner from "@/components/loading-spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetLivestockWeightRecordsQuery } from "@/state/api";
import Link from "next/link";
import { formatDisplayDate, extractErrorMessage } from "@/lib/utils";
import { Eye, Pencil, Trash } from "lucide-react";

export default function WeightRecordsPage() {
  const {
    isLoading,
    isError,
    isSuccess,
    data: weightData,
    error: weightError,
  } = useGetLivestockWeightRecordsQuery(null);

  if (isLoading) {
    return (
      <LoadingSpinner>
        <p>Loading weight records...</p>
      </LoadingSpinner>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-8 shadow-md rounded-lg text-center">
        <h1>Error</h1>
        <p>An error occured during data fetching.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Weight Records</h1>
        <Link
          href="#"
          className="bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-lg text-white hover:opacity-80"
        >
          Add new
        </Link>
      </div>
      <div>
        <Table>
          <TableCaption>A list of all your weight records</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tag ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Weight (KG)</TableHead>
              <TableHead>Record Date</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isSuccess &&
              weightData !== undefined &&
              weightData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.animalTagId}</TableCell>
                  <TableCell className="font-medium">
                    {record.animalName}
                  </TableCell>
                  <TableCell>{record.mass}</TableCell>
                  <TableCell>{formatDisplayDate(record.recordDate)}</TableCell>
                  <TableCell>{record.createdByName}</TableCell>
                  <TableCell>{formatDisplayDate(record.createdAt)}</TableCell>
                  <TableCell className="flex items-center justify-start gap-2">
                    <button
                      type="button"
                      className="bg-green-500 dark:bg-green-600 px-3 py-1.5 text-white text-sm rounded-sm hover:opacity-80"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="bg-blue-500 dark:bg-blue-600 px-3 py-1.5 text-white text-sm rounded-sm hover:opacity-80"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 dark:bg-red-600 px-3 py-1.5 text-white text-sm rounded-sm hover:opacity-80"
                    >
                      <Trash size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
