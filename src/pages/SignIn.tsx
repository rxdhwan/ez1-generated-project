import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SignIn from "@/components/auth/SignIn";

const SignInPage = () => {
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
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <SignIn />
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

export default SignInPage;
