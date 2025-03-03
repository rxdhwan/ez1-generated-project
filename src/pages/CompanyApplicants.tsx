import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ChevronLeft, Clock, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CompanyApplicants = () => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    fetchApplicants();
  }, [filter]);
  
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in first");
        navigate('/signin');
        return;
      }
      
      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();
        
      if (!profile?.company_id) {
        toast.error("No company associated with your account");
        navigate('/dashboard');
        return;
      }
      
      // Fetch applications for this company
      let query = supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id(*),
          profiles:applicant_id(*)
        `)
        .eq('company_id', profile.company_id);
        
      // Apply filter if not "all"
      if (filter !== "all") {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching applicants:", error);
        toast.error("Failed to load applicants");
        return;
      }
      
      setApplicants(data || []);
    } catch (error) {
      console.error("Error in fetchApplicants:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewApplication = (applicationId) => {
    navigate(`/application/${applicationId}`);
  };
  
  const handleViewCV = (resumeUrl) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    } else {
      toast.error("CV not available");
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Reviewed":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Interview":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Hired":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };
  
  const renderStatusIcon = (status) => {
    switch (status) {
      case "New":
        return <Clock size={14} className="text-blue-500" />;
      case "Reviewed":
        return <Users size={14} className="text-yellow-500" />;
      case "Interview":
        return <BarChart3 size={14} className="text-green-500" />;
      case "Rejected":
        return <XCircle size={14} className="text-red-500" />;
      case "Hired":
        return <CheckCircle size={14} className="text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-2"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">All Applicants</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applicants</CardTitle>
            <CardDescription>
              Review and manage all applications across your jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="mb-6" onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="New">New</TabsTrigger>
                <TabsTrigger value="Reviewed">Reviewed</TabsTrigger>
                <TabsTrigger value="Interview">Interview</TabsTrigger>
                <TabsTrigger value="Hired">Hired</TabsTrigger>
                <TabsTrigger value="Rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applicants.length > 0 ? (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <div 
                    key={applicant.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {applicant.profiles?.avatar_url ? (
                          <img 
                            src={applicant.profiles.avatar_url} 
                            alt={`${applicant.profiles.first_name} ${applicant.profiles.last_name}`} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Users className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {applicant.profiles?.first_name} {applicant.profiles?.last_name || ""}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Applied for <span className="font-medium">{applicant.jobs?.title || "Unknown job"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied {new Date(applicant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(applicant.status)}
                      >
                        {renderStatusIcon(applicant.status)}
                        <span className="ml-1">{applicant.status}</span>
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewCV(applicant.profiles?.resume_url)}
                        >
                          View CV
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleViewApplication(applicant.id)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">No applicants found</h3>
                <p>No applications matching the selected filter.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CompanyApplicants;
