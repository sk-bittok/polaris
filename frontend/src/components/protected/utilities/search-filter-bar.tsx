import { Filter, Search } from "lucide-react";

interface FilterTargets {
  value: string;
  label: string;
}

type Props = {
  searchQuery: string;
  filterType: string;
  onSearch: (value: string) => void;
  onFilter: (value: string) => void;
  filterTargets: string[];
  searchPlaceholder?: string;
  filterLabel?: string;
};

export default function SearchAndFilter({
  searchQuery,
  onSearch,
  filterType,
  onFilter,
  filterTargets,
  searchPlaceholder = "Search records ...",
  filterLabel = "All",
}: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Search */}
      <div className="relative w-64">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-600" />
        </div>
        <input
          type="search"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {/* Filter */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          <select
            value={filterType}
            onChange={(e) => onFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">{filterLabel}</option>
            {filterTargets.map((target) => (
              <option key={target} value={target} className="capitalize">
                {target}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
