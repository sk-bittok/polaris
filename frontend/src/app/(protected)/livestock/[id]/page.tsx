'use client';

import { Calendar, Weight, Clock, Rabbit, Dog, Venus, Mars, Info, Tag, DollarSign, Activity, Users, ShoppingCart } from "lucide-react";
import { useGetLivestockByIdQuery } from "@/state/api";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function LivestockPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const { isError, isLoading, isSuccess, data, error } = useGetLivestockByIdQuery(Number.parseInt(resolvedParams.id));

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

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";

    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const formatWeight = (weight) => {
    if (!weight) return "Not recorded";
    return `${weight} kg`;
  };

  const formatCurrency = (amount) => {
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
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
                  <Button className="bg-red-500/90 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content with tabs  */}
          <Tabs defaultValue="overview" className="p-6">
            <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="health">Health & Weight</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <Calendar className="text-blue-500 dark:text-blue-400 mr-3" size={22} />
                    <div>
                      <h3 className="text-sm text-blue-600 dark:text-blue-300 uppercase font-medium">Age</h3>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        Born {formatDate(data.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <Weight className="text-blue-500 dark:text-blue-400 mr-3" size={22} />
                    <div>
                      <h3 className="text-sm text-blue-600 dark:text-blue-300 uppercase font-medium">Weight</h3>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {formatWeight(data.currentWeight)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <DollarSign className="text-blue-500 dark:text-blue-400 mr-3" size={22} />
                    <div>
                      <h3 className="text-sm text-blue-600 dark:text-blue-300 uppercase font-medium">Value</h3>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {formatCurrency(data.purchasePrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parentage Section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Parentage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-lg mr-4">
                      <Mars size={24} className="text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sire</p>
                      <Link href={`/livestock/${data.parentMaleName}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        {data.parentMaleName || "Unknown"}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-pink-100 dark:bg-pink-800 p-3 rounded-lg mr-4">
                      <Venus size={24} className="text-pink-600 dark:text-pink-300" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dam</p>
                      <Link href={`/livestock/${data.parentFemaleName}`} className="text-pink-600 dark:text-pink-400 hover:underline font-medium">
                        {data.parentFemaleName || "Unknown"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Note Preview */}
              {data.notes && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <Info size={20} className="text-gray-600 dark:text-gray-300 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notes</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{data.notes}</p>
                  <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0 mt-2">
                    Read more
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Internal ID</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{data.pid}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Tag ID</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{data.tagId}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Species</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium capitalize">{data.specieName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Breed</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{data.breedName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Gender</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium capitalize">{data.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Status</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{data.status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Purchase Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Purchase Date</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{formatDate(data.purchaseDate)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Purchase Price</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{formatCurrency(data.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Organization ID</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{data.organisationPid}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Record Created By</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{data.createdByName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Created On</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{formatDate(data.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{formatDate(data.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Health & Weight Tab */}
            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Weight History</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                      <span className="text-gray-500 dark:text-gray-400">Birth Weight</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{formatWeight(data.weightAtBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Current Weight</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{formatWeight(data.currentWeight)}</span>
                    </div>
                  </div>

                  {/* Weight chart placeholder */}
                  <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Activity size={32} className="mx-auto mb-2" />
                      <p>Weight tracking chart</p>
                      <Button variant="outline" className="mt-2 text-xs">View weight history</Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Health Records</h3>

                  {/* Health records placeholder */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Activity size={32} className="mx-auto mb-2" />
                      <p>No health records found</p>
                      <Button variant="outline" className="mt-2 text-xs">Add health record</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notes about {data.name}</h3>
                  <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400">
                    Edit Notes
                  </Button>
                </div>

                {data.notes ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {data.notes}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                    <Info size={32} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-500 dark:text-gray-400">No notes have been added yet.</p>
                    <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">Add Notes</Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" className="flex items-center gap-2">
                <Users size={16} />
                <span>View Related</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingCart size={16} />
                <span>Mark for Sale</span>
              </Button>
              <Link href="/livestock" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                Back to All Livestock
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
