interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export default function Select({
  error = false,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white ${
        error ? "border-red-400" : "border-gray-300"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
