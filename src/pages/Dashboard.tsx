import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JobSeekerDashboard from "@/components/dashboard/JobSeekerDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [userRole, setUserRole] = useState<"job-seeker" | "employer" | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      setLoading(true);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to access the dashboard");
        navigate('/signin');
        return;
      }
      
      // Get user role from profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
          
      if (profile && !error) {
        // Type assertion to handle the type issue
        const userRole = (profile.role as any) as "job-seeker" | "employer";
        setUserRole(userRole);
        localStorage.setItem("userRole", userRole);
      } else {
        // If we still don't have a role, redirect to role selection
        toast.error("Please select your role");
        navigate('/');
        return;
      }
      
      setLoading(false);
    };
    
    checkUserSession();
  }, [navigate]);

  return (
    <MainLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : userRole === "job-seeker" ? (
          <JobSeekerDashboard />
        ) : userRole === "employer" ? (
          <EmployerDashboard />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
