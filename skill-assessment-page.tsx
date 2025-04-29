import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { AssessmentTest } from "@/components/skills/assessment-test";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

export default function SkillAssessmentPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch assessment details
  const { data: assessment, isLoading: assessmentLoading } = useQuery({
    queryKey: [`/api/assessments/${id}`],
  });

  // Fetch skill details if assessment is loaded
  const { data: skill, isLoading: skillLoading } = useQuery({
    queryKey: [`/api/skills/${assessment?.skillId}`],
    enabled: !!assessment?.skillId,
  });

  const handleBackClick = () => {
    navigate("/skills");
  };

  if (assessmentLoading || skillLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading assessment...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!assessment || !skill) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Not Found</CardTitle>
                <CardDescription>The assessment you're looking for could not be found.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleBackClick}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Skills
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={handleBackClick} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <PageHeader
              title={`${skill.name} Assessment`}
              description="Complete this assessment to validate your teaching capability."
              noBorder
            />
          </div>

          <AssessmentTest assessment={assessment} skill={skill} />
        </div>
      </main>
    </div>
  );
}
