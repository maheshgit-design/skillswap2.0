import { Skill, SkillAssessment } from "@shared/schema";
import { SkillCard } from "@/components/skills/skill-card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Loader2, PlusIcon, FileCheck, AlertCircle } from "lucide-react";

interface TeachingSkillsProps {
  skills: Skill[];
  assessments: SkillAssessment[];
  onEdit: (skill: Skill) => void;
  onDelete: (skillId: number) => void;
  onStartAssessment: (skill: Skill) => void;
  isLoading: boolean;
}

export function TeachingSkills({ skills, assessments, onEdit, onDelete, onStartAssessment, isLoading }: TeachingSkillsProps) {
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleDeleteClick = (skill: Skill) => {
    setSkillToDelete(skill);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (skillToDelete) {
      onDelete(skillToDelete.id);
      setShowDeleteDialog(false);
      setSkillToDelete(null);
    }
  };

  const handleViewDetails = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowDetailsModal(true);
  };

  const getAssessmentForSkill = (skillId: number) => {
    return assessments.find(a => a.skillId === skillId);
  };

  // Check if a skill needs assessment
  const needsAssessment = (skill: Skill) => {
    const assessment = getAssessmentForSkill(skill.id);
    return !assessment || assessment.status === "completed";
  };

  // Get skills sorted by different criteria
  const getVerifiedSkills = () => skills.filter(skill => {
    const assessment = getAssessmentForSkill(skill.id);
    return assessment && assessment.status === "completed" && assessment.overallScore;
  });

  const getPendingSkills = () => skills.filter(skill => {
    const assessment = getAssessmentForSkill(skill.id);
    return !assessment || assessment.status !== "completed";
  });

  return (
    <>
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Skills ({skills.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({getVerifiedSkills().length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Assessment ({getPendingSkills().length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {skills.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                  <PlusIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Teaching Skills</h3>
                <p className="text-slate-500 text-center mb-6">
                  You haven't added any skills that you can teach. Add your first teaching skill to share your knowledge with others.
                </p>
                <Button onClick={() => onEdit({ id: 0, userId: 0, name: "", description: "", category: "other", isTeaching: true, icon: "", createdAt: new Date() })}>
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Teaching Skill
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map(skill => {
                const assessment = getAssessmentForSkill(skill.id);
                return (
                  <Card key={skill.id} className="border overflow-hidden">
                    <CardContent className="p-0">
                      <SkillCard
                        skill={skill}
                        isTeaching={true}
                        onEdit={() => onEdit(skill)}
                        onViewDetails={() => handleViewDetails(skill)}
                      />
                      
                      {needsAssessment(skill) ? (
                        <div className="p-4 bg-amber-50 border-t">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">Assessment Required</p>
                              <p className="text-xs text-amber-700 mt-1">
                                Complete an assessment to verify your teaching capability.
                              </p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onStartAssessment(skill)} 
                                className="mt-2"
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                Start Assessment
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : assessment && assessment.status === "completed" ? (
                        <div className="p-4 bg-green-50 border-t">
                          <div className="flex items-start">
                            <FileCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-green-800">Verified Skill</p>
                              <p className="text-xs text-green-700 mt-1">
                                Assessment score: {assessment.overallScore}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-blue-50 border-t">
                          <div className="flex items-start">
                            <Loader2 className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Assessment in Progress</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Continue your assessment to verify this skill.
                              </p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onStartAssessment(skill)} 
                                className="mt-2"
                              >
                                Continue Assessment
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              <Card className="border flex items-center justify-center h-[300px]">
                <CardContent className="text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-2">
                    <PlusIcon className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-slate-600">Add New Skill</p>
                  <p className="mt-1 text-xs text-slate-500 mb-4">Share your knowledge with others</p>
                  <Button 
                    variant="outline"
                    onClick={() => onEdit({ id: 0, userId: 0, name: "", description: "", category: "other", isTeaching: true, icon: "", createdAt: new Date() })}
                  >
                    Add Teaching Skill
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="verified">
          {getVerifiedSkills().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Verified Skills</h3>
                <p className="text-slate-500 text-center mb-6">
                  You don't have any verified teaching skills yet. Complete assessments to verify your skills.
                </p>
                <Button onClick={() => onEdit({ id: 0, userId: 0, name: "", description: "", category: "other", isTeaching: true, icon: "", createdAt: new Date() })}>
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Teaching Skill
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getVerifiedSkills().map(skill => {
                const assessment = getAssessmentForSkill(skill.id);
                return (
                  <Card key={skill.id}>
                    <SkillCard
                      skill={skill}
                      isTeaching={true}
                      onEdit={() => onEdit(skill)}
                      onViewDetails={() => handleViewDetails(skill)}
                    />
                    {assessment && (
                      <CardFooter className="bg-green-50 border-t">
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1">
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Verified Skill
                            </Badge>
                            <span className="text-sm font-medium">{assessment.overallScore}%</span>
                          </div>
                          <Progress value={assessment.overallScore || 0} className="h-2" />
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {getPendingSkills().length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">All Skills Verified</h3>
                <p className="text-slate-500 text-center mb-6">
                  Great job! All your teaching skills have been verified.
                </p>
                <Button onClick={() => onEdit({ id: 0, userId: 0, name: "", description: "", category: "other", isTeaching: true, icon: "", createdAt: new Date() })}>
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Teaching Skill
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPendingSkills().map(skill => (
                <Card key={skill.id}>
                  <SkillCard
                    skill={skill}
                    isTeaching={true}
                    onEdit={() => onEdit(skill)}
                    onViewDetails={() => handleViewDetails(skill)}
                  />
                  <CardFooter className="bg-amber-50 border-t">
                    <div className="w-full flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-800">Assessment Required</p>
                        <p className="text-xs text-amber-700">Verify your teaching capability</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => onStartAssessment(skill)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                        Start
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Skill Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSkill?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this skill.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSkill && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Description</h4>
                <p className="text-sm text-slate-600">{selectedSkill.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Category</h4>
                <Badge variant="outline">
                  {selectedSkill.category.charAt(0).toUpperCase() + selectedSkill.category.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Proficiency Level</h4>
                <p className="text-sm text-slate-600">
                  {selectedSkill.proficiency?.charAt(0).toUpperCase() + selectedSkill.proficiency?.slice(1) || "Not specified"}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Active Students</h4>
                <p className="text-sm text-slate-600">
                  {selectedSkill.activeStudents || 0} {selectedSkill.activeStudents === 1 ? "student" : "students"}
                </p>
              </div>
              
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => onEdit(selectedSkill)}>
                  Edit Skill
                </Button>
                <Button variant="destructive" onClick={() => {
                  setShowDetailsModal(false);
                  handleDeleteClick(selectedSkill);
                }}>
                  Delete Skill
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this skill?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the skill 
              "{skillToDelete?.name}" and any associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
