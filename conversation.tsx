import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { UserAvatar } from "@/components/common/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, SendIcon } from "lucide-react";
import { format } from "date-fns";

interface ConversationProps {
  messages: Message[];
  currentUserId: number;
  otherUserId: number;
  onSendMessage: (content: string) => void;
}

export function Conversation({ messages, currentUserId, otherUserId, onSendMessage }: ConversationProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch user info for the other person
  const { data: otherUser, isLoading } = useQuery<User>({
    queryKey: [`/api/user/${otherUserId}`],
    enabled: !!otherUserId,
  });
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    setIsSending(true);
    await onSendMessage(inputValue);
    setInputValue("");
    setIsSending(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach(message => {
    const date = format(new Date(message.createdAt), "MMMM d, yyyy");
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[500px]">
      {/* Conversation header */}
      <div className="p-4 border-b flex items-center">
        {otherUser ? (
          <UserAvatar user={otherUser} withName size="md" />
        ) : (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
            <div className="ml-3">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-xs text-slate-500">{date}</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              
              <div className="space-y-4">
                {dateMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        message.senderId === currentUserId
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {format(new Date(message.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </ScrollArea>
      
      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex items-center">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 mr-2"
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={isSending || !inputValue.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
