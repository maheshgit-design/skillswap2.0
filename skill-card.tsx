import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skill } from "@shared/schema";
import { IconType } from "react-icons";
import { Badge } from "@/components/ui/badge";
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar, 
  FaCode, 
  FaPaintBrush, 
  FaLanguage, 
  FaMusic, 
  FaChartLine, 
  FaUtensils, 
  FaCamera
} from "react-icons/fa";
import { useState } from "react";

interface SkillCardProps {
  skill: Skill;
  isTeaching: boolean;
  onEdit?: (skill: Skill) => void;
  onViewDetails?: (skill: Skill) => void;
}

// Function to render star ratings
const StarRating = ({ rating }: { rating: number | null }) => {
  if (rating === null) return <span className="text-gray-400 text-xs">No ratings yet</span>;
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} />
        ))}
        {hasHalfStar && <FaStarHalfAlt />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} />
        ))}
      </div>
      <span className="ml-1 text-xs text-slate-500">({rating.toFixed(1)})</span>
    </div>
  );
};

// Function to get an icon based on the category
const getIconForCategory = (category: string): IconType => {
  switch (category) {
    case 'programming':
      return FaCode;
    case 'design':
      return FaPaintBrush;
    case 'language':
      return FaLanguage;
    case 'music':
      return FaMusic;
    case 'business':
      return FaChartLine;
    case 'lifestyle':
      return FaUtensils;
    default:
      return FaCamera; // Default icon
  }
};

export function SkillCard({ skill, isTeaching, onEdit, onViewDetails }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const SkillIcon = getIconForCategory(skill.category);
  
  return (
    <Card 
      className={`transition-all duration-200 relative ${
        isHovered ? 'shadow-md transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 right-3">
        <Badge
          variant="outline"
          className={`${
            isTeaching 
              ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
              : 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200'
          }`}
        >
          <span className="mr-1">●</span> 
          {isTeaching ? 'Teaching' : 'Learning'}
        </Badge>
      </div>
      
      <CardContent className="pt-6">
        <div className="flex items-start">
          <div 
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mr-4 ${
              isTeaching 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-secondary-100 text-secondary-700'
            }`}
          >
            <SkillIcon />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-900">{skill.name}</h4>
            <p className="text-sm text-slate-500 mt-1">
              {skill.description.length > 60 
                ? `${skill.description.substring(0, 60)}...` 
                : skill.description}
            </p>
          </div>
        </div>
        
        {isTeaching && (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <StarRating rating={skill.averageRating} />
              <span className="text-xs text-slate-500">
                {skill.activeStudents || 0} active student{skill.activeStudents !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-3 flex items-center">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full" 
                  style={{ 
                    width: skill.proficiency === 'beginner' ? '25%' : 
                           skill.proficiency === 'intermediate' ? '50%' : 
                           skill.proficiency === 'advanced' ? '75%' : '100%' 
                  }}
                ></div>
              </div>
              <span className="ml-2 text-xs font-medium text-slate-600">
                {skill.proficiency === 'beginner' ? 'Beginner' : 
                 skill.proficiency === 'intermediate' ? 'Intermediate' : 
                 skill.proficiency === 'advanced' ? 'Advanced' : 'Expert'}
              </span>
            </div>
          </div>
        )}
        
        {!isTeaching && (
          <div className="mt-2">
            <span className="inline-flex items-center text-xs font-medium text-secondary-800">
              <i className="fas fa-user-tie mr-1"></i> 5 potential teachers
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end border-t pt-4">
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-600 hover:text-primary-800 mr-3"
            onClick={() => onEdit(skill)}
          >
            Edit
          </Button>
        )}
        
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-600 hover:text-slate-800"
            onClick={() => onViewDetails(skill)}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
