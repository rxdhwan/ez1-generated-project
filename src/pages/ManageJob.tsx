import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const ManageJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [jobType, setJobType] = useState("");
  const [remote, setRemote] = useState(false);
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [status, setStatus] = useState("active");
  const [durationDays, setDurationDays] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("You must be logged in to view this page");
          return;
        }
        
        // Get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError || !profile) {
          console.error("Error fetching profile:", profileError);
          toast.error("Failed to load profile information");
          return;
        }

        // Define some default skills since we can't query the skills table directly
        const defaultSkills = ["JavaScript", "React", "TypeScript", "Node.js", "SQL", "CSS", "HTML", "Python", "Java", "Cloud"];
        setAvailableSkills(defaultSkills);
        
        // Fetch company data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .single();
        
        if (companyError || !companyData) {
          console.error("Error fetching company:", companyError);
          toast.error("Failed to load company information");
          return;
        }

        setCompany(companyData);
        setCompanyId(companyData.id);
        
        if (id) {
          // Fetch job data
          const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();
          
          if (jobError) {
            console.error("Error fetching job:", jobError);
            toast.error("Failed to load job information");
            return;
          }
          
          setTitle(job.title);
          setDescription(job.description);
          setRequirements(job.requirements || "");
          setLocation(job.location || "");
          setSalaryRange(job.salary_range || "");
          setJobType(job.type || "");
          setRemote(job.remote || false);
          setCategory(job.category || "");
          setSkills(job.skills || []);
          setStatus(job.status);
          
          // Calculate duration days
          if (job.expires_at) {
            const expiresAt = new Date(job.expires_at);
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();
            const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
            setDurationDays(diffDays.toString());
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Something went wrong loading job information");
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !requirements || !location || !salaryRange || !jobType || !category || !skills.length) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSubmitting(true);
    
    try {
      let expiresAt = new Date();
      // Convert durationDays to number and add to current date
      const durationDaysNum = Number(durationDays);
      expiresAt.setDate(expiresAt.getDate() + durationDaysNum);
      
      if (id) {
        // Update existing job
        const { data, error } = await supabase
          .from('jobs')
          .update({
            title,
            description,
            requirements,
            location,
            salary_range: salaryRange,
            type: jobType,
            remote,
            category,
            skills,
            company_id: companyId,
            status,
            expires_at: expiresAt.toISOString(),
          })
          .eq('id', id);
        
        if (error) {
          console.error("Error updating job:", error);
          toast.error("Error updating job");
        } else {
          toast.success("Job updated successfully!");
          navigate('/dashboard');
        }
      } else {
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        // Create new job
        const { data, error } = await supabase
          .from('jobs')
          .insert([
            {
              title,
              description,
              requirements,
              location,
              salary_range: salaryRange,
              type: jobType,
              remote,
              category,
              skills,
              company_id: companyId,
              status,
              expires_at: expiresAt.toISOString(),
              created_by: user?.id,
            },
          ]);
        
        if (error) {
          console.error("Error creating job:", error);
          toast.error("Error creating job");
        } else {
          toast.success("Job created successfully!");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Error updating job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkillSelect = (value: string) => {
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSelectedSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Loading...</h1>
        </div>
      </MainLayout>
    );
  }

  if (!company) {
    return (
      <MainLayout>
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">You must create a company profile first.</h1>
          <Button onClick={() => navigate('/company/create')}>Create Company Profile</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">{id ? "Edit Job" : "Create Job"}</h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="mb-4">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="salaryRange">Salary Range</Label>
            <Input
              type="text"
              id="salaryRange"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="jobType">Job Type</Label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={remote}
              onCheckedChange={(checked) => setRemote(checked as boolean)}
            />
            <Label htmlFor="remote">Remote</Label>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="category">Category</Label>
            <Input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="skills">Skills</Label>
            <Select value={selectedSkill} onValueChange={handleSkillSelect}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select skills" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} className="px-3 py-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          {id && (
            <div className="mb-4">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mb-4">
            <Label htmlFor="durationDays">Duration (Days)</Label>
            <Input
              type="number"
              id="durationDays"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : id ? "Update Job" : "Create Job"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ManageJob;
