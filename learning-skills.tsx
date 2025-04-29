import { Skill } from "@shared/schema";
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
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { PlusIcon } from "lucide-react";

interface LearningSkillsProps {
  skills: Skill[];
  onEdit: (skill: Skill) => void;
  onDelete: (skillId: number) => void;
  isLoading: boolean;
}

export function LearningSkills({ skills, onEdit, onDelete, isLoading }: LearningSkillsProps) {
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

  return (
    <>
      {skills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary-50 flex items-center justify-center mb-4">
              <PlusIcon className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Learning Skills</h3>
            <p className="text-slate-500 text-center mb-6">
              You haven't added any skills that you want to learn. Add your first learning skill to find teachers.
            </p>
            <Button 
              variant="secondary"
              onClick={() => onEdit({ id: 0, userId: 0, name: "", description: "", category: "other", isTeaching: false, icon: "", createdAt: new Date() })}
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Add Learning Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {skills.map(skill => (
            <Card key={skill.id}>
              <CardContent className="p-6">
                <SkillCard
                  skill={skill}
                  isTeaching={false}
                  onEdit={() => onEdit(skill)}
                  onViewDetails={() => handleViewDetails(skill)}
                />
              </CardContent>
            </Card>
          ))}
          
          <Button
            variant="outline"
            className="group w-full h-[120px] flex flex-col justify-center items-center border-dashed border-slate-300 hover:border-secondary-300 hover:bg-secondary-50"
            onClick={() => onEdit({ id: 0, userId: 0, name: "", description: "", category: "other", isTeaching: false, icon: "", createdAt: new Date() })}
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-secondary-100 flex items-center justify-center text-slate-400 group-hover:text-secondary-600 mb-2">
              <PlusIcon className="h-5 w-5" />
            </div>
            <p className="font-medium text-slate-600 group-hover:text-secondary-700">Learn New Skill</p>
            <p className="mt-1 text-xs text-slate-500 group-hover:text-secondary-600">Find teachers for your interests</p>
          </Button>
        </div>
      )}
      
      {/* Skill Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedSkill?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this skill you want to learn.
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
                <Badge variant="outline" className="bg-secondary-100 text-secondary-800">
                  {selectedSkill.category.charAt(0).toUpperCase() + selectedSkill.category.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Potential Teachers</h4>
                <p className="text-sm text-slate-600">
                  5 potential teachers available
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
              "{skillToDelete?.name}" from your learning list.
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
