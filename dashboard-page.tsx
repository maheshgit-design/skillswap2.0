import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skill, Message } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { DashboardStats } from "@/components/dashboard/stats-card";
import { SkillCard } from "@/components/skills/skill-card";
import { AddSkillForm } from "@/components/skills/add-skill-form";
import { MessagePreview } from "@/components/messaging/message-preview";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSummary } from "@/components/dashboard/profile-summary";
import { SkillAssessmentCard } from "@/components/skills/skill-assessment-card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddTeachingSkill, setShowAddTeachingSkill] = useState(false);
  const [showAddLearningSkill, setShowAddLearningSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch teaching skills
  const { data: teachingSkills, isLoading: teachingLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills/teaching"],
  });

  // Fetch learning skills
  const { data: learningSkills, isLoading: learningLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills/learning"],
  });

  // Fetch recent messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Fetch pending assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments/user"],
  });

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    if (skill.isTeaching) {
      setShowAddTeachingSkill(true);
    } else {
      setShowAddLearningSkill(true);
    }
  };

  const handleViewSkillDetails = (skill: Skill) => {
    toast({
      title: "View Skill Details",
      description: `Viewing details for ${skill.name} is not implemented yet.`,
    });
  };

  const handleMessageClick = () => {
    toast({
      title: "Message View",
      description: "Full conversation view is not implemented yet.",
    });
  };

  if (!user) return null;

  const pendingAssessments = assessments?.filter(a => a.status === "pending" || a.status === "in_progress") || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Your Skill Dashboard"
          description="Track your skill exchanges, manage your profile, and connect with people who want to learn what you teach and teach what you want to learn."
        />

        {/* Dashboard Stats */}
        <div className="px-4 sm:px-0 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Overview</CardTitle>
              <CardDescription>Your skill exchange activity at a glance.</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : stats ? (
                <DashboardStats stats={stats} />
              ) : (
                <p className="text-center py-4 text-slate-500">Could not load dashboard stats.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 px-4 sm:px-0">
          {/* Skills You Teach */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Skills You Teach</CardTitle>
                  <CardDescription>Skills you've added that you can teach others.</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedSkill(null);
                    setShowAddTeachingSkill(true);
                  }}
                >
                  <i className="fas fa-plus mr-1.5"></i> Add Skill
                </Button>
              </CardHeader>
              
              <CardContent>
                {teachingLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : teachingSkills && teachingSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teachingSkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        isTeaching={true}
                        onEdit={handleEditSkill}
                        onViewDetails={handleViewSkillDetails}
                      />
                    ))}
                    <Button
                      variant="outline"
                      className="group h-[176px] flex flex-col justify-center items-center border-dashed border-slate-300 hover:border-primary-300 hover:bg-primary-50"
                      onClick={() => {
                        setSelectedSkill(null);
                        setShowAddTeachingSkill(true);
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 mb-2">
                        <i className="fas fa-plus text-xl"></i>
                      </div>
                      <p className="font-medium text-slate-600 group-hover:text-primary-700">Add New Skill</p>
                      <p className="mt-1 text-xs text-slate-500 group-hover:text-primary-600">Share your knowledge with others</p>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">You haven't added any teaching skills yet.</p>
                    <Button 
                      onClick={() => {
                        setSelectedSkill(null);
                        setShowAddTeachingSkill(true);
                      }}
                    >
                      Add Your First Teaching Skill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile & Skills You Want to Learn */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <ProfileSummary user={user} stats={stats} />

            {/* Skills Learning */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Skills You Want to Learn</CardTitle>
                  <CardDescription>Track your learning interests.</CardDescription>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSelectedSkill(null);
                    setShowAddLearningSkill(true);
                  }}
                >
                  <i className="fas fa-plus mr-1.5"></i> Add Skill
                </Button>
              </CardHeader>
              
              <CardContent>
                {learningLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                ) : learningSkills && learningSkills.length > 0 ? (
                  <div className="space-y-4">
                    {learningSkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        isTeaching={false}
                        onEdit={handleEditSkill}
                        onViewDetails={handleViewSkillDetails}
                      />
                    ))}
                    <Button
                      variant="outline"
                      className="group w-full h-[120px] flex flex-col justify-center items-center border-dashed border-slate-300 hover:border-secondary-300 hover:bg-secondary-50"
                      onClick={() => {
                        setSelectedSkill(null);
                        setShowAddLearningSkill(true);
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-secondary-100 flex items-center justify-center text-slate-400 group-hover:text-secondary-600 mb-2">
                        <i className="fas fa-plus text-lg"></i>
                      </div>
                      <p className="font-medium text-slate-600 group-hover:text-secondary-700">Learn New Skill</p>
                      <p className="mt-1 text-xs text-slate-500 group-hover:text-secondary-600">Find teachers for your interests</p>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">You haven't added any learning skills yet.</p>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setSelectedSkill(null);
                        setShowAddLearningSkill(true);
                      }}
                    >
                      Add Your First Learning Skill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="mt-6 px-4 sm:px-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Your recent conversations with other users.</CardDescription>
              </div>
              <Button variant="outline" className="text-primary bg-primary-50 hover:bg-primary-100">
                View All Messages
              </Button>
            </CardHeader>
            
            <CardContent>
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {messages.slice(0, 3).map((message) => (
                    <MessagePreview key={message.id} message={message} onClick={handleMessageClick} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">You don't have any messages yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skills Assessment */}
        {pendingAssessments.length > 0 && (
          <div className="mt-6 px-4 sm:px-0 mb-8">
            <SkillAssessmentCard assessment={pendingAssessments[0]} />
          </div>
        )}
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
