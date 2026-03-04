import { SchemaField } from "@/types/api";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface Props {
  fields: SchemaField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const textareaBase =
  "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-y";

export default function DynamicSchemaForm({ fields, values, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.key}
          label={field.label}
          required={field.required}
          error={errors[field.key]}
        >
          {field.type === "textarea" ? (
            <textarea
              rows={3}
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={`${textareaBase} ${
                errors[field.key] ? "border-red-400" : "border-gray-300"
              }`}
            />
          ) : field.type === "select" ? (
            <Select
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              error={!!errors[field.key]}
            >
              <option value="" disabled>Select…</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          ) : (
            <Input
              type={field.type as "text" | "date"}
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              error={!!errors[field.key]}
            />
          )}
        </FormField>
      ))}
    </div>
  );
}
