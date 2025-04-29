import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skill, User, skillCategories } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/common/user-avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Loader2,
  Star,
  MessageSquare,
  Filter,
  BookOpen,
  GraduationCap,
  Users,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function ExplorePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Fetch all skills
  const { data: skills, isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  // Create exchange mutation
  const createExchangeMutation = useMutation({
    mutationFn: async (data: { teacherId: number; teacherSkillId: number; status: string }) => {
      const res = await apiRequest("POST", "/api/exchanges", {
        ...data,
        studentId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: "Your skill exchange request has been sent!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exchanges"] });
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle requesting a skill exchange
  const handleRequestExchange = (teacherId: number, skillId: number) => {
    createExchangeMutation.mutate({
      teacherId,
      teacherSkillId: skillId,
      status: "pending",
    });
  };

  // Filter skills based on search term and category
  const filteredSkills = skills
    ? skills.filter((skill) => {
        // Filter by teaching skills only
        if (!skill.isTeaching) return false;

        // Filter by search term
        const matchesSearch =
          searchTerm === "" ||
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by category
        const matchesCategory = !selectedCategory || selectedCategory === 'all-categories' || skill.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Explore Skills"
          description="Discover skills that others are teaching and find your next learning opportunity."
        />

        {/* Search and Filter */}
        <div className="px-4 sm:px-0 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search for skills..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All Categories</SelectItem>
                    {skillCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Grid */}
        <div className="px-4 sm:px-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all">All Skills</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="new">Newly Added</TabsTrigger>
              </TabsList>
              <div className="text-sm text-slate-500">
                {filteredSkills.length} {filteredSkills.length === 1 ? "skill" : "skills"} found
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSkills.map((skill) => (
                    <Card key={skill.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between">
                          <Badge variant="outline" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
                            {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {skill.averageRating ? skill.averageRating.toFixed(1) : "New"}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="mt-2">{skill.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{skill.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <UserAvatar
                            user={{ 
                              id: skill.userId, 
                              fullName: "Teacher", 
                              username: "", 
                              password: "",
                              bio: null,
                              profileImage: null,
                              averageRating: null
                            }}
                            size="sm"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium">
                              {skill.activeStudents || 0} active{" "}
                              {skill.activeStudents === 1 ? "student" : "students"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Proficiency: {skill.proficiency ? skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1) : 'Beginner'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary-600 hover:text-primary-800"
                          onClick={() =>
                            toast({
                              title: "View Details",
                              description: "Skill details view is not implemented yet.",
                            })
                          }
                        >
                          <BookOpen className="h-4 w-4 mr-1" /> View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (user?.id === skill.userId) {
                              toast({
                                title: "Cannot Request",
                                description: "You cannot request to learn your own skill.",
                                variant: "destructive",
                              });
                              return;
                            }
                            handleRequestExchange(skill.userId, skill.id);
                          }}
                          disabled={createExchangeMutation.isPending}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> Request
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
                    <Search className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-slate-900">No skills found</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-slate-900">Popular Skills</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This feature is coming soon. Check back later!
                </p>
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-0">
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-slate-100">
                  <GraduationCap className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="mt-3 text-lg font-medium text-slate-900">Newly Added Skills</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This feature is coming soon. Check back later!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
