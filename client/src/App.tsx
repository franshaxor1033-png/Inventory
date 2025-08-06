import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Items from "@/pages/inventory/items";
import Assets from "@/pages/inventory/assets";
import NewTransaction from "@/pages/transactions/new";
import TransactionReports from "@/pages/reports/transactions";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
