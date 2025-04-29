import { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  noBorder?: boolean;
}

export function PageHeader({ title, description, action, noBorder = false }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${noBorder ? '' : 'border-b border-slate-200 pb-5'}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-slate-500 max-w-4xl">{description}</p>
          )}
        </div>
        
        {action && (
          <div className="mt-4 sm:mt-0">{action}</div>
        )}
      </div>
      
      {noBorder ? null : <Separator className="mt-4" />}
    </div>
  );
}
