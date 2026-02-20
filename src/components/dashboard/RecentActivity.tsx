import Card from "@/components/ui/Card";
import ActivityItem from "./ActivityItem";

const activities = [
  {
    user: "Sarah Kim",
    action: "completed translation for",
    target: "Homepage Hero Section",
    time: "5 minutes ago",
  },
  {
    user: "Marcus Chen",
    action: "submitted review on",
    target: "Product Descriptions — French",
    time: "23 minutes ago",
  },
  {
    user: "Emily Davis",
    action: "created new project",
    target: "Mobile App v2.0 Localization",
    time: "1 hour ago",
  },
  {
    user: "James Wilson",
    action: "uploaded form for",
    target: "Legal Documents — German",
    time: "2 hours ago",
  },
  {
    user: "Aisha Patel",
    action: "approved translation of",
    target: "Marketing Campaign Q1",
    time: "3 hours ago",
  },
];

export default function RecentActivity() {
  return (
    <Card padding="none">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div className="px-5">
        {activities.map((a, i) => (
          <ActivityItem key={i} {...a} />
        ))}
      </div>
    </Card>
  );
}
