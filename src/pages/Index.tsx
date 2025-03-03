import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import RoleSelection from "@/components/onboarding/RoleSelection";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            companies:company_id(*)
          `)
          .eq('status', 'active')
          .limit(4);

        if (error) {
          console.error("Error fetching featured jobs:", error);
        } else {
          setFeaturedJobs(data || []);
        }
      } catch (error) {
        console.error("Error fetching featured jobs:", error);
      }
    };

    fetchFeaturedJobs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">CVConnect+</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate("/signin")}>Sign In</Button>
            <Button onClick={() => setShowRoleSelection(true)}>Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        {showRoleSelection ? (
          <RoleSelection 
            onRoleSelect={(role) => {
              navigate("/signup", { state: { role } });
            }}
            onCancel={() => setShowRoleSelection(false)}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">
                Connect with top crypto opportunities
              </h1>
              <p className="text-xl text-muted-foreground">
                Find your next role in blockchain, DeFi, and Web3 with AI-powered matching based on your skills and experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => setShowRoleSelection(true)}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/jobs")}>
                  Browse Jobs
                </Button>
              </div>
              <div className="flex gap-8 pt-8">
                <div>
                  <p className="text-3xl font-bold">1,200+</p>
                  <p className="text-muted-foreground">Open Positions</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">350+</p>
                  <p className="text-muted-foreground">Companies</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">92%</p>
                  <p className="text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </div>
            <div className="glass-card rounded-lg p-8 shadow-lg">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Featured Positions</h2>
                <div className="space-y-3">
                  {featuredJobs.map((job, i) => (
                    <Card key={i} className="hover-scale">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.companies?.name} • {job.location}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/job/${job.id}`)}>View</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/jobs")}>
                  View All Jobs
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-6 px-6 border-t mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CVConnect+. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
