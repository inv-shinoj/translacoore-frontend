interface TableFooterProps {
  shown: number;
  total: number;
  label?: string;
}

export default function TableFooter({ shown, total, label = "items" }: TableFooterProps) {
  return (
    <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
      Showing {shown} of {total} {label}
    </div>
  );
}
