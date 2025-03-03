import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Briefcase,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowUpRight,
  User
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Hints from "../onboarding/Hints";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [showHints, setShowHints] = useState(false);
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [statistics, setStatistics] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewingApplications: 0,
    rejectedApplications: 0,
    offeredApplications: 0,
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchJobSeekerData = async () => {
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
        
        // Type assertion for profile data
        const typedProfile = profile as any;
        
        // Check profile completeness
        const profileData = {
          firstName: typedProfile.first_name || '',
          lastName: typedProfile.last_name || '',
          bio: typedProfile.bio || '',
          skills: typedProfile.skills || [],
          experience: typedProfile.experience || '',
          resumeUrl: typedProfile.resume_url || '',
        };
        
        const completionPercentage = calculateProfileCompletion(profileData);
        setProfileCompletion(completionPercentage);
        
        // Fetch applications
        const { data: applications, error: applicationsError } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs(*, company:companies(*))
          `)
          .eq('applicant_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (applicationsError) {
          console.error("Error fetching applications:", applicationsError);
        } else {
          // Type assertion for application data
          const typedApplications = applications as any[] || [];
          setApplications(typedApplications);
          
          // Calculate statistics
          const totalApplications = typedApplications.length;
          const pendingApplications = typedApplications.filter(app => app.status === 'pending').length;
          const interviewingApplications = typedApplications.filter(app => app.status === 'interviewing').length;
          const rejectedApplications = typedApplications.filter(app => app.status === 'rejected').length;
          const offeredApplications = typedApplications.filter(app => app.status === 'offered').length;
          
          setStatistics({
            totalApplications,
            pendingApplications,
            interviewingApplications,
            rejectedApplications,
            offeredApplications,
          });
        }
        
        // Fetch recommended jobs
        const { data: recommendedJobs, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            company:companies(*)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (jobsError) {
          console.error("Error fetching recommended jobs:", jobsError);
        } else {
          setRecommendedJobs(recommendedJobs as any[] || []);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error in job seeker dashboard:", error);
        toast.error("Something went wrong loading your dashboard");
        setLoading(false);
      }
    };
    
    fetchJobSeekerData();
  }, []);
  
  const calculateProfileCompletion = (profileData) => {
    const totalFields = 6; // Example: name, bio, skills, experience, education, resume
    let completionScore = 0;
    
    if (profileData.firstName) completionScore++;
    if (profileData.lastName) completionScore++;
    if (profileData.bio) completionScore++;
    if (profileData.skills && profileData.skills.length > 0) completionScore++;
    if (profileData.experience && profileData.experience.length > 0) completionScore++;
    if (profileData.resumeUrl) completionScore++;
    
    return Math.round((completionScore / totalFields) * 100);
  };

  const handleApplyNow = (jobId) => {
    navigate(`/job/${jobId}`);
  };
  
  const handleUploadCV = () => {
    navigate('/profile', { state: { tab: 'resume' } });
  };
  
  const handleEditProfile = () => {
    navigate('/profile', { state: { tab: 'profile' } });
  };
  
  const handleViewAllApplications = () => {
    navigate('/applications');
  };
  
  const handleViewAllJobs = () => {
    navigate('/jobs');
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'New':
      case 'Pending':
        return <Clock size={14} className="text-yellow-500" />;
      case 'Interview':
        return <BarChart3 size={14} className="text-blue-500" />;
      case 'Rejected':
        return <XCircle size={14} className="text-red-500" />;
      case 'Hired':
      case 'Accepted':
        return <CheckCircle size={14} className="text-green-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
      case 'Pending':
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'Interview':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'Rejected':
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case 'Hired':
      case 'Accepted':
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };
  
  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {showHints && <Hints userRole="job-seeker" />}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          {userName ? `Good day, ${userName}` : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your job applications and recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Applications</p>
                <p className="text-3xl font-bold mt-1">{statistics.totalApplications}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pending Review</p>
                <p className="text-3xl font-bold mt-1">{statistics.pendingApplications}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Interviews</p>
                <p className="text-3xl font-bold mt-1">{statistics.interviewingApplications}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Profile Completion</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold">{profileCompletion}%</p>
                  <div className="w-24">
                    <Progress value={profileCompletion} className="h-2" />
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleViewAllApplications}>
                  View All <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
              <CardDescription>
                Track your recent job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.length > 0 ? (
                  applications.slice(0, 3).map((application) => (
                    <div 
                      key={application.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-all hover:bg-background/50 animate-hover"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {application.job?.company?.logo_url ? (
                            <img 
                              src={application.job.company.logo_url} 
                              alt={application.job.company.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <Briefcase className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{application.job.title || "Job Title"}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{application.job.company.name || "Company"}</span>
                            <span className="text-xs">•</span>
                            <span>Applied {new Date(application.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <div className={`text-xs font-medium ${getMatchScoreColor(application.match_score || 70)}`}>
                            {application.match_score || 70}% match
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`mt-1 flex items-center gap-1 ${getStatusColor(application.status)}`}
                          >
                            {renderStatusIcon(application.status)}
                            {application.status}
                          </Badge>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => navigate(`/application/${application.id}`)}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    <p>You haven't applied to any jobs yet.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => navigate('/jobs')}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Top Matches</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={handleViewAllJobs}>
                  View All <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
              <CardDescription>
                Jobs that match your skills and experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job) => (
                    <div 
                      key={job.id}
                      className="p-3 rounded-lg border border-border/50 hover:border-border transition-all hover:bg-background/50 animate-hover"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {job.company?.logo_url ? (
                            <img 
                              src={job.company.logo_url} 
                              alt={job.company.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <Briefcase className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company?.name || "Company"}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-muted-foreground">{job.location || "Remote"}</span>
                        <span className="font-medium">{job.salary_range || "Competitive"}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Badge>
                        <div className={`text-xs font-medium flex items-center gap-1 ${getMatchScoreColor(job.match_score || 80)}`}>
                          <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div 
                              className={`h-full ${
                                (job.match_score || 80) >= 90 ? "bg-green-500" : 
                                (job.match_score || 80) >= 70 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${job.match_score || 80}%` }}
                            />
                          </div>
                          <span>{job.match_score || 80}% match</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-3 neo-button" 
                        size="sm"
                        onClick={() => handleApplyNow(job.id)}
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No recommended jobs yet.</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full neo-button"
                  onClick={handleViewAllJobs}
                >
                  Browse More Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Increase your chances of getting noticed by employers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Upload Your CV</h4>
                  <p className="text-sm text-muted-foreground">Our AI will analyze your CV to match you with suitable jobs</p>
                </div>
              </div>
              <Button onClick={handleUploadCV}>Upload CV</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">Complete Your Profile</h4>
                  <p className="text-sm text-muted-foreground">Add skills, experience, and preferences to improve job matches</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleEditProfile}>Edit Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobSeekerDashboard;
