import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  change: string;
  changeType: "positive" | "negative";
}

export default function StatCard({ title, value, icon: Icon, change, changeType }: StatCardProps) {
  const iconBgColor = {
    "Total Items": "bg-blue-50",
    "Assets On Loan": "bg-yellow-50", 
    "Critical Stock": "bg-red-50",
    "Monthly Transactions": "bg-green-50"
  }[title] || "bg-blue-50";

  const iconColor = {
    "Total Items": "text-blue-600",
    "Assets On Loan": "text-yellow-600",
    "Critical Stock": "text-red-600", 
    "Monthly Transactions": "text-green-600"
  }[title] || "text-blue-600";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span
          className={cn(
            "text-sm font-medium",
            changeType === "positive" ? "text-green-600" : "text-red-600"
          )}
        >
          {change}
        </span>
        <span className="text-slate-600 text-sm ml-2">vs last month</span>
      </div>
    </div>
  );
}
