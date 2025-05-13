'use client';

import { CircleAlert, Calendar, Weight, Clock, Rabbit, Dog, Venus, Mars, Info, Tag, DollarSign, Activity, Users, ShoppingCart, Trash2 } from "lucide-react";
import { useGetLivestockByIdQuery, useDeleteLivestockByIdMutation } from "@/state/api";
import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function LivestockPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const router = useRouter();

  const { isError, isLoading, isSuccess, data, error } = useGetLivestockByIdQuery(Number.parseInt(resolvedParams.id));
  const [deleteLivestock] = useDeleteLivestockByIdMutation();

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteLivestock(Number.parseInt(resolvedParams.id));
      if (response.error) {
        toast.error(`Failed to delete record ${response.error.message}`);
        return;
      }

      toast.success('Livestock successfully deleted');
      router.push("/livestock");
    } catch (e) {
      toast.error('Failed to delete record');
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 dark:bg-red-900 p-8 rounded-lg shadow-md text-center">
          {error.error ? (
            <>
              <h2 className="text-red-700 dark:text-red-300 text-2xl font-bold">Error: 500</h2>
              <p className="text-red-500 dark:text-red-400">An error occurred: {error.error}</p>
            </>
          ) : (
            <>
              <h2 className="text-red-700 dark:text-red-300 text-2xl font-bold">Error: {error?.status}</h2>
              <p className="text-red-500 dark:text-red-400">An error occurred: {error?.data.message}</p>
            </>
          )}
          <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white">
            <Link href="/livestock">Return to Livestock</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-16 h-16 border-b-4 border-t-4 border-blue-500 dark:border-blue-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading livestock information...</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";

    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const formatWeight = (weight?: string) => {
    if (!weight) return "Not recorded";
    return `${weight} kg`;
  };

  const formatCurrency = (amount?: string) => {
    if (!amount) return "Not recorded";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getAnimalEmoji = (species: string) => {
    const speciesLower = species?.toLowerCase() || "";
    if (speciesLower.includes("cattle")) return "🐄";
    if (speciesLower.includes("sheep")) return "🐑";
    if (speciesLower.includes("goat")) return "🐐";
    if (speciesLower.includes("pig")) return "🐖";
    if (speciesLower.includes("horse")) return "🐎";
    if (speciesLower.includes("chicken")) return "🐓";
    return "🐾";
  };

  const getFatherTerm = (species: string) => {
    const speciesLower = species?.toLowerCase();
    if (speciesLower.includes("cattle")) return "Sire";
    if (speciesLower.includes("sheep")) return "Ram";
    if (speciesLower.includes("goat")) return "Buck";
    if (speciesLower.includes("chicken")) return "Cock";
    if (speciesLower.includes("pig")) return "Boar";
    if (speciesLower.includes("horse")) return "Sire";
  };


  const getMotherTerm = (species: string) => {
    const speciesLower = species?.toLowerCase();
    if (speciesLower.includes("cattle")) return "Dam";
    if (speciesLower.includes("sheep")) return "Ewe";
    if (speciesLower.includes("goat")) return "Doe";
    if (speciesLower.includes("chicken")) return "Hen";
    if (speciesLower.includes("pig")) return "Sow";
    if (speciesLower.includes("horse")) return "Dam";
  };
  return (
    <div className="max-w-screen mx-auto p-4 md:p-6">
      {isSuccess && data && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
          {/* Hero section  */}
          <div className="relative h-64 sm:h-80 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-800 dark:to-blue-600">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 text-9xl">
              {getAnimalEmoji(data.specieName)}
            </div>

            <div className="absolute top-0 right-0 p-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white dark:bg-gray-800 text-blue-800 dark:text-blue-300">{data.status}</span>
            </div>

            <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full" >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <Tag className="mr-2 text-white" size={16} />
                    <span className="uppercase font-mono tracking-wider text-white text-sm font-bold mr-2">
                      {data.tagId}
                    </span>
                    {data.gender === 'male' ? (
                      <Mars size={18} className="text-blue-300" />
                    ) : (
                      <Venus size={18} className="text-pink-300" />
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-white mt-1">{data.name}</h1>
                  <p className="text-gray-200 text-lg capitalize mt-1">
                    {data.breedName} {data.specieName}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/livestock/${data.id}/edit`}
                    className="bg-white/90 hover:bg-white text-blue-600 px-3 py-2 rounded-lg shadow-lg text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleDelete}
                        type="button"
                        className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[435px]">
                      <DialogHeader>
                        <DialogTitle>Remove animal</DialogTitle>
                        <DialogDescription>
                          <span className="flex items-center mb-4" >
                            <CircleAlert size={24} className="mr-2" />
                            This action cannot be undone. Are you sure you want to permanently delete this record from our servers?
                          </span>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex items-center justify-end">
                        <Button
                          onClick={confirmDelete}
                          type="button"
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                          <Trash2 className="mr-2" size={20} />
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {/* Main content with tabs  */}
          <div className="p-6">
            {/* Key stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <Calendar className="text-blue-500 mr-3 dark:text-blue-400" size={22} />
                  <div>
                    <h3 className="text-sm uppercase text-blue-600 font-medium dark:text-blue-300">Age</h3>
                    <p className="text-gray-800 font-medium dark:text-gray-100">Born {formatDate(data.dateOfBirth)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <Weight size={22} className="text-blue-500  mr-3 dark:text-blue-400" />
                  <div>
                    <h3 className="text-sm uppercase text-blue-600 font-medium dark:text-blue-300">Weight</h3>
                    <p className="text-gray-800 font-medium dark:text-gray-100">{formatWeight(data.currentWeight)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <DollarSign size={22} className="text-blue-500  mr-3 dark:text-blue-400" />
                  <div>
                    <h3 className="text-sm uppercase text-blue-600 font-medium dark:text-blue-300">Value</h3>
                    <p className="text-gray-800 font-medium dark:text-gray-100">{formatCurrency(data.purchasePrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content - First Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left side: Basic Info and Purchase details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Internal ID</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{data.pid}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Tag ID</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{data.tagId}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Category</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">{data.specieName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Breed</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">{data.breedName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">{data.status}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Gender</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">{data.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Information */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Purchase Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Purchase Date</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{formatDate(data.purchaseDate)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Purchase Price</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{formatCurrency(data.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Organisation</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">{data.organisationName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle column - Parentage and Record Info */}
              <div className="space-y-6">
                {/* Parentage */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Parentage</h3>
                  <div className="space-y-4">
                    {/* Male parent */}
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg mr-4">
                        <Mars className="text-blue-600 dark:text-blue-300" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{getFatherTerm(data.specieName)}</p>
                        <Link
                          href={`/livestock/${data.parentMaleName}`}
                          className="text-blue-600 hover:underline font-medium dark:text-blue-300">
                          {data.parentMaleName || "Unknown"}
                        </Link>
                      </div>
                    </div>
                    {/* female parent */}
                    <div className="flex items-center">
                      <div className="bg-pink-100 dark:bg-pink-800 p-3 rounded-lg mr-4">
                        <Venus className="text-pink-600 dark:text-pink-300" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{getMotherTerm(data.specieName)}</p>
                        <Link
                          className="text-pink-600 hover:underline font-medium dark:text-pink-300"
                          href={`/livestock/${data.parentFemaleName}`}>{data.parentFemaleName || "Unknown"}</Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Record Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Record Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Created by</span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">{data.createdByName}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Created on</span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">{formatDate(data.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Last updated</span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">{formatDate(data.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Weight History (full column) */}
              <div className="lg:flex lg:flex-col">
                {/* Weight History - Made taller to match the height of the other two columns */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 h-full">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Weight History</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-dark-500 dark:text-gray-400">Birth Weight</span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">{formatWeight(data.weightAtBirth)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-dark-500 dark:text-gray-400">Current Weight</span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">{formatWeight(data.currentWeight)}</span>
                    </div>
                  </div>
                  {/* Weight chart - Made larger to fill space */}
                  <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg flex-grow flex flex-col items-center justify-center h-80">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Activity size={32} className="mx-auto mb-3" />
                      <p>Weight tracking chart</p>
                      <p className="text-sm mt-2 mb-4">Track the animal's growth and development over time</p>
                      <Button variant='outline' size='sm' className="mt-2">View detailed history</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Health and Production Records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Health records */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Health Records</h3>
                  <Button variant='outline' size='sm' className="text-blue-600 dark:text-blue-300">Add Record</Button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <Activity size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No health records found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 mb-4">Track vaccinations, treatments, and health checks</p>
                  <Button variant='outline' size='sm' className="mt-3 text-xs">View all records</Button>
                </div>
              </div>

              {/* Production records */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Production Records</h3>
                  <Button variant='outline' size='sm' className="text-blue-600 dark:text-blue-300">Add Record</Button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <Activity size={24} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No production records found</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 mb-4">Track yields, quality measurements, and performance</p>
                  <Button variant='outline' size='sm' className="mt-3 text-xs">View all records</Button>
                </div>
              </div>
            </div>

            {/* Notes - Full Width */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Notes</h3>
                <Button variant='outline' size='sm' className="text-blue-600 dark:text-blue-300">Edit notes</Button>
              </div>
              {data.notes ? (
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{data.notes}</p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <Info className="mx-auto mb-2 text-gray-400 dark:text-gray-500" size={24} />
                  <p className="text-gray-500 text-sm dark:text-gray-400">No notes have been added yet</p>
                  <Button className="mt-3 text-white text-sm">Add notes</Button>
                </div>
              )}
            </div>
          </div>

          {/* Activity buttons  */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant='outline' className="flex items-center gap-2">
                <Users size={16} />
                <span>View related</span>
              </Button>
              <Button variant='outline' className="flex items-center gap-2">
                <ShoppingCart size={16} />
                <span>Mark for sale</span>
              </Button>
              <Link href="/livestock" className="bg-blue-600 text-sm hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">Back to All Livestock
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
