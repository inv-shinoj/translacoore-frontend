import Avatar from "@/components/ui/Avatar";

interface ActivityItemProps {
  user: string;
  action: string;
  target: string;
  time: string;
}

export default function ActivityItem({
  user,
  action,
  target,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Avatar name={user} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{user}</span>{" "}
          <span className="text-gray-500">{action}</span>{" "}
          <span className="font-medium">{target}</span>
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
