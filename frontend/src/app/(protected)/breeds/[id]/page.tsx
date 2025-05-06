'use client';

import { useGetBreedByIdQuery } from "@/state/api";
import { use, useState } from "react";
import { Weight, Calendar, Info, Clock, Pencil, Trash2, CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function BreedPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { data, isLoading, isError, error } = useGetBreedByIdQuery(Number.parseInt(resolvedParams.id));
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    router.push('/breeds');
  };

  const handleEdit = () => {
    console.log("Open a modal to update");
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">Failed to load breed information. Try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 dark:border-gray-700 rounded-full animate-spin "></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading breed information ...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-black rounded-lg shadow-lg overflow-hidden">
          {/* Hero section with the image of the breed */}
          <div className="relative h-64 bg-gray-200 dark:bg-gray-800">
            <img
              src="/doesnot-exist"
              alt={`${data?.name} ${data?.specie}`}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 dark:from-white/70 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold">{data?.name}&nbsp;
                  <span className="capitalize">{data?.specie}</span>
                </h1>
              </div>
            </div>
          </div>

          {/* Admin Delete and update */}
          {data && !data.isSystemDefined && (
            <div className="bg-gray-100 dark:bg-gray-900 p-4 flex justify-end space-x-2">
              <button
                onClick={handleEdit}
                type='button' className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Pencil className="mr-2" size={16} />
                Edit
              </button>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    onClick={handleDelete}
                    type="button"
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="mr-2" size={20} />
                    Delete
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[435px]">
                  <DialogHeader >
                    <DialogTitle> Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      <div className="mb-4 flex items-center">
                        <CircleAlert className="mr-2" size={24} />
                        This action cannot be undone. Are you sure you want to permanently delete this file from our servers?
                      </div>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex items-center justify-end">
                    <button
                      onClick={confirmDelete}
                      type="button"
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                      <Trash2 className="mr-2" size={20} />
                      Delete
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/*  Content sections */}
          <div className="p-6">
            {/* Statistics of the breed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Weight className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Weight Range</h3>
                </div>
                <div className="pl-7">
                  <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Male:&nbsp;</span>{data?.maleWeightRange}&nbsp;kg</p>
                  <p className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Female:&nbsp;</span>{data?.femaleWeightRange}&nbsp;kg</p>
                </div>
              </div>


              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="text-green-600 dark:text-green-400 mr-2" size={20} />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Gestation Period</h3>
                </div>
                <div className="pl-7">
                  <p className="text-gray-700 dark:text-gray-300">{data?.gestationPeriod}&nbsp;days</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="text-amber-600 dark:text-amber-400 mr-2" size={20} />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">Record Created</h3>
                </div>
                <div className="pl-7">
                  <p className="text-gray-700 dark:text-gray-300">{data?.createdAt}</p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-lg">
              <div className="flex items-center mb-3">
                <Info className="text-gray-600 dark:text-gray-400 mr-2" size={20} />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">About this Breed</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data?.description}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
