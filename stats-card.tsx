import { Card, CardContent } from "@/components/ui/card";
import { IconType } from "react-icons";
import { 
  FaArrowCircleUp, 
  FaArrowCircleDown, 
  FaHandshake, 
  FaStar 
} from "react-icons/fa";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: IconType;
  iconBgColor: string;
  iconColor: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
}: StatsCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 rounded-md p-3 ${iconBgColor}`}
          >
            <Icon className={`text-xl ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-slate-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    teachingSkillsCount: number;
    learningSkillsCount: number;
    activeExchangesCount: number;
    averageRating: number | null;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Skills Teaching"
        value={stats.teachingSkillsCount}
        icon={FaArrowCircleUp}
        iconBgColor="bg-primary-100"
        iconColor="text-primary-600"
      />
      <StatsCard
        title="Skills Learning"
        value={stats.learningSkillsCount}
        icon={FaArrowCircleDown}
        iconBgColor="bg-secondary-100"
        iconColor="text-secondary-600"
      />
      <StatsCard
        title="Active Exchanges"
        value={stats.activeExchangesCount}
        icon={FaHandshake}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-600"
      />
      <StatsCard
        title="Average Rating"
        value={stats.averageRating?.toFixed(1) || "N/A"}
        icon={FaStar}
        iconBgColor="bg-slate-100"
        iconColor="text-yellow-500"
      />
    </div>
  );
}
