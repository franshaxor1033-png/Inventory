import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Items from "@/pages/inventory/items";
import Assets from "@/pages/inventory/assets";
import NewTransaction from "@/pages/transactions/new";
import TransactionReports from "@/pages/reports/transactions";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";
import { authService } from "./lib/auth";

// Update the default query client to include auth headers
queryClient.setQueryDefaults([], {
  queryFn: async ({ queryKey }) => {
    const token = authService.getToken();
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      authService.logout();
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }

    return await res.json();
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/inventory/items">
        <ProtectedRoute>
          <Items />
        </ProtectedRoute>
      </Route>
      <Route path="/inventory/assets">
        <ProtectedRoute>
          <Assets />
        </ProtectedRoute>
      </Route>
      <Route path="/transactions/new">
        <ProtectedRoute>
          <NewTransaction />
        </ProtectedRoute>
      </Route>
      <Route path="/reports/transactions">
        <ProtectedRoute>
          <TransactionReports />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
