import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  withName?: boolean;
}

export function UserAvatar({ user, size = "md", withName = false }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };
  
  const nameClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };
  
  // Get initials from user's full name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <div className="flex items-center">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.profileImage || undefined} alt={user.fullName} />
        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
      </Avatar>
      
      {withName && (
        <div className="ml-3">
          <p className={`font-medium text-slate-900 ${nameClasses[size]}`}>{user.fullName}</p>
          {size === "lg" && user.bio && (
            <p className="mt-1 text-sm text-slate-500">{user.bio}</p>
          )}
        </div>
      )}
    </div>
  );
}
