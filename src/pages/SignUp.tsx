import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SignUp from "@/components/auth/SignUp";
import RoleSelection from "@/components/onboarding/RoleSelection";

const SignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role;

  useEffect(() => {
    if (!role) {
      navigate('/', { replace: true });
    }
  }, [role, navigate]);

  if (!role) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 border-b">
        <div className="container mx-auto">
          <Link to="/" className="text-2xl font-bold">CVConnect+</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Sign up as a {role === 'employer' ? 'an Employer' : 'a Job Seeker'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUp role={role} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      <footer className="w-full py-6 px-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CVConnect+. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default SignUpPage;
