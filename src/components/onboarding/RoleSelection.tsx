import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Briefcase, User } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect?: (role: "job-seeker" | "employer") => void;
  onCancel?: () => void;
}

const RoleSelection = ({ onRoleSelect, onCancel }: RoleSelectionProps) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"job-seeker" | "employer" | null>(null);

  const handleRoleSelect = (role: "job-seeker" | "employer") => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (onRoleSelect) {
      onRoleSelect(selectedRole);
    } else {
      // Navigate to signup page with selected role
      navigate("/signup", { state: { role: selectedRole } });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto py-10 px-4 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2">Choose your role</h2>
      <p className="text-muted-foreground text-center mb-8">
        Select how you'll be using CVConnect+
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div
          className={`flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all hover-scale ${
            selectedRole === "job-seeker"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/20"
          }`}
          onClick={() => handleRoleSelect("job-seeker")}
        >
          <div className={`p-4 rounded-full mb-4 ${
            selectedRole === "job-seeker" 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          }`}>
            <User size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2">Job Seeker</h3>
          <p className="text-sm text-center text-muted-foreground">
            Find jobs in crypto, upload your CV, and get personalized recommendations
          </p>
        </div>

        <div
          className={`flex flex-col items-center p-6 rounded-lg border-2 cursor-pointer transition-all hover-scale ${
            selectedRole === "employer"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/20"
          }`}
          onClick={() => handleRoleSelect("employer")}
        >
          <div className={`p-4 rounded-full mb-4 ${
            selectedRole === "employer" 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          }`}>
            <Briefcase size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2">Employer</h3>
          <p className="text-sm text-center text-muted-foreground">
            Post job openings, review applicants, and find the perfect candidates for your team
          </p>
        </div>
      </div>

      <Button 
        onClick={handleContinue} 
        className="mt-8 w-full neo-button"
        size="lg"
      >
        Continue
      </Button>
      
      {onCancel && (
        <Button 
          onClick={onCancel} 
          variant="ghost" 
          className="mt-4"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default RoleSelection;
