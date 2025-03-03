import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, FileText, Briefcase, Calendar, ChevronLeft, Mail, Phone, MapPin, Building, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in first");
        navigate('/signin');
        return;
      }
      
      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', session.user.id)
        .single();
        
      setUserRole(profile?.role);
      
      // Fetch application details
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id(*),
          profiles:applicant_id(*),
          companies:company_id(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching application:", error);
        toast.error("Failed to load application details");
        navigate('/dashboard');
        return;
      }
      
      // Check permission to view this application
      if (profile?.role === 'employer' && profile?.company_id !== data.company_id) {
        toast.error("You don't have permission to view this application");
        navigate('/dashboard');
        return;
      }
      
      if (profile?.role === 'job-seeker' && session.user.id !== data.applicant_id) {
        toast.error("You don't have permission to view this application");
        navigate('/dashboard');
        return;
      }
      
      setApplication(data);
      setNewStatus(data.status);
      setFeedback(data.feedback || "");
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast.error("An unexpected error occurred");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating application:", error);
        toast.error("Failed to update application status");
        return;
      }
      
      toast.success("Application status updated successfully");
      setApplication(prev => ({
        ...prev,
        status: newStatus,
        feedback: feedback
      }));
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdating(false);
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
  
  const handleViewResume = () => {
    if (application?.resume_url || application?.profiles?.resume_url) {
      window.open(application?.resume_url || application?.profiles?.resume_url, '_blank');
    } else {
      toast.error("Resume not available");
    }
  };
  
  const handleGoBack = () => {
    if (userRole === 'employer') {
      navigate('/company/applicants');
    } else {
      navigate('/applications');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-2"
            onClick={handleGoBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to {userRole === 'employer' ? 'Applicants' : 'Applications'}
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Application Review</h1>
              <div className="flex items-center gap-2 mt-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{application?.jobs?.title}</span>
                
                <Badge 
                  variant="outline" 
                  className={getStatusColor(application?.status)}
                >
                  {application?.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {application?.profiles?.avatar_url ? (
                      <img 
                        src={application.profiles.avatar_url} 
                        alt={`${application.profiles.first_name} ${application.profiles.last_name}`} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">
                    {application?.profiles?.first_name} {application?.profiles?.last_name}
                  </h2>
                  {application?.profiles?.bio && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {application.profiles.bio}
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Contact info not available</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Contact info not available</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Location not provided</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application?.profiles?.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                    {(!application?.profiles?.skills || application?.profiles?.skills.length === 0) && (
                      <span className="text-sm text-muted-foreground">No skills listed</span>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleViewResume}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Resume
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {application?.companies?.logo_url ? (
                      <img 
                        src={application.companies.logo_url} 
                        alt={application.companies.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Building className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{application?.jobs?.title}</h3>
                    <p className="text-sm text-muted-foreground">{application?.companies?.name}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p>{application?.jobs?.location || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Job Type</h3>
                    <p>{application?.jobs?.type || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Salary Range</h3>
                    <p>{application?.jobs?.salary_range || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Remote</h3>
                    <p>{application?.jobs?.remote ? "Yes" : "No"}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Application Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(application?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                {application?.cover_letter ? (
                  <div className="whitespace-pre-line">{application.cover_letter}</div>
                ) : (
                  <p className="text-muted-foreground">No cover letter provided</p>
                )}
              </CardContent>
            </Card>
            
            {userRole === 'employer' && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>
                    Update the status of this application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={newStatus} 
                    onValueChange={setNewStatus}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="New" id="new" />
                      <Label htmlFor="new">New</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Reviewed" id="reviewed" />
                      <Label htmlFor="reviewed">Reviewed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Interview" id="interview" />
                      <Label htmlFor="interview">Interview</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Hired" id="hired" />
                      <Label htmlFor="hired">Hired</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Rejected" id="rejected" />
                      <Label htmlFor="rejected">Rejected</Label>
                    </div>
                  </RadioGroup>
                  
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback (optional)</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Add notes or feedback about this candidate"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleUpdateStatus}
                    disabled={updating || newStatus === application?.status && feedback === application?.feedback}
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {userRole === 'job-seeker' && application?.feedback && (
              <Card>
                <CardHeader>
                  <CardTitle>Employer Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded bg-muted/50">
                    <div className="whitespace-pre-line">{application.feedback}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ApplicationReview;
