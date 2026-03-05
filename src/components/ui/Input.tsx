interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export default function Input({
  error = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
        error ? "border-red-400" : "border-gray-300"
      } ${className}`}
      {...props}
    />
  );
}
