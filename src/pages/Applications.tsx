import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Clock, Calendar, ChevronRight, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, tabFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/signin');
      return;
    }
    
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id(*),
        companies:company_id(*)
      `)
      .eq('applicant_id', session.user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data || []);
    }
    
    setLoading(false);
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    // Apply tab filter
    if (tabFilter !== "all") {
      filtered = filtered.filter(app => app.status.toLowerCase() === tabFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.jobs?.title.toLowerCase().includes(query) ||
        app.companies?.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredApplications(filtered);
  };

  const handleApplicationClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'interview':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'rejected':
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case 'accepted':
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your job applications
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search applications..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => navigate('/jobs')}>
            Browse More Jobs
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={setTabFilter}>
          <TabsList className="grid grid-cols-5 md:w-[600px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="interview">Interviews</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="grid gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="overflow-hidden animate-hover">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row justify-between border-l-4 border-primary hover:border-primary/80">
                    <div className="flex p-4 md:p-6 flex-1 gap-4">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        {application.companies?.logo_url ? (
                          <img 
                            src={application.companies.logo_url} 
                            alt={application.companies.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Briefcase className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{application.jobs?.title || "Job Title"}</h3>
                        <p className="text-muted-foreground">{application.companies?.name || "Company"}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>Updated {new Date(application.updated_at || application.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-between items-end gap-4 p-4 md:px-6 md:py-6 bg-muted/30">
                      <Badge 
                        variant="outline"
                        className={getStatusColor(application.status)}
                      >
                        {application.status}
                      </Badge>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="md:self-end"
                        onClick={() => handleApplicationClick(application.job_id)}
                      >
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">No applications found</h3>
            <p className="mb-6">You haven't applied to any jobs that match your search criteria.</p>
            <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Applications;
