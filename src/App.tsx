import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "@/pages/NotFound";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/Applications";
import PostJob from "@/pages/PostJob";
import ManageJob from "@/pages/ManageJob";
import CompanyJobs from "@/pages/CompanyJobs";
import CompanyApplicants from "@/pages/CompanyApplicants";
import ApplicationReview from "@/pages/ApplicationReview";
import Pricing from "@/pages/Pricing";
import RoleSelection from "@/components/onboarding/RoleSelection";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    let authSubscription;

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (hasMounted) {
        setTimeout(() => {
          setAuthenticated(!!data.session);
          setLoading(false);
        }, 0);
      }
    };

    checkAuth();
    
    authSubscription = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (hasMounted) {
          setTimeout(() => {
            setAuthenticated(!!session);
            setLoading(false);
          }, 0);
        }
      }
    );

    setHasMounted(true);

    return () => {
      authSubscription?.data?.subscription?.unsubscribe();
    };
  }, [hasMounted]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-r-transparent rounded-full"></div>
    </div>;
  }

  if (!authenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/select-role" element={<RoleSelection />} />
          
          {/* Protected routes */}
          <Route path="/job/:id/manage" element={
            <ProtectedRoute>
              <ManageJob />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          } />
          <Route path="/application/:id" element={
            <ProtectedRoute>
              <ApplicationReview />
            </ProtectedRoute>
          } />
          <Route path="/post-job" element={
            <ProtectedRoute>
              <PostJob />
            </ProtectedRoute>
          } />
          <Route path="/company/jobs" element={
            <ProtectedRoute>
              <CompanyJobs />
            </ProtectedRoute>
          } />
          <Route path="/company/applicants" element={
            <ProtectedRoute>
              <CompanyApplicants />
            </ProtectedRoute>
          } />
          <Route path="/pricing" element={<Pricing />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
