import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { UserAvatar } from "@/components/common/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistance } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  onSelectUser: (userId: number) => void;
  selectedUserId: number | null;
}

export function MessageList({ messages, currentUserId, onSelectUser, selectedUserId }: MessageListProps) {
  const { user } = useAuth();
  
  // Get unique conversations grouped by user
  const getUniqueConversations = () => {
    const conversationsMap = new Map<number, { userId: number; lastMessage: Message }>();
    
    messages.forEach(message => {
      const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
      
      if (!conversationsMap.has(otherUserId) || 
          new Date(message.createdAt) > new Date(conversationsMap.get(otherUserId)!.lastMessage.createdAt)) {
        conversationsMap.set(otherUserId, { userId: otherUserId, lastMessage: message });
      }
    });
    
    return Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  };
  
  const conversations = getUniqueConversations();
  
  // Helper to get user details (would ideally be fetched from API)
  const renderConversation = ({ userId, lastMessage }: { userId: number; lastMessage: Message }) => {
    // Simulate fetching user info - in a real app, this would be a query
    // For now, use placeholder data
    const userName = userId.toString(); // Placeholder for demonstration
    
    const isSelected = selectedUserId === userId;
    const isUnread = !lastMessage.isRead && lastMessage.receiverId === currentUserId;
    const timeAgo = formatDistance(
      new Date(lastMessage.createdAt),
      new Date(),
      { addSuffix: true }
    );
    
    // Truncate the message content if it's too long
    const truncatedContent = 
      lastMessage.content.length > 40
        ? `${lastMessage.content.substring(0, 40)}...`
        : lastMessage.content;
    
    return (
      <div 
        key={userId}
        className={`cursor-pointer p-4 hover:bg-slate-50 transition-colors ${
          isSelected ? 'bg-slate-50' : ''
        }`}
        onClick={() => onSelectUser(userId)}
      >
        <div className="flex items-start">
          <UserAvatar 
            user={{ id: userId, fullName: `User ${userId}`, username: userName, password: "" }} 
            size="sm" 
          />
          
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-900">User {userId}</span>
              <span className="text-xs text-slate-500">{timeAgo}</span>
            </div>
            
            <p className={`text-sm ${isUnread ? 'font-medium text-slate-900' : 'text-slate-500'} truncate mt-1`}>
              {lastMessage.senderId === currentUserId ? 'You: ' : ''}{truncatedContent}
            </p>
            
            {isUnread && (
              <Badge className="mt-1 bg-primary">New</Badge>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <ScrollArea className="h-[460px]">
      <div className="divide-y divide-slate-200">
        {conversations.map(conversation => renderConversation(conversation))}
      </div>
    </ScrollArea>
  );
}
