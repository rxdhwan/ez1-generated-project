import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    type: "Full-time",
    remote: true,
    category: "development",
    skills: ""
  });
  
  useEffect(() => {
    checkCompanyProfile();
  }, []);
  
  const checkCompanyProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in first");
      navigate('/signin');
      return;
    }
    
    // Check if user has a company profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', session.user.id)
      .single();
      
    if (error || !profile) {
      toast.error("Error retrieving your profile");
      navigate('/dashboard');
      return;
    }
    
    if (profile.role !== 'employer') {
      toast.error("Only employers can post jobs");
      navigate('/dashboard');
      return;
    }
    
    if (!profile.company_id) {
      toast.error("Please create a company profile first");
      navigate('/profile', { state: { tab: 'company' } });
      return;
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name, checked) => {
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to post a job");
        navigate('/signin');
        return;
      }
      
      // Get company ID from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();
        
      if (profileError || !profile?.company_id) {
        toast.error("Error retrieving your company profile");
        return;
      }
      
      // Process skills into an array
      const skillsArray = formValues.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);
      
      // Set expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      let minSalary, maxSalary;
      const salaryText = formValues.salary_range;

      if (salaryText.includes('-')) {
        // Salary range provided
        const [minStr, maxStr] = salaryText.split('-');
        minSalary = parseInt(minStr.replace(/[^0-9]/g, ''), 10);
        maxSalary = parseInt(maxStr.replace(/[^0-9]/g, ''), 10);
      } else {
        // Single salary figure provided
        const expectedSalary = parseInt(salaryText.replace(/[^0-9]/g, ''), 10);
        const salaryRangePercentage = 0.25; // Adjust as needed
        minSalary = Math.round(expectedSalary * (1 - salaryRangePercentage));
        maxSalary = Math.round(expectedSalary * (1 + salaryRangePercentage));
      }
      
      // Insert job into database
      const { data: job, error } = await supabase
        .from('jobs')
        .insert([
          {
            title: formValues.title,
            description: formValues.description,
            requirements: formValues.requirements,
            location: formValues.location,
            salary_range: formValues.salary_range,
            salary_min: minSalary,
            salary_max: maxSalary,
            type: formValues.type,
            remote: formValues.remote,
            category: formValues.category,
            skills: skillsArray,
            company_id: profile.company_id,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            created_by: session.user.id
          }])
        .select()
        .single();
        
      if (error) {
        console.error("Error posting job:", error);
        toast.error("Failed to post job");
        return;
      }
      
      toast.success("Job posted successfully!");
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
          <p className="text-muted-foreground mt-2">
            Create a job listing to attract the best candidates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>
                    Provide information about the position you're hiring for
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title*</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formValues.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Blockchain Developer"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description*</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formValues.description}
                      onChange={handleInputChange}
                      placeholder="Describe the role, responsibilities, and your company..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements*</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      value={formValues.requirements}
                      onChange={handleInputChange}
                      placeholder="List the qualifications, skills, and experience required..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formValues.location}
                        onChange={handleInputChange}
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salary_range">Salary Range*</Label>
                      <Input
                        id="salary_range"
                        name="salary_range"
                        value={formValues.salary_range}
                        onChange={handleInputChange}
                        placeholder="e.g. $100k - $140k or $120k"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Job Type*</Label>
                      <Select 
                        value={formValues.type} 
                        onValueChange={(value) => handleSelectChange("type", value)}
                        required
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category*</Label>
                      <Select 
                        value={formValues.category} 
                        onValueChange={(value) => handleSelectChange("category", value)}
                        required
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="customer_support">Customer Support</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills (comma separated)*</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={formValues.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. React, Solidity, Blockchain, Smart Contracts"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="remote"
                      checked={formValues.remote}
                      onCheckedChange={(checked) => handleSwitchChange("remote", checked)}
                    />
                    <Label htmlFor="remote">This is a remote position</Label>
                  </div>
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? "Posting..." : "Post Job"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tips for a Great Job Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Be Specific</h3>
                  <p className="text-sm text-muted-foreground">
                    Clearly outline the responsibilities and qualifications required for the role.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Highlight Benefits</h3>
                  <p className="text-sm text-muted-foreground">
                    Include what makes your company a great place to work and any perks you offer.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Salary Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    Job listings with salary ranges typically receive more applications.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Be Inclusive</h3>
                  <p className="text-sm text-muted-foreground">
                    Use gender-neutral language and focus on skills rather than years of experience.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Visibility Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your job post will be visible for 30 days. 
                  Upgrade to Premium for extended visibility and featured placement.
                </p>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                >
                  View Pricing Options
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PostJob;
