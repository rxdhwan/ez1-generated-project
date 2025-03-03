import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Briefcase, 
  FileText, 
  Search, 
  User, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  X
} from "lucide-react";

type HintStep = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type HintsProps = {
  userRole: "job-seeker" | "employer";
};

const Hints = ({ userRole }: HintsProps) => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);

  const jobSeekerHints: HintStep[] = [
    {
      title: "Welcome to CryptoJobs",
      description: "We'll help you find the perfect job in the crypto industry. Here's a quick tour to get you started.",
      icon: <Briefcase size={40} className="text-primary" />,
    },
    {
      title: "Upload Your CV",
      description: "Start by uploading your CV. Our AI will analyze it to recommend the most suitable jobs for you.",
      icon: <FileText size={40} className="text-primary" />,
    },
    {
      title: "Browse Jobs",
      description: "Explore job listings tailored to your skills and experience in the crypto industry.",
      icon: <Search size={40} className="text-primary" />,
    },
    {
      title: "Filter Jobs",
      description: "Narrow down your search by location, job type, and technologies like Bitcoin, Ethereum, or Solana.",
      icon: <Filter size={40} className="text-primary" />,
    },
    {
      title: "Track Applications",
      description: "Keep track of all your job applications and their status in your personalized dashboard.",
      icon: <User size={40} className="text-primary" />,
    },
  ];

  const employerHints: HintStep[] = [
    {
      title: "Welcome to CryptoJobs",
      description: "We'll help you find the perfect candidates for your crypto company. Here's a quick tour to get you started.",
      icon: <Briefcase size={40} className="text-primary" />,
    },
    {
      title: "Post Job Listings",
      description: "Create detailed job listings to attract qualified candidates in the crypto space.",
      icon: <FileText size={40} className="text-primary" />,
    },
    {
      title: "Review Applications",
      description: "Easily review candidate applications and CVs all in one place.",
      icon: <Search size={40} className="text-primary" />,
    },
    {
      title: "Filter Candidates",
      description: "Find candidates with specific skills in technologies like Bitcoin, Ethereum, or Solana.",
      icon: <Filter size={40} className="text-primary" />,
    },
    {
      title: "Manage Hiring Pipeline",
      description: "Track where candidates are in your hiring process through your dashboard.",
      icon: <User size={40} className="text-primary" />,
    },
  ];

  const hints = userRole === "job-seeker" ? jobSeekerHints : employerHints;

  const handleNext = () => {
    if (step < hints.length - 1) {
      setStep(step + 1);
    } else {
      setOpen(false);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("hintsShown", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md glass-card animate-scale-in">
        <button 
          onClick={handleDismiss}
          className="absolute right-4 top-4 p-1 rounded-full hover:bg-accent"
        >
          <X size={16} />
        </button>
        
        <div className="flex flex-col items-center text-center p-2">
          <div className="flex justify-center my-4">
            {hints[step].icon}
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-xl">{hints[step].title}</DialogTitle>
            <DialogDescription className="mt-2">
              {hints[step].description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center w-full mt-6 gap-1">
            {hints.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between w-full mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 0}
              className="neo-button"
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </Button>
            
            <Button 
              onClick={handleNext}
              className="neo-button"
            >
              {step === hints.length - 1 ? "Finish" : "Next"}
              {step < hints.length - 1 && <ChevronRight size={16} className="ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Hints;
