import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AdminRoute } from "@/lib/protected-route";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Items from "@/pages/inventory/items";
import Assets from "@/pages/inventory/assets";
import NewTransaction from "@/pages/transactions/new";
import TransactionReports from "@/pages/reports/transactions";
import AuthPage from "@/pages/auth-page";
import AdminPanel from "@/pages/admin-panel";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!user ? (
        <>
          <Route path="/auth" component={AuthPage} />
          <Route path="/landing" component={Landing} />
          <Route path="/" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/">
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </Route>
          <Route path="/inventory/items">
            <AppLayout>
              <Items />
            </AppLayout>
          </Route>
          <Route path="/inventory/assets">
            <AppLayout>
              <Assets />
            </AppLayout>
          </Route>
          <Route path="/transactions/new">
            <AppLayout>
              <NewTransaction />
            </AppLayout>
          </Route>
          <Route path="/reports/transactions">
            <AppLayout>
              <TransactionReports />
            </AppLayout>
          </Route>
          <AdminRoute path="/admin" component={AdminPanel} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
