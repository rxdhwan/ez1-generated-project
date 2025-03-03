import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        // Fetch user profile to get role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileData) {
          localStorage.setItem("userRole", profileData.role || "job-seeker");
        } else {
          localStorage.setItem("userRole", "job-seeker"); // Default role
        }
        
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="subtle-ring"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
              className="subtle-ring"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rememberMe" 
              checked={formData.rememberMe}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
          </div>
          <Button 
            type="submit" 
            className="w-full neo-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            Sign up
          </a>
        </div>
      </CardFooter>
    </>
  );
};

export default SignIn;
