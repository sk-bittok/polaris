"use client";

import {
  Calendar,
  Weight,
  Venus,
  Mars,
  Info,
  Tag,
  DollarSign,
  Activity,
  Users,
  ShoppingCart,
  ChevronLeft,
  Edit3,
  Camera,
  Award,
  Clipboard,
  ChevronRight,
  Clock,
  TrendingUp,
  HeartPulse,
  Plus,
} from "lucide-react";
import {
  useGetLivestockByIdQuery,
  useDeleteLivestockByIdMutation,
} from "@/state/api";
import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatters } from "@/lib/utils";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import { DeleteDialog } from "../components/livestock";

// Weight history mock data
const weightData = [
  { date: "2024-08-24", weight: 45 },
  { date: "2024-09-24", weight: 65 },
  { date: "2024-10-34", weight: 88 },
  { date: "2024-11-24", weight: 110 },
  { date: "2024-12-25", weight: 134 },
  { date: "2025-01-24", weight: 158 },
  { date: "2025-02-25", weight: 179 },
  { date: "2025-03-25", weight: 201 },
  { date: "2025-04-24", weight: 228 },
];

export default function LivestockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const { isError, isLoading, isSuccess, data, error } =
    useGetLivestockByIdQuery(resolvedParams.id);
  const [deleteLivestock] = useDeleteLivestockByIdMutation();

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteLivestock(resolvedParams.id);
      if (response.error) {
        toast.error(`Failed to delete record ${response.error.message}`);
        return;
      }

      toast.success("Livestock successfully deleted");
      router.push("/livestock");
    } catch (e) {
      toast.error("Failed to delete record");
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 dark:bg-red-900 p-8 rounded-lg shadow-md text-center">
          {error.error ? (
            <>
              <h2 className="text-red-700 dark:text-red-300 text-2xl font-bold">
                Error: 500
              </h2>
              <p className="text-red-500 dark:text-red-400">
                An error occurred: {error?.error}
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

  if (isLoading) {
    return (
      <LoadingSpinner>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading livestock information...
        </p>
      </LoadingSpinner>
    );
  }

  const tabsClassNames = "sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-6xl";

  return (
    <div className="max-w-8xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {isSuccess && data && (
        <div className="flex flex-col h-full">
          {/* Top navigation bar */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 max-w-8xl mx-auto">
              <div className="flex items-center gap-2">
                <Link
                  href="/livestock"
                  className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  <span className="text-sm font-medium">All livestock</span>
                </Link>
                <span className="text-gray-400 dark:text-gray-500"></span>
                <span className="text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-1">
                  <span className="text-lg">
                    {formatters.getAnimalEmoji(data.specieName)}
                  </span>
                  {data.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/livestock/${data.id}/edit`}
                  className="text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md flex items-center gap-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </Link>
                <DeleteDialog confirmDelete={confirmDelete}>
                  <Button
                    onClick={handleDelete}
                    type="button"
                    className="text-sm bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md flex items-center gap-1 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    <span>Delete</span>
                  </Button>
                </DeleteDialog>
              </div>
            </div>

            {/* Tabs section */}
            <div className="px-4 max-w-8xl mx-auto">
              <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "health", label: "Health" },
                  { id: "production", label: "Production" },
                  { id: "lineage", label: "Lineage" },
                  { id: "finances", label: "Finances" },
                  { id: "photos", label: "Photos" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium flex-shrink-0 border-b-2 ${activeTab === tab.id
                        ? "border-blue-600 text-blue-500 hover:text-blue-700 dark:border-blue-400 dark:text-blue-400 dark:hover:text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-500"
                      } `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main sections */}
          <div className="flex-grow p-4 md:p-6">
            {activeTab === "overview" && (
              <div className={`space-y-6  ${tabsClassNames}`}>
                {/* Profile card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="md:flex">
                    {/* Left side - photo/avatar */}
                    <div className="relative bg-gradient-to-br from-blue-400 to-purple-500 md:w-1/3 h-48 md:h-auto flex items-center justify-center">
                      <div className="text-9xl">
                        {formatters.getAnimalEmoji(data.specieName)}
                      </div>
                      <button className="absolute bottom-3 right-3 bg-white/80 hover:bg-white p-2 rounded-full shadow-md dark:bg-gray-800/80 dark:hover:bg-gray-800">
                        <Camera
                          size={16}
                          className="text-gray-700 dark:text-gray-300"
                        />
                      </button>
                    </div>

                    {/* Right side - key info */}
                    <div className="p-6 md:flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Tag
                              size={16}
                              className="text-gray-500 dark:text-gray-400"
                            />
                            <span className="uppercase font-mono tracking-wider text-gray-500 dark:text-gray-400 text-sm">
                              {data.tagId}
                            </span>
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full uppercase font-medium">
                              {data.status}
                            </span>
                          </div>

                          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {data.name}
                            {data.gender === "male" ? (
                              <Mars size={18} className="text-blue-500" />
                            ) : (
                              <Venus size={18} className="text-pink-500" />
                            )}
                          </h1>

                          <p className="text-gray-600 dark:text-gray-300 capitalize">
                            {data.breedName} {data.specieName}
                          </p>
                        </div>

                        <div className="hidden md:block">
                          <span className="inline-block bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                            Healthy
                          </span>
                        </div>
                      </div>

                      {/* Key stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                            <Calendar
                              size={16}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Born
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatters.date(data.dateOfBirth)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg">
                            <Weight
                              size={16}
                              className="text-purple-600 dark:text-purple-400"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Weight
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatters.weight(data.currentWeight)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-lg">
                            <DollarSign
                              size={16}
                              className="text-green-600 dark:text-green-400"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Value
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatters.currency(data.purchasePrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Tabs Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Info
                        size={18}
                        className="text-gray-500 dark:text-gray-400"
                      />
                      Basic Information
                    </h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Tag ID
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {data.tagId}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Category
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {data.specieName}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Breed
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {data.breedName}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {data.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Gender
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium capitalize flex items-center gap-1">
                          {data.gender}
                          {data.gender === "male" ? (
                            <Mars size={14} className="text-blue-500" />
                          ) : (
                            <Venus size={14} className="text-pink-500" />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <DollarSign
                        size={18}
                        className="text-gray-500 dark:text-gray-400"
                      />
                      Purchase Information
                    </h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Purchase Date
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatters.date(data.purchaseDate)}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Purchase Price
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatters.currency(data.purchasePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">
                          Organisation
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {data.organisationName || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Record Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Created By
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {data.createdByName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Created On
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatters.date(data.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Updated On
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatters.date(data.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth & Weight */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp
                          size={18}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        Growth & Weight
                      </h2>
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        View history
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Birth Weight
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatters.weight(data.weightAtBirth)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Current Weight
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatters.weight(data.currentWeight)}
                        </p>
                      </div>
                    </div>

                    {/* Weight chart */}
                    <div className="h-40 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        {/* Simple weight chart visualization */}
                        <div className="absolute inset-0 flex items-end justify-between px-2">
                          {weightData.map((entry, index) => (
                            <div
                              key={index}
                              className="flex flex-col items-center"
                            >
                              <div
                                className="w-2 bg-blue-500 dark:bg-blue-400 rounded-t-sm"
                                style={{
                                  height: `${(entry.weight / 100) * 100}%`,
                                  maxHeight: "100%",
                                }}
                              ></div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {entry.date.split("-")[1]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <button className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full flex items-center gap-1">
                        <Plus size={12} />
                        Add weight record
                      </button>
                    </div>
                  </div>

                  {/* Parentage */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users
                        size={18}
                        className="text-gray-500 dark:text-gray-400"
                      />
                      Parentage
                    </h2>

                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
                          <Mars
                            className="text-blue-600 dark:text-blue-300"
                            size={20}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatters.getFatherTerm(data.specieName)}
                          </p>
                          {data.parentMaleName ? (
                            <Link
                              href={`/livestock/${data.parentMaleId}`}
                              className="text-blue-600 hover:underline font-medium dark:text-blue-300 flex items-center gap-1"
                            >
                              {data.parentMaleName}
                              <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <div className="text-blue-600 font-medium dark:text-blue-300 ">
                              Unkown
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 flex items-center gap-3">
                        <div className="bg-pink-100 dark:bg-pink-800 p-3 rounded-full">
                          <Venus
                            className="text-pink-600 dark:text-pink-300"
                            size={20}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatters.getMotherTerm(data.specieName)}
                          </p>
                          {data.parentFemaleName ? (
                            <Link
                              href={`/livestock/${data.parentFemaleId}`}
                              className="text-pink-600 hover:underline font-medium dark:text-pink-300 flex items-center gap-1"
                            >
                              {data.parentFemaleName || "Unknown"}
                              <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <div className="text-pink-600 font-medium dark:text-pink-300">
                              Unkown
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <button className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full flex items-center gap-1 mx-auto">
                        <Users size={12} />
                        View full lineage
                      </button>
                    </div>
                  </div>

                  {/* Health Records */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <HeartPulse
                          size={18}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        Health Records
                      </h2>
                      <button className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
                        <Plus size={12} />
                        Add
                      </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                      <HeartPulse
                        size={24}
                        className="text-gray-400 dark:text-gray-500 mb-2"
                      />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        No health records found
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Track vaccinations, treatments, and health checks
                      </p>
                      <button className="text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500 px-3 py-1 rounded-md">
                        Add first record
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:col-span-2 xl:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clipboard
                          size={18}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        Notes
                      </h2>
                      <button
                        onClick={() =>
                          router.push(`/livestock/${resolvedParams.id}/edit`)
                        }
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        Edit notes
                      </button>
                    </div>

                    {data.notes ? (
                      <div className="prose max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 text-sm">
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {data.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                        <Clipboard
                          size={24}
                          className="text-gray-400 dark:text-gray-500 mb-2"
                        />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          No notes have been added yet
                        </p>
                        <button
                          onClick={() =>
                            router.push(`/livestock/${resolvedParams.id}/edit`)
                          }
                          className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md mt-2"
                        >
                          Add notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "health" && (
              <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 flex flex-col items-center justify-center ${tabsClassNames} `}
              >
                <HeartPulse
                  size={48}
                  className="text-gray-300 dark:text-gray-600 mb-4"
                />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Health Records
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                  Track medical history, vaccinations, treatments, and
                  veterinary visits.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <Plus size={16} />
                  Add Health Record
                </button>
              </div>
            )}

            {activeTab === "production" && (
              <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 flex flex-col items-center justify-center ${tabsClassNames}`}
              >
                <Award
                  size={48}
                  className="text-gray-300 dark:text-gray-600 mb-4"
                />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Production Records
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                  Track yields, quality measurements, and performance metrics.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <Plus size={16} />
                  Add Production Record
                </button>
              </div>
            )}

            {activeTab === "lineage" && (
              <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${tabsClassNames} `}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Family Tree
                </h2>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Parents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
                        <Mars
                          className="text-blue-600 dark:text-blue-300"
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatters.getFatherTerm(data.specieName)}
                        </p>
                        {data.parentMaleName ? (
                          <Link
                            href={`/livestock/${data.parentMaleId}`}
                            className="text-blue-600 hover:underline font-medium dark:text-blue-300 flex items-center gap-1"
                          >
                            {data.parentMaleName || "Unknown"}
                            {data.parentMaleName && <ChevronRight size={14} />}
                          </Link>
                        ) : (
                          <div className="text-blue-600 dark:text-blue-300">
                            <p className="font-medium">Unkown</p>
                          </div>
                        )}
                        {data.parentMaleTagId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tag: {data.parentMaleTagId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 flex items-center gap-3">
                      <div className="bg-pink-100 dark:bg-pink-800 p-3 rounded-full">
                        <Venus
                          className="text-pink-600 dark:text-pink-300"
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatters.getMotherTerm(data.specieName)}
                        </p>
                        {data.parentFemaleName ? (
                          <Link
                            href={`/livestock/${data.parentFemaleId}`}
                            className="text-pink-600 hover:underline font-medium dark:text-pink-300 flex items-center gap-1"
                          >
                            {data.parentFemaleName || "Unknown"}
                            {data.parentFemaleName && (
                              <ChevronRight size={14} />
                            )}
                          </Link>
                        ) : (
                          <div className="text-blue-600 dark:text-blue-300">
                            <p className="font-medium">Unkown</p>
                          </div>
                        )}
                        {data.parentFemaleTagId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tag: {data.parentFemaleTagId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Offspring
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      0 records
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <Users
                      size={24}
                      className="text-gray-400 dark:text-gray-500 mb-2"
                    />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      No offspring records found
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      When this animal has offspring, they will appear here
                    </p>
                    <button className="text-xs bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500 px-3 py-1 rounded-md">
                      Link offspring
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "finances" && (
              <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${tabsClassNames}`}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Financial Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Initial Investment
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatters.currency(data.purchasePrice)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Purchased on {formatters.date(data.purchaseDate)}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Expenses
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatters.currency(0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Feed, healthcare, etc.
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Current Value
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatters.currency(data.purchasePrice)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Estimated market value
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">
                      Transaction History
                    </h3>
                  </div>

                  <div className="p-6 flex flex-col items-center justify-center text-center min-h-52">
                    <DollarSign
                      size={24}
                      className="text-gray-400 dark:text-gray-500 mb-2"
                    />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      No transactions recorded
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Add expenses and income related to this animal
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                      <Plus size={14} />
                      Add Transaction
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 min-h-96 ${tabsClassNames}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Photo Gallery
                  </h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                    <Plus size={14} />
                    Add Photos
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Empty state */}
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-center h-52">
                    <Camera
                      size={24}
                      className="text-gray-400 dark:text-gray-500 mb-2"
                    />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      No photos yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Add photos to track visual changes over time
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
