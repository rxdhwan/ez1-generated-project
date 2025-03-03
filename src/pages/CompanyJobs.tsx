import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Calendar, ChevronRight, Plus, Search, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CompanyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState("all");
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, tabFilter]);
  
  const fetchJobs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in first");
        navigate('/signin');
        return;
      }
      
      // Get company ID from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError || !profile) {
        toast.error("Error retrieving your profile");
        navigate('/dashboard');
        return;
      }
      
      if (profile.role !== 'employer') {
        toast.error("Only employers can access this page");
        navigate('/dashboard');
        return;
      }
      
      if (!profile.company_id) {
        toast.error("Please create a company profile first");
        navigate('/profile', { state: { tab: 'company' } });
        return;
      }
      
      // Fetch company jobs
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies:company_id(*)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
        return;
      }
      
      // Count applications for each job
      const jobsWithCounts = await Promise.all(data.map(async (job) => {
        const { count, error: countError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id);
          
        return {
          ...job,
          application_count: count || 0
        };
      }));
      
      setJobs(jobsWithCounts);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const filterJobs = () => {
    let filtered = [...jobs];
    
    // Apply tab filter
    if (tabFilter !== "all") {
      filtered = filtered.filter(job => job.status.toLowerCase() === tabFilter.toLowerCase());
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredJobs(filtered);
  };
  
  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}/manage`);
  };
  
  const handlePostNewJob = () => {
    navigate('/post-job');
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Company Jobs</h1>
          <p className="text-muted-foreground mt-2">
            Manage your job listings and track applicants
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={handlePostNewJob}>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={setTabFilter}>
          <TabsList className="grid grid-cols-3 md:w-[400px]">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card 
                key={job.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleJobClick(job.id)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row border-l-4 border-primary">
                    <div className="flex p-4 md:p-6 flex-1 gap-4">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="font-medium text-lg">{job.title}</h3>
                          <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 mt-2">
                          <div className="flex items-center text-xs">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center text-xs">
                            <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{job.application_count} Applicants</span>
                          </div>
                          
                          <div className="flex items-center text-xs">
                            <Eye className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{job.view_count || 0} Views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end items-center px-6 py-3 bg-muted/30">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium mb-2">No jobs found</h3>
            <p className="mb-6">You haven't posted any jobs that match your search criteria.</p>
            <Button onClick={handlePostNewJob}>Post New Job</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CompanyJobs;
