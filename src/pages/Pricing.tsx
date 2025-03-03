import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  
  const handleSelectPlan = (plan) => {
    toast.info(`${plan} plan selected. This feature is coming soon!`);
    // In a real implementation, this would navigate to a checkout page
    // navigate('/checkout', { state: { plan } });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Pricing Plans</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your recruitment needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="border-border/60 relative overflow-hidden">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For individuals and small teams</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <PricingFeature included={true}>1 job posting</PricingFeature>
              <PricingFeature included={true}>Basic applicant tracking</PricingFeature>
              <PricingFeature included={true}>Email notifications</PricingFeature>
              <PricingFeature included={false}>AI candidate matching</PricingFeature>
              <PricingFeature included={false}>Custom branding</PricingFeature>
              <PricingFeature included={false}>Analytics dashboard</PricingFeature>
              <PricingFeature included={false}>API access</PricingFeature>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSelectPlan('Free')}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="rounded-tl-none rounded-br-none text-xs">Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For growing businesses</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$49</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <PricingFeature included={true}>10 job postings</PricingFeature>
              <PricingFeature included={true}>Advanced applicant tracking</PricingFeature>
              <PricingFeature included={true}>Email notifications</PricingFeature>
              <PricingFeature included={true}>AI candidate matching</PricingFeature>
              <PricingFeature included={true}>Custom branding</PricingFeature>
              <PricingFeature included={false}>Analytics dashboard</PricingFeature>
              <PricingFeature included={false}>API access</PricingFeature>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSelectPlan('Pro')}
              >
                Try Pro Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-border/60 relative overflow-hidden">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$199</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <PricingFeature included={true}>Unlimited job postings</PricingFeature>
              <PricingFeature included={true}>Advanced applicant tracking</PricingFeature>
              <PricingFeature included={true}>Email notifications</PricingFeature>
              <PricingFeature included={true}>AI candidate matching</PricingFeature>
              <PricingFeature included={true}>Custom branding</PricingFeature>
              <PricingFeature included={true}>Analytics dashboard</PricingFeature>
              <PricingFeature included={true}>API access</PricingFeature>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSelectPlan('Enterprise')}
              >
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2 mt-8">
            <FAQItem 
              question="Can I upgrade or downgrade my plan?"
              answer="Yes, you can upgrade or downgrade your plan at any time. The changes will be reflected in your next billing cycle."
            />
            <FAQItem 
              question="Is there a trial period?"
              answer="Yes, all paid plans come with a 14-day free trial so you can try before you commit."
            />
            <FAQItem 
              question="How does billing work?"
              answer="We bill monthly or annually, with a discount for annual subscriptions. You can cancel anytime."
            />
            <FAQItem 
              question="Do you offer refunds?"
              answer="If you're not satisfied with our service, contact us within 30 days for a full refund."
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const PricingFeature = ({ children, included }) => (
  <div className="flex items-center gap-2">
    {included ? (
      <Check className="h-4 w-4 text-primary" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    )}
    <span className={included ? "" : "text-muted-foreground"}>
      {children}
    </span>
  </div>
);

const FAQItem = ({ question, answer }) => (
  <div className="text-left p-4 rounded-lg border bg-card">
    <h3 className="font-medium mb-2">{question}</h3>
    <p className="text-sm text-muted-foreground">{answer}</p>
  </div>
);

export default Pricing;
