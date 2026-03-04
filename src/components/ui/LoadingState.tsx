import Spinner from "./Spinner";

interface LoadingStateProps {
  /** Message shown below the spinner */
  message?: string;
  /** "sm" suits modals/panels; "md" suits full-page sections */
  size?: "sm" | "md";
  className?: string;
}

export default function LoadingState({
  message = "Loading…",
  size = "md",
  className = "",
}: LoadingStateProps) {
  const padding = size === "sm" ? "py-6" : "py-12";
  const spinnerSize = size === "sm" ? "sm" : "md";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${padding} ${className}`}>
      <Spinner size={spinnerSize} />
      {message && (
        <p className={`${textSize} text-gray-400`}>{message}</p>
      )}
    </div>
  );
}
