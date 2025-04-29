import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SkillAssessment, Skill } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AssessmentStepProps {
  step: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}

function AssessmentStep({ step, title, isActive, isCompleted }: AssessmentStepProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium relative z-10 
          ${
            isCompleted 
              ? "bg-primary text-white" 
              : isActive 
                ? "bg-primary text-white" 
                : "bg-white border-2 border-slate-300"
          }`}
      >
        {step}
      </div>
      <span className={`text-xs mt-2 ${isActive ? "text-primary-600 font-medium" : "text-slate-500"}`}>
        {title}
      </span>
    </div>
  );
}

function AssessmentSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { step: 1, title: "Knowledge Test" },
    { step: 2, title: "Practical Exercise" },
    { step: 3, title: "Teaching Sample" },
    { step: 4, title: "Review" },
  ];

  return (
    <div className="relative pb-8">
      <div className="flex items-center" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <div className="h-0.5 w-full bg-slate-200"></div>
        </div>
        <div className="relative flex items-center justify-between w-full">
          {steps.map(({ step, title }) => (
            <AssessmentStep
              key={step}
              step={step}
              title={title}
              isActive={currentStep === step}
              isCompleted={currentStep > step}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctOption: number;
}

interface KnowledgeTestProps {
  skillId: number;
  category: string;
  onComplete: (score: number) => void;
}

function KnowledgeTest({ skillId, category, onComplete }: KnowledgeTestProps) {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  
  // Fetch questions based on skill category
  const { data: questions, isLoading, error } = useQuery<Question[]>({
    queryKey: [`/api/assessment/questions?category=${category}&count=10`],
  });
  
  // Handle timer
  useEffect(() => {
    if (timeLeft <= 0) {
      // Time's up, submit the test
      calculateAndSubmitScore();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestion < (questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Calculate score and submit test
  const calculateAndSubmitScore = () => {
    if (!questions) return;
    
    let correctAnswers = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctOption) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    onComplete(score);
    
    toast({
      title: "Knowledge Test Completed",
      description: `You scored ${score}% (${correctAnswers}/${questions.length}).`,
    });
  };
  
  // Submit the test
  const handleSubmit = () => {
    calculateAndSubmitScore();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading questions...</span>
      </div>
    );
  }
  
  if (error || !questions || questions.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load assessment questions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  const question = questions[currentQuestion];
  
  return (
    <div>
      <div className="bg-primary-50 border-l-4 border-primary-400 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-primary-400" />
          <div className="ml-3">
            <p className="text-sm text-primary-700">
              You have <span className="font-medium">{formatTime(timeLeft)}</span> remaining to complete this knowledge test. 
              The test consists of {questions.length} questions about {category}.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-slate-700">
            Question {currentQuestion + 1} of {questions.length}
          </h3>
          <span className="text-sm font-medium text-slate-500">
            Time Remaining: {formatTime(timeLeft)}
          </span>
        </div>
        
        <Progress 
          value={(currentQuestion + 1) / questions.length * 100} 
          className="mb-6 h-2" 
        />
        
        <div className="mb-6">
          <h4 className="text-lg font-medium text-slate-900 mb-4">{question.question}</h4>
          
          <RadioGroup 
            value={answers[currentQuestion]?.toString() || ""} 
            onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3 p-2 rounded-md hover:bg-slate-50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion < questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Submit Test
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AssessmentTestProps {
  assessment: SkillAssessment;
  skill: Skill;
}

export function AssessmentTest({ assessment, skill }: AssessmentTestProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Mutation to update assessment
  const updateAssessmentMutation = useMutation({
    mutationFn: async (data: Partial<SkillAssessment>) => {
      const res = await apiRequest("PUT", `/api/assessments/${assessment.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/assessments/${assessment.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update assessment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle knowledge test completion
  const handleKnowledgeTestComplete = (score: number) => {
    updateAssessmentMutation.mutate({
      knowledgeScore: score,
      currentStep: 2, // Move to next step
    });
  };
  
  // Handle practical exercise completion
  const handlePracticalComplete = (score: number) => {
    updateAssessmentMutation.mutate({
      practicalScore: score,
      currentStep: 3, // Move to next step
    });
  };
  
  // Handle teaching sample completion
  const handleTeachingComplete = (score: number) => {
    updateAssessmentMutation.mutate({
      teachingScore: score,
      currentStep: 4, // Move to review
    });
  };
  
  // Handle assessment completion
  const handleCompleteAssessment = () => {
    const knowledgeScore = assessment.knowledgeScore || 0;
    const practicalScore = assessment.practicalScore || 0;
    const teachingScore = assessment.teachingScore || 0;
    
    // Calculate overall score
    const overallScore = Math.round((knowledgeScore + practicalScore + teachingScore) / 3);
    
    updateAssessmentMutation.mutate({
      overallScore,
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    
    toast({
      title: "Assessment Completed",
      description: `You've successfully completed the assessment with an overall score of ${overallScore}%.`,
    });
    
    // Navigate back to skills page
    navigate("/skills");
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (assessment.currentStep) {
      case 1:
        return (
          <KnowledgeTest 
            skillId={assessment.skillId} 
            category={skill.category}
            onComplete={handleKnowledgeTestComplete} 
          />
        );
      case 2:
        // Placeholder for practical exercise step
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Practical Exercise</h3>
            <p className="text-slate-600 mb-6">
              This part would contain a practical assessment for your skill. 
              For this demo, we'll simulate completion.
            </p>
            <Button onClick={() => handlePracticalComplete(85)}>
              Complete Practical Exercise
            </Button>
          </div>
        );
      case 3:
        // Placeholder for teaching sample step
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Teaching Sample</h3>
            <p className="text-slate-600 mb-6">
              This part would contain a teaching sample assessment.
              For this demo, we'll simulate completion.
            </p>
            <Button onClick={() => handleTeachingComplete(90)}>
              Complete Teaching Sample
            </Button>
          </div>
        );
      case 4:
        // Review and complete step
        const knowledgeScore = assessment.knowledgeScore || 0;
        const practicalScore = assessment.practicalScore || 0;
        const teachingScore = assessment.teachingScore || 0;
        const overallScore = Math.round((knowledgeScore + practicalScore + teachingScore) / 3);
        
        return (
          <div className="p-6">
            <div className="mb-6 text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Assessment Review</h3>
              <p className="text-slate-600">
                You've completed all parts of the assessment. Here's a summary of your results:
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Knowledge Test</span>
                  <span className="text-sm font-medium">{knowledgeScore}%</span>
                </div>
                <Progress value={knowledgeScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Practical Exercise</span>
                  <span className="text-sm font-medium">{practicalScore}%</span>
                </div>
                <Progress value={practicalScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Teaching Sample</span>
                  <span className="text-sm font-medium">{teachingScore}%</span>
                </div>
                <Progress value={teachingScore} className="h-2" />
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold">Overall Score</span>
                  <span className="text-sm font-semibold">{overallScore}%</span>
                </div>
                <Progress value={overallScore} className="h-3" />
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleCompleteAssessment}>
                Complete Assessment
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          {skill.name} Assessment
        </CardTitle>
        <CardDescription>
          Complete this assessment to validate your teaching capability.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <AssessmentSteps currentStep={assessment.currentStep} />
        </div>
        
        {renderStepContent()}
      </CardContent>
    </Card>
  );
}
