import { SchemaField } from "@/types/api";

interface Props {
  fields: SchemaField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const inputBase =
  "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent";

const borderClass = (hasError: boolean) =>
  hasError ? "border-red-400" : "border-gray-300";

export default function DynamicSchemaForm({ fields, values, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
          </label>

          {field.type === "text" && (
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={`${inputBase} ${borderClass(!!errors[field.key])}`}
            />
          )}

          {field.type === "date" && (
            <input
              type="date"
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={`${inputBase} ${borderClass(!!errors[field.key])}`}
            />
          )}

          {field.type === "textarea" && (
            <textarea
              rows={3}
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={`${inputBase} resize-y ${borderClass(!!errors[field.key])}`}
            />
          )}

          {field.type === "select" && (
            <select
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={`${inputBase} bg-white ${borderClass(!!errors[field.key])}`}
            >
              <option value="" disabled>Select…</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {errors[field.key] && (
            <p className="mt-1 text-xs text-red-600">{errors[field.key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
