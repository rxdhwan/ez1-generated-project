import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { User, Upload, Download, Plus, X, CheckCircle, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [profileComplete, setProfileComplete] = useState(70);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEmployer, setIsEmployer] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    website: "",
    industry: "",
    companyName: "",
    companyDescription: "",
    companySize: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to view this page");
        navigate('/signin');
        return;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        toast.error("Failed to load profile information");
        return;
      }
      
      setProfile(profileData);
      setIsEmployer(profileData.role === 'employer');
      
      // Fetch company data if user is an employer
      if (profileData.role === 'employer' && profileData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single();
          
        if (companyError || !companyData) {
          console.error("Error fetching company:", companyError);
          toast.error("Failed to load company information");
          return;
        }

        setCompany(companyData);
        setFormValues({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          bio: profileData.bio || "",
          location: companyData?.location || "",
          website: companyData?.website || "",
          industry: companyData?.industry || "",
          companyName: companyData?.name || "",
          companyDescription: companyData?.description || "",
          companySize: companyData?.size || "",
        });
      } else {
        setFormValues({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          bio: profileData.bio || "",
          location: "",
          website: "",
          industry: "",
          companyName: "",
          companyDescription: "",
          companySize: "",
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleAddSkill = (value: string) => {
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSelectedSkill("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you would upload the file to your server/storage
      setCvUploaded(true);
      toast.success("CV uploaded successfully");
      // Increase profile completeness
      if (profileComplete < 100) {
        setProfileComplete(Math.min(100, profileComplete + 15));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to view this page");
        navigate('/signin');
        return;
      }
      
      if (!profile) {
        toast.error("Profile not loaded");
        return;
      }
      
      // Update profile data
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          first_name: formValues.firstName,
          last_name: formValues.lastName,
          bio: formValues.bio,
        })
        .eq('id', session.user.id);
        
      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        toast.error("Failed to update profile information");
        return;
      }
      
      // Update company data if user is an employer
      if (isEmployer && company) {
        const { error: companyUpdateError } = await supabase
          .from('companies')
          .update({
            name: formValues.companyName,
            description: formValues.companyDescription,
            industry: formValues.industry,
            size: formValues.companySize,
            website: formValues.website,
            location: formValues.location,
          })
          .eq('id', company.id);
          
        if (companyUpdateError) {
          console.error("Error updating company:", companyUpdateError);
          toast.error("Failed to update company information");
          return;
        }
      } else if (isEmployer && !company) {
        // Create company data if user is an employer and company doesn't exist
        const { data: newCompany, error: companyCreateError } = await supabase
          .from('companies')
          .insert([{
            name: formValues.companyName,
            description: formValues.companyDescription,
            industry: formValues.industry,
            size: formValues.companySize,
            website: formValues.website,
            location: formValues.location,
          }])
          .select()
          .single();

        if (companyCreateError) {
          console.error("Error creating company:", companyCreateError, companyCreateError?.details, companyCreateError?.hint, companyCreateError?.message);
          toast.error(`Failed to create company information: ${companyCreateError.message}`);
          return;
        }

        // Update profile with company_id
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            company_id: newCompany.id,
          })
          .eq('id', session.user.id);

        if (profileUpdateError) {
          console.error("Error updating profile with company_id:", profileUpdateError);
          toast.error("Failed to update profile with company information");
          return;
        }
      }
      
      toast.success("Profile updated successfully!");
      fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col gap-6">
          {/* Profile header */}
          <div className="glass-card p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="User avatar" />
                <AvatarFallback className="text-3xl">
                  {formValues.firstName?.charAt(0).toUpperCase()}{formValues.lastName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  {formValues.firstName} {formValues.lastName}
                </h1>
                <p className="text-muted-foreground">
                  {isEmployer ? formValues.companyName : "Job Seeker"}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="bg-secondary p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Profile completeness</span>
                    <span className="text-sm font-medium">{profileComplete}%</span>
                  </div>
                  <Progress value={profileComplete} className="h-2" />
                </div>
                <Button className="w-full" onClick={() => navigate("/jobs")}>
                  Find Jobs
                </Button>
              </div>
            </div>
          </div>
          
          {/* Tabs content */}
          <Tabs defaultValue="profile">
            <TabsList className="grid grid-cols-3 md:w-[400px]">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {isEmployer && <TabsTrigger value="company">Company</TabsTrigger>}
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formValues.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formValues.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio"
                          name="bio"
                          value={formValues.bio}
                          onChange={handleInputChange}
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full md:w-auto">
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Skills</h2>
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <Badge key={skill} className="flex items-center gap-1 py-1.5">
                        {skill}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a skill..." 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isEmployer && (
              <TabsContent value="company" className="space-y-6 mt-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Company Information</h2>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formValues.companyName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyDescription">Description</Label>
                        <Textarea
                          id="companyDescription"
                          name="companyDescription"
                          value={formValues.companyDescription}
                          onChange={handleInputChange}
                          className="min-h-[120px]"
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
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            value={formValues.website}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          name="industry"
                          value={formValues.industry}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <Input
                          id="companySize"
                          name="companySize"
                          value={formValues.companySize}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full md:w-auto">
                        Save Company Information
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent value="resume" className="space-y-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Resume/CV</h2>
                  
                  {cvUploaded ? (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <div>
                            <p className="font-medium">Resume_JohnSmith_2023.pdf</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded on {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Replace
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="font-medium mb-2">AI Analysis Results</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Skills Extracted</span>
                              <span>12 skills</span>
                            </div>
                            <Progress value={100} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Experience Levels</span>
                              <span>Senior (5+ years)</span>
                            </div>
                            <Progress value={100} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Profile Completeness</span>
                              <span>85%</span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-6 flex flex-col items-center text-center">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium">Upload your resume</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        PDF, DOCX or TXT files up to 5MB
                      </p>
                      <div className="flex gap-4">
                        <label htmlFor="cv-upload">
                          <Input
                            id="cv-upload"
                            type="file"
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                            onChange={handleCvUpload}
                          />
                          <Button
                            type="button"
                            className="cursor-pointer"
                            asChild
                          >
                            <span>Select File</span>
                          </Button>
                        </label>
                        <Button variant="outline">Use Template</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6 mt-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Job Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Desired Job Title</Label>
                      <Input id="title" defaultValue="Senior Blockchain Developer" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobTypes">Job Types</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Full-time</Badge>
                        <Badge variant="outline">Part-time</Badge>
                        <Badge variant="outline">Contract</Badge>
                        <Badge variant="outline">Freelance</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="salary">Expected Salary Range</Label>
                      <Input id="salary" defaultValue="$120,000 - $160,000" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="locations">Preferred Locations</Label>
                      <Input id="locations" defaultValue="Remote, San Francisco, New York" />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="remote" defaultChecked />
                      <Label htmlFor="remote">Open to remote work</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="relocation" />
                      <Label htmlFor="relocation">Willing to relocate</Label>
                    </div>
                  </div>
                  
                  <Button className="w-full md:w-auto">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
