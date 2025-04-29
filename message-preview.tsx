import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { formatDistance } from "date-fns";

interface MessagePreviewProps {
  message: Message;
  onClick: () => void;
}

export function MessagePreview({ message, onClick }: MessagePreviewProps) {
  const { user: currentUser } = useAuth();
  const [otherUserId, setOtherUserId] = useState<number | null>(null);
  
  // Determine the other user in the conversation
  useEffect(() => {
    if (!currentUser) return;
    
    const otherId = message.senderId === currentUser.id
      ? message.receiverId
      : message.senderId;
      
    setOtherUserId(otherId);
  }, [message, currentUser]);
  
  // Fetch the other user's data
  const { data: otherUser, isLoading } = useQuery<User>({
    queryKey: [`/api/user/${otherUserId}`],
    enabled: !!otherUserId,
  });
  
  if (isLoading || !otherUser) {
    return (
      <div className="py-4 animate-pulse">
        <div className="flex items-start">
          <div className="rounded-full bg-slate-200 h-10 w-10 mr-4"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Format the message timestamp
  const timeAgo = formatDistance(
    new Date(message.createdAt),
    new Date(),
    { addSuffix: true }
  );
  
  // Truncate the message content if it's too long
  const truncatedContent = 
    message.content.length > 80
      ? `${message.content.substring(0, 80)}...`
      : message.content;
  
  return (
    <div className="py-4 border-b border-slate-200 last:border-0">
      <div className="flex items-start">
        <UserAvatar user={otherUser} size="sm" />
        <div className="flex-1 min-w-0 ml-4">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-slate-900">{otherUser.fullName}</p>
            <p className="text-xs text-slate-500">{timeAgo}</p>
          </div>
          <p className="text-sm text-slate-600 truncate">{truncatedContent}</p>
          <div className="mt-2">
            <Button
              variant="link"
              size="sm"
              className="text-xs font-medium text-primary-600 hover:text-primary-800 mr-3 p-0 h-auto"
              onClick={onClick}
            >
              Reply
            </Button>
            <Button
              variant="link"
              size="sm"
              className="text-xs font-medium text-slate-600 hover:text-slate-800 p-0 h-auto"
              onClick={onClick}
            >
              View Conversation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
