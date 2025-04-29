import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { SkillAssessment, Skill } from "@shared/schema";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssessmentStepProps {
  step: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}

function AssessmentStep({ step, title, isActive, isCompleted }: AssessmentStepProps) {
  return (
    <div>
      <div
        className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium relative z-10 ${
          isCompleted
            ? "bg-primary text-white"
            : isActive
            ? "bg-primary text-white"
            : "bg-white border-2 border-slate-300"
        }`}
      >
        {step}
      </div>
      <div className="mt-3 text-xs">
        <div className={`${isActive ? "text-primary-600 font-medium" : "text-slate-500"}`}>{title}</div>
      </div>
    </div>
  );
}

interface SkillAssessmentCardProps {
  assessment: SkillAssessment;
}

export function SkillAssessmentCard({ assessment }: SkillAssessmentCardProps) {
  const [, navigate] = useLocation();
  
  // Fetch skill details
  const { data: skill, isLoading: skillLoading } = useQuery<Skill>({
    queryKey: [`/api/skills/${assessment.skillId}`],
  });
  
  const handleStartAssessment = () => {
    navigate(`/assessment/${assessment.id}`);
  };
  
  if (skillLoading || !skill) {
    return <div>Loading assessment...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Skill Assessment</CardTitle>
        <CardDescription>Complete this assessment to validate your teaching capability.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Alert className="bg-primary-50 border-l-4 border-primary-400 mb-6">
          <InfoIcon className="h-4 w-4 text-primary-400" />
          <AlertDescription className="text-primary-700">
            You have one pending skill assessment for <span className="font-medium">{skill.name}</span>. 
            Complete this assessment to start teaching this skill.
          </AlertDescription>
        </Alert>
        
        <div className="border border-slate-200 rounded-lg p-5">
          <div className="flex items-start">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 mr-4">
              <i className={`fas fa-${skill.icon || 'graduation-cap'} text-xl`}></i>
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-slate-900">{skill.name} Assessment</h4>
              <p className="text-sm text-slate-500 mt-1">
                Demonstrate your proficiency in {skill.name.toLowerCase()}.
              </p>
              
              <div className="mt-4">
                <div className="relative pb-8">
                  <div className="flex items-center" aria-hidden="true">
                    <div className="absolute inset-0 flex items-center">
                      <div className="h-0.5 w-full bg-slate-200"></div>
                    </div>
                    <div className="relative flex items-center justify-between w-full">
                      <AssessmentStep
                        step={1}
                        title="Knowledge Test"
                        isActive={assessment.currentStep === 1}
                        isCompleted={assessment.currentStep > 1}
                      />
                      <AssessmentStep
                        step={2}
                        title="Practical Exercise"
                        isActive={assessment.currentStep === 2}
                        isCompleted={assessment.currentStep > 2}
                      />
                      <AssessmentStep
                        step={3}
                        title="Teaching Sample"
                        isActive={assessment.currentStep === 3}
                        isCompleted={assessment.currentStep > 3}
                      />
                      <AssessmentStep
                        step={4}
                        title="Review"
                        isActive={assessment.currentStep === 4}
                        isCompleted={assessment.currentStep > 4}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="rounded-lg border border-slate-200 p-4">
                  <h5 className="font-medium text-slate-900 mb-3">
                    {assessment.currentStep === 1 && "Knowledge Test (20 minutes)"}
                    {assessment.currentStep === 2 && "Practical Exercise"}
                    {assessment.currentStep === 3 && "Teaching Sample"}
                    {assessment.currentStep === 4 && "Review"}
                  </h5>
                  <p className="text-sm text-slate-600 mb-4">
                    {assessment.currentStep === 1 && 
                      "Complete a 15-question assessment to demonstrate your knowledge of principles, tools, and best practices."}
                    {assessment.currentStep === 2 && 
                      "Show your practical skills by completing a sample exercise."}
                    {assessment.currentStep === 3 && 
                      "Demonstrate your teaching abilities with a sample lesson."}
                    {assessment.currentStep === 4 && 
                      "Review your assessment results and complete the verification process."}
                  </p>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleStartAssessment}
                    >
                      {assessment.currentStep === 1 
                        ? "Start Assessment" 
                        : "Continue Assessment"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
