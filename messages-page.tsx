import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { MessageList } from "@/components/messages/message-list";
import { Conversation } from "@/components/messages/conversation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/user-avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Inbox, Users } from "lucide-react";

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Fetch all messages
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Fetch conversation with selected user if any
  const { data: conversation, isLoading: conversationLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages/conversation", selectedUserId],
    enabled: !!selectedUserId,
  });

  const handleSelectUser = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedUserId || !content.trim()) return;

    try {
      await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content: content.trim(),
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedUserId] });
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: "An error occurred while sending your message.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  // Extract unique users from messages
  const getUniqueUsers = () => {
    if (!messages) return [];
    
    const userMap = new Map<number, { userId: number; lastMessage: Message }>();
    
    messages.forEach(message => {
      const otherUserId = message.senderId === user.id ? message.receiverId : message.senderId;
      
      if (!userMap.has(otherUserId) || new Date(message.createdAt) > new Date(userMap.get(otherUserId)!.lastMessage.createdAt)) {
        userMap.set(otherUserId, { userId: otherUserId, lastMessage: message });
      }
    });
    
    return Array.from(userMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  };

  const uniqueUsers = getUniqueUsers();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Messages"
          description="View and manage your conversations with other users."
        />

        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Messages List */}
            <Card className="md:col-span-1">
              <CardContent className="p-0">
                <Tabs defaultValue="messages" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="messages" className="rounded-none">
                      <Inbox className="h-4 w-4 mr-2" /> Messages
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="rounded-none">
                      <Users className="h-4 w-4 mr-2" /> Contacts
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="messages" className="m-0">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <MessageList 
                        messages={messages} 
                        currentUserId={user.id} 
                        onSelectUser={handleSelectUser}
                        selectedUserId={selectedUserId}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500">No messages yet</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Your conversations will appear here
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="contacts" className="m-0">
                    <div className="text-center py-12">
                      <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500">Contacts feature coming soon</p>
                      <p className="text-sm text-slate-400 mt-1">
                        This feature is under development
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card className="md:col-span-2">
              <CardContent className="p-0">
                {selectedUserId ? (
                  conversationLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Conversation
                      messages={conversation || []}
                      currentUserId={user.id}
                      otherUserId={selectedUserId}
                      onSendMessage={handleSendMessage}
                    />
                  )
                ) : (
                  <div className="h-[500px] flex flex-col items-center justify-center text-center p-4">
                    <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Select a conversation</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      Choose a conversation from the list or start a new one by exploring skills
                      and connecting with teachers or students.
                    </p>
                    <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/explore"}>
                      Explore Skills
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
