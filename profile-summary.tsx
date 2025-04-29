import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/user-avatar";
import { Separator } from "@/components/ui/separator";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

interface ProfileSummaryProps {
  user: User;
  stats?: {
    teachingSkillsCount: number;
    learningSkillsCount: number;
    averageRating: number | null;
  };
}

export function ProfileSummary({ user, stats }: ProfileSummaryProps) {
  // Get user's average rating
  const rating = stats?.averageRating || null;
  
  // Render star rating component
  const StarRating = ({ rating }: { rating: number | null }) => {
    if (rating === null) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" />);
    }
    
    return (
      <div className="flex text-yellow-400 text-sm">
        {stars}
        <span className="ml-1 text-xs text-slate-500">({rating.toFixed(1)})</span>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <UserAvatar user={user} size="lg" />
          <div className="ml-4">
            <h4 className="text-lg font-semibold text-slate-900">{user.fullName}</h4>
            <p className="text-sm text-slate-500">{user.bio || "Web Developer & Designer"}</p>
            <div className="mt-1">
              <StarRating rating={rating} />
            </div>
          </div>
        </div>
        
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-2 gap-x-4 text-center">
            <div className="py-2">
              <span className="text-2xl font-semibold text-slate-900">{stats?.teachingSkillsCount || 0}</span>
              <p className="mt-1 text-xs text-slate-500">Teaching Skills</p>
            </div>
            <div className="py-2">
              <span className="text-2xl font-semibold text-slate-900">{stats?.learningSkillsCount || 0}</span>
              <p className="mt-1 text-xs text-slate-500">Learning Skills</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Button variant="link" className="text-sm font-medium text-primary hover:text-primary-800 p-0 h-auto">
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
