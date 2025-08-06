import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  Package, 
  LayoutDashboard, 
  Box, 
  Cpu, 
  Plus, 
  BarChart3, 
  LogOut,
  User
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
];

const inventoryItems: NavItem[] = [
  {
    title: "Items",
    href: "/inventory/items",
    icon: Box,
  },
  {
    title: "Assets",
    href: "/inventory/assets",
    icon: Cpu,
  },
];

const transactionItems: NavItem[] = [
  {
    title: "New Transaction",
    href: "/transactions/new",
    icon: Plus,
  },
  {
    title: "Reports",
    href: "/reports/transactions",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">SCI-Ventory Pro</h1>
            <p className="text-sm text-slate-500">Inventory Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </a>
            </Link>
          );
        })}

        {/* Inventory Section */}
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Inventory
          </h3>
          {inventoryItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </a>
              </Link>
            );
          })}
        </div>

        {/* Transactions Section */}
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Transactions
          </h3>
          {transactionItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">
              {user?.email || "Unknown User"}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role || "ADMIN"}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
