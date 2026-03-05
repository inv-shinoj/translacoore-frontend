"use client";

import FilterTabs, { FilterTab } from "@/components/ui/FilterTabs";

interface TableToolbarProps<T extends string | number> {
  search?: string;
  onSearch?: (val: string) => void;
  searchPlaceholder?: string;
  tabs?: FilterTab<T>[];
  activeTab?: T;
  onTabChange?: (key: T) => void;
  children?: React.ReactNode;
}

export default function TableToolbar<T extends string | number>({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  tabs,
  activeTab,
  onTabChange,
  children,
}: TableToolbarProps<T>) {
  return (
    <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
      {onSearch !== undefined && (
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search ?? ""}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      )}
      {tabs && activeTab !== undefined && onTabChange && (
        <FilterTabs tabs={tabs} active={activeTab} onChange={onTabChange} />
      )}
      {children}
    </div>
  );
}
