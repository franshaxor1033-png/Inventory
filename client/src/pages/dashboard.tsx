import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/stat-card";
import UsageTrendChart from "@/components/dashboard/usage-trend-chart";
import InventoryCompositionChart from "@/components/dashboard/inventory-composition-chart";
import CriticalStockTable from "@/components/dashboard/critical-stock-table";
import RecentActivityTable from "@/components/dashboard/recent-activity-table";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Archive 
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's what's happening in your warehouse.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6 overflow-y-auto flex-1">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Items"
            value={stats?.totalItems || 0}
            icon={Package}
            change="+12%"
            changeType="positive"
          />
          <StatCard
            title="Assets On Loan"
            value={stats?.assetsOnLoan || 0}
            icon={Archive}
            change="+8%"
            changeType="negative"
          />
          <StatCard
            title="Critical Stock"
            value={stats?.criticalStock || 0}
            icon={AlertTriangle}
            change="+2"
            changeType="negative"
          />
          <StatCard
            title="Monthly Transactions"
            value={stats?.monthlyTransactions || 0}
            icon={TrendingUp}
            change="+18%"
            changeType="positive"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UsageTrendChart />
          <InventoryCompositionChart />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CriticalStockTable />
          <RecentActivityTable />
        </div>
      </div>
    </div>
  );
}
