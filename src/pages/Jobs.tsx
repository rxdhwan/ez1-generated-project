import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MainLayout from "@/components/layout/MainLayout";
import JobCard from "@/components/jobs/JobCard";
import { Search, Briefcase, MapPin, DollarSign, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Jobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [jobType, setJobType] = useState<string | undefined>();
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, selectedTags, jobType, remoteOnly]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedTags, jobType, remoteOnly]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies:company_id(*)
        `);

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (selectedTags.length > 0) {
        query = query.contains('skills', selectedTags);
      }

      if (jobType) {
        query = query.eq('type', jobType);
      }

      if (remoteOnly) {
        query = query.ilike('location', '%remote%');
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        setJobs(data || []);
        setFilteredJobs(data || []);

        // Extract skills from jobs data
        const allSkills = Array.from(new Set(data?.flatMap(job => job.skills || []) || []));
        setAvailableSkills(allSkills);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let results = [...jobs];

    if (searchTerm) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companies?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      results = results.filter(job =>
        job.skills?.some(tag => selectedTags.includes(tag))
      );
    }

    if (jobType) {
      results = results.filter(job => job.type === jobType);
    }

    if (remoteOnly) {
      results = results.filter(job => job.location?.toLowerCase().includes("remote"));
    }

    setFilteredJobs(results);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleJobTypeChange = (value) => {
    setJobType(value);
  };

  const handleRemoteOnlyChange = (checked) => {
    setRemoteOnly(checked);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            <div className="glass-card p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={handleSearchTermChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={jobType} onValueChange={handleJobTypeChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remote"
                    checked={remoteOnly}
                    onCheckedChange={handleRemoteOnlyChange}
                  />
                  <Label htmlFor="remote">Remote only</Label>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Skills & Technologies</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {availableSkills.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Job listings */}
          <div className="w-full md:w-3/4 space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                Jobs <span className="text-muted-foreground ml-2 text-lg">({filteredJobs.length})</span>
              </h1>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={job.companies?.name}
                    location={job.location}
                    salary={job.salary_range}
                    tags={job.skills}
                    applications={job.application_count}
                    posted={job.created_at}
                    description={job.description}
                    aiScore={80}
                    onApply={() => navigate(`/job/${job.id}`)}
                    onSave={() => console.log("Saved job", job.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card rounded-lg">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Jobs;
