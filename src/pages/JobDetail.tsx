import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Heart,
  Share2,
  ChevronLeft,
  CheckCircle
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

// Mock job data - in a real app, this would come from an API
const MOCK_JOBS = [
  {
    id: "1",
    title: "Senior Solana Developer",
    company: "CryptoX",
    companyLogo: "/placeholder.svg",
    location: "Remote",
    salary: "$120k - $160k",
    type: "Full-time",
    tags: ["Solana", "Rust", "JavaScript"],
    applications: 23,
    posted: "2 days ago",
    description: `<p>We are looking for an experienced Solana developer to join our team and help build the next generation of decentralized applications.</p>
      <p>You will be responsible for developing smart contracts, integrating with our frontend applications, and ensuring the security and efficiency of our blockchain solutions.</p>
      <h3 class="text-lg font-semibold mt-4 mb-2">Requirements:</h3>
      <ul class="list-disc pl-5 space-y-1">
        <li>3+ years of experience in blockchain development</li>
        <li>Strong knowledge of Rust and the Solana ecosystem</li>
        <li>Experience with JavaScript/TypeScript and Web3 libraries</li>
        <li>Understanding of cryptographic principles and security best practices</li>
        <li>Familiarity with testing frameworks and CI/CD pipelines</li>
      </ul>
      <h3 class="text-lg font-semibold mt-4 mb-2">Benefits:</h3>
      <ul class="list-disc pl-5 space-y-1">
        <li>Competitive salary and equity package</li>
        <li>Flexible working hours and remote-first culture</li>
        <li>Health, dental, and vision insurance</li>
        <li>Annual learning and development budget</li>
        <li>Regular team retreats and events</li>
      </ul>`,
    aiScore: 92,
    skills: [
      { name: "Rust", match: 95 },
      { name: "Solana", match: 90 },
      { name: "JavaScript", match: 85 },
      { name: "Smart Contracts", match: 88 },
      { name: "Web3", match: 80 },
    ]
  },
  // ... other mock jobs would be defined here
];

const JobDetail = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Find job by ID
  const job = MOCK_JOBS.find(job => job.id === id);

  if (!job) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Button onClick={() => navigate('/jobs')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleApply = () => {
    // In a real app, this would send an API request
    toast.success("Application submitted successfully!");
    setApplied(true);
  };

  const handleSave = () => {
    // In a real app, this would send an API request
    setSaved(!saved);
    toast(saved ? "Job removed from saved jobs" : "Job saved to your profile");
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/jobs')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="w-full md:w-2/3 space-y-6">
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-16 w-16 bg-secondary rounded flex items-center justify-center">
                    <img 
                      src={job.companyLogo} 
                      alt={job.company} 
                      className="h-10 w-10"
                    />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-muted-foreground">{job.company}</span>
                      <span className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.posted}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleSave}
                    className={saved ? "text-red-500" : ""}
                  >
                    <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {job.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline" className="flex items-center">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {job.salary}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {job.applications} applicants
                </Badge>
              </div>

              <div className="md:hidden flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 flex items-center justify-center"
                  onClick={handleSave}
                >
                  <Heart className="h-4 w-4 mr-2" fill={saved ? "currentColor" : "none"} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: job.description }}></div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">AI Match Score</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-full">
                        <Progress value={job.aiScore} className="h-2" />
                      </div>
                      <span className="font-semibold text-lg">{job.aiScore}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on your skills and experience
                    </p>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">Skills Match</h2>
                    <div className="space-y-3">
                      {job.skills.map(skill => (
                        <div key={skill.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{skill.name}</span>
                            <span>{skill.match}%</span>
                          </div>
                          <Progress value={skill.match} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {applied ? (
                    <div className="p-4 bg-primary/10 rounded-lg flex gap-3 items-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          You applied on {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">Apply Now</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Application</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="mb-4">
                            Your CV will be shared with {job.company} for this role.
                          </p>
                          <Button onClick={handleApply} className="w-full">
                            Confirm Application
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">About {job.company}</h2>
                <p className="text-sm text-muted-foreground">
                  CryptoX is a leading blockchain technology company focused on building decentralized financial solutions on Solana. Founded in 2020, we've grown to a team of 50+ engineers, designers, and blockchain enthusiasts.
                </p>
                <Button variant="outline" className="w-full mt-4">
                  View Company Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">Similar Jobs</h2>
                <div className="space-y-3">
                  {MOCK_JOBS.slice(0, 3).map(similarJob => (
                    <div 
                      key={similarJob.id} 
                      className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer"
                      onClick={() => navigate(`/job/${similarJob.id}`)}
                    >
                      <h3 className="font-medium">{similarJob.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {similarJob.company} • {similarJob.location}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
