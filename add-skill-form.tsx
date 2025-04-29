import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { skillValidationSchema, skillCategories, proficiencyLevels, Skill } from "@shared/schema";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap } from "lucide-react";

interface AddSkillFormProps {
  isOpen: boolean;
  onClose: () => void;
  isTeaching: boolean;
  existingSkill?: Skill;
}

// Form schema for add/edit skill form
const formSchema = skillValidationSchema
  .omit({ userId: true })
  .extend({
    isTeaching: z.boolean(),
  });

type FormData = z.infer<typeof formSchema>;

export function AddSkillForm({ isOpen, onClose, isTeaching, existingSkill }: AddSkillFormProps) {
  const { toast } = useToast();
  const isEditing = !!existingSkill;
  
  // Initialize form with default values or existing skill values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: existingSkill ? {
      ...existingSkill,
    } : {
      name: "",
      description: "",
      category: undefined,
      proficiency: isTeaching ? "intermediate" : undefined,
      isTeaching,
      icon: "",
    },
  });
  
  // Mutation for creating/updating a skill
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing && existingSkill) {
        const res = await apiRequest("PUT", `/api/skills/${existingSkill.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/skills", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Skill updated" : "Skill added",
        description: isEditing 
          ? "Your skill has been updated successfully."
          : "Your new skill has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/teaching"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/learning"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} skill: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-full">
              <GraduationCap className="text-primary-600 h-5 w-5" />
            </div>
            <DialogTitle>
              {isEditing
                ? "Edit Skill"
                : isTeaching
                ? "Add New Skill to Teach"
                : "Add New Skill to Learn"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isTeaching
              ? "Fill out the details below to add a new skill that you would like to teach others."
              : "Fill out the details below to add a new skill that you would like to learn."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. JavaScript Development" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          isTeaching
                            ? "Describe what you can teach and your experience level with this skill"
                            : "Describe what you want to learn and your current knowledge level"
                        }
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isTeaching && (
                <FormField
                  control={form.control}
                  name="proficiency"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Your Proficiency Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {proficiencyLevels.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <RadioGroupItem value={level} id={level} />
                              <Label htmlFor={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <input type="hidden" {...form.register("isTeaching")} value={isTeaching.toString()} />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Skill"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
