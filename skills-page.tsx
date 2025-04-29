import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Skill, SkillAssessment } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { AddSkillForm } from "@/components/skills/add-skill-form";
import { TeachingSkills } from "@/components/skills/teaching-skills";
import { LearningSkills } from "@/components/skills/learning-skills";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function SkillsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAddTeachingSkill, setShowAddTeachingSkill] = useState(false);
  const [showAddLearningSkill, setShowAddLearningSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Fetch teaching skills
  const { data: teachingSkills, isLoading: teachingLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills/teaching"],
  });

  // Fetch learning skills
  const { data: learningSkills, isLoading: learningLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills/learning"],
  });

  // Fetch assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery<SkillAssessment[]>({
    queryKey: ["/api/assessments/user"],
  });

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (skillId: number) => {
      const res = await apiRequest("POST", "/api/assessments", {
        skillId,
        status: "pending",
        currentStep: 1,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment Created",
        description: "You can now start your skill assessment.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments/user"] });
      // Navigate to the assessment page
      navigate(`/assessment/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    if (skill.isTeaching) {
      setShowAddTeachingSkill(true);
    } else {
      setShowAddLearningSkill(true);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await apiRequest("DELETE", `/api/skills/${skillId}`);
      toast({
        title: "Skill Deleted",
        description: "The skill has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/teaching"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/learning"] });
    } catch (error) {
      toast({
        title: "Failed to Delete Skill",
        description: "An error occurred while deleting the skill.",
        variant: "destructive",
      });
    }
  };

  const handleStartAssessment = (skill: Skill) => {
    // Check if there's already an assessment for this skill
    const existingAssessment = assessments?.find(
      (a) => a.skillId === skill.id && (a.status === "pending" || a.status === "in_progress")
    );

    if (existingAssessment) {
      // Navigate to the existing assessment
      navigate(`/assessment/${existingAssessment.id}`);
    } else {
      // Create a new assessment
      createAssessmentMutation.mutate(skill.id);
    }
  };

  const anyLoading = teachingLoading || learningLoading || assessmentsLoading || createAssessmentMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <PageHeader
            title="My Skills"
            description="Manage your teaching and learning skills."
            action={
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    setSelectedSkill(null);
                    setShowAddLearningSkill(true);
                  }}
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Learn Skill
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedSkill(null);
                    setShowAddTeachingSkill(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" /> Teach Skill
                </Button>
              </div>
            }
          />

          <Tabs defaultValue="teaching" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="teaching">Skills I Teach</TabsTrigger>
              <TabsTrigger value="learning">Skills I Want to Learn</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teaching" className="mt-0">
              {teachingLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TeachingSkills
                  skills={teachingSkills || []}
                  assessments={assessments || []}
                  onEdit={handleEditSkill}
                  onDelete={handleDeleteSkill}
                  onStartAssessment={handleStartAssessment}
                  isLoading={anyLoading}
                />
              )}
            </TabsContent>
            
            <TabsContent value="learning" className="mt-0">
              {learningLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : (
                <LearningSkills
                  skills={learningSkills || []}
                  onEdit={handleEditSkill}
                  onDelete={handleDeleteSkill}
                  isLoading={anyLoading}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Skill Forms */}
      <AddSkillForm
        isOpen={showAddTeachingSkill}
        onClose={() => setShowAddTeachingSkill(false)}
        isTeaching={true}
        existingSkill={selectedSkill?.isTeaching ? selectedSkill : undefined}
      />
      
      <AddSkillForm
        isOpen={showAddLearningSkill}
        onClose={() => setShowAddLearningSkill(false)}
        isTeaching={false}
        existingSkill={selectedSkill?.isTeaching ? undefined : selectedSkill}
      />
    </div>
  );
}
