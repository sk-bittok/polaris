'use client';

import { CircleAlert, Calendar, Weight, Venus, Mars, Info, Tag, DollarSign, Activity, Users, ShoppingCart, Trash2 } from "lucide-react";
import { useGetLivestockByIdQuery, useDeleteLivestockByIdMutation } from "@/state/api";
import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-b border-gray-100 dark:border-gray-700 ${className}`}>
    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">{title}</h3>
    {children}
  </div>
);

const InfoRow = ({ label, value, className = "" }) => (
  <div className="flex justify-between items-center pb-2 gap-4 border-b border-gray-100 dark:border-gray-700">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <span className={`font-medium text-gray-800 dark:text-gray-100 ${className}`}>{value}</span>
  </div>
);

const formatters = {
  date: (dateString) => {
    if (!dateString) {
      return "Not specified";
    }

    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  },
  weight: (weight) => !weight ? "Not recorded" : `${weight} kg`,
  currency: (amount) => !amount ? "Not recorded" : `$${parseFloat(amount).toFixed(2)}`,
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
  return "father";
};


const getMotherTerm = (species: string) => {
  const speciesLower = species?.toLowerCase();
  if (speciesLower.includes("cattle")) return "Dam";
  if (speciesLower.includes("sheep")) return "Ewe";
  if (speciesLower.includes("goat")) return "Doe";
  if (speciesLower.includes("chicken")) return "Hen";
  if (speciesLower.includes("pig")) return "Sow";
  if (speciesLower.includes("horse")) return "Dam";
  return "mother";
};


// Reusable EmptySection Component
const EmptySection = ({ icon, message, description, buttonText }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
    {icon && <span className="mx-auto mb-2 text-gray-400 dark:text-gray-500 flex justify-center">{icon}</span>}
    <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 mb-4">{description}</p>
    {buttonText && <Button variant='outline' size='sm' className="mt-3 text-xs">{buttonText}</Button>}
  </div>
);

// Reusable Section with Header and Action Button
const SectionWithAction = ({ title, actionText, onAction, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      <Button variant='outline' size='sm' className="text-blue-600 dark:text-blue-300" onClick={onAction}>{actionText}</Button>
    </div>
    {children}
  </div>
);

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


  return (
    <div className="max-w-8xl mx-auto p-4 md:p-6">
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
              {[
                { icon: <Calendar size={22} />, label: "Age", value: `Born ${formatters.date(data.dateOfBirth)}` },
                { icon: <Weight size={22} />, label: "Weight", value: formatters.weight(data.currentWeight) },
                { icon: <DollarSign size={22} />, label: "Value", value: formatters.currency(data.purchasePrice) }
              ].map((stat, index) => (
                <div key={index} className="bg-blue-50 dark:bg-blue-900/50 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center">
                    <span className="text-blue-500 mr-3 dark:text-blue-400">{stat.icon}</span>
                    <div>
                      <h3 className="text-sm uppercase text-blue-600 font-medium dark:text-blue-300">{stat.label}</h3>
                      <p className="text-gray-800 font-medium dark:text-gray-100">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main content - First Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
              {/* Left side: Basic Info and Purchase details */}
              <div className="space-y-6">
                {/* Basic Info */}
                <InfoCard title="Basic Information">
                  <div className="space-y-3">
                    <InfoRow label="Internal ID" value={data.pid} />
                    <InfoRow label="Tag ID" value={data.tagId} />
                    <InfoRow label="Category" value={data.specieName} className="capitalize" />
                    <InfoRow label="Breed" value={data.breedName} className="capitalize" />
                    <InfoRow label="Status" value={data.status} className="capitalize" />
                    <InfoRow label="Gender" value={data.gender} className="capitalize" />
                  </div>
                </InfoCard>

                {/* Purchase Information */}
                <InfoCard title="Purchase Information" >
                  <div className="space-y-3">
                    <InfoRow label="Purchase Date" value={formatters.date(data.purchaseDate)} />
                    <InfoRow label="Purchase Price" value={formatters.currency(data.purchasePrice)} />
                    <InfoRow label="Organisation" value={data.organisationName} className="capitalize" />
                  </div>
                </InfoCard>
              </div>

              {/* Middle column - Parentage and Record Info */}
              <div className="space-y-6">
                {/* Parentage */}
                <InfoCard title="Parentage">
                  <div className="space-y-4">
                    {/* Male parent */}
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg mr-4">
                        <Mars className="text-blue-600 dark:text-blue-300" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{getFatherTerm(data.specieName)}</p>
                        <Link
                          href={`/livestock/${data.parentMaleTagId}`}
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
                          href={`/livestock/${data.parentFemaleTagId}`}>{data.parentFemaleName || "Unknown"}</Link>
                      </div>
                    </div>
                  </div>
                </InfoCard>

                {/* Record Info */}
                <InfoCard title="Record Information" >
                  <div className="space-y-3">
                    <InfoRow label="Created By" value={data.createdByName} />
                    <InfoRow label="Created On" value={formatters.date(data.createdAt)} />
                    <InfoRow label="Updated On" value={formatters.date(data.updatedAt)} />
                  </div>
                </InfoCard>
              </div>

              {/* Right Side: Weight History (full column) */}
              <div className="lg:flex lg:flex-col h-full lg:col-span-2 xl:col-span-1">
                {/* Weight History - Made taller to match the height of the other two columns */}
                <InfoCard title="Weight History" >
                  <div className="space-y-3">
                    <InfoRow label="Birth weight" value={formatters.weight(data.weightAtBirth)} />
                    <InfoRow label="Current weight" value={formatters.weight(data.currentWeight)} />
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
                </InfoCard>
              </div>
            </div>

            {/* Second Row - Health and Production Records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
              {/* Health records */}
              <SectionWithAction
                title="Health Records"
                actionText="Add Record"
                onAction={() => { }}>
                <EmptySection
                  icon={<Activity size={24} />}
                  message="No health records found"
                  description="Track vaccinations, treatments, and health checks"
                  buttonText="View all records"
                />
              </SectionWithAction>

              {/* Production records */}
              <SectionWithAction
                title="Production Records"
                actionText="Add Record"
                onAction={() => { }}>
                <EmptySection
                  icon={<Activity size={24} />}
                  message="No production records found"
                  description="Track yields, quality measurements, and performance"
                  buttonText="View all records"
                />
              </SectionWithAction>
            </div>

            {/* Notes - Full Width */}
            <SectionWithAction
              title="Notes"
              actionText="Edit notes"
              onAction={() => router.push(`/livestock/${resolvedParams.id}/edit`)}>
              {data.notes ? (
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{data.notes}</p>
                </div>
              ) : (
                <EmptySection
                  icon={<Info size={24} />}
                  message="No notes have been added yet"
                  description=""
                  buttonText="Add notes"
                />
              )}
            </SectionWithAction>
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
