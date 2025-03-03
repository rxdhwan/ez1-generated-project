import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Briefcase, MapPin, DollarSign, Users, Star, Calendar, ExternalLink, BookmarkPlus } from "lucide-react";

export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  applications: number;
  posted: string;
  description: string;
  aiScore: number;
  onApply: () => void;
  onSave: () => void;
}

const EthereumIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="lucide lucide-bitcoin"
  >
    <path d="M11.944 17.97L4.58 13.62 11.943 24 19.218 13.62l-7.274 4.35zm.056-24L4.7 12.4l7.3 4.362 7.3-4.362L12 0z" />
  </svg>
);

const getTagIcon = (tag: string) => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes("ethereum")) return <EthereumIcon />;
  if (lowerTag.includes("bitcoin")) return <Briefcase />;
  if (lowerTag.includes("solana")) return <Star />;
  return null;
};

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  location,
  salary,
  tags,
  applications,
  posted,
  description,
  aiScore,
  onApply,
  onSave,
}) => {
  const scoreColor = 
    aiScore >= 90 ? "bg-green-500" : 
    aiScore >= 70 ? "bg-yellow-500" : 
    "bg-red-500";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <p className="text-muted-foreground">{company}</p>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${scoreColor}`}>
                      <span className="font-bold">{aiScore}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Match</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Match Score: {aiScore}%</p>
                  <p className="text-xs text-muted-foreground">Based on your profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {getTagIcon(tag)}
                {tag}
              </Badge>
            ))}
          </div>
          
          <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
          
          <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{salary}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{posted}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{applications} applications</span>
            <Progress value={Math.min(applications * 2, 100)} className="h-2 flex-1" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-4 bg-muted/20 border-t">
        <Button variant="outline" size="sm" onClick={onSave} className="gap-1">
          <BookmarkPlus className="h-4 w-4" />
          Save
        </Button>
        <Button onClick={onApply} className="gap-1">
          <ExternalLink className="h-4 w-4" />
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
