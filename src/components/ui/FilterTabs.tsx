"use client";

export interface FilterTab<T extends string | number> {
  key: T;
  label: string;
  count: number;
}

interface FilterTabsProps<T extends string | number> {
  tabs: FilterTab<T>[];
  active: T;
  onChange: (key: T) => void;
}

export default function FilterTabs<T extends string | number>({
  tabs,
  active,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={String(tab.key)}
            onClick={() => onChange(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
