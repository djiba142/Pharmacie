
import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FinancialAlertCardProps {
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    date?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const FinancialAlertCard: React.FC<FinancialAlertCardProps> = ({
    type,
    title,
    description,
    date,
    actionLabel,
    onAction
}) => {
    const styles = {
        critical: "border-l-red-600 bg-red-50 text-red-900",
        warning: "border-l-amber-500 bg-amber-50 text-amber-900",
        info: "border-l-blue-500 bg-blue-50 text-blue-900",
        success: "border-l-green-500 bg-green-50 text-green-900",
    };

    const icons = {
        critical: <AlertCircle className="h-5 w-5 text-red-600" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
        info: <Info className="h-5 w-5 text-blue-600" />,
        success: <CheckCircle className="h-5 w-5 text-green-600" />,
    };

    return (
        <div className={cn(
            "flex p-4 border-l-4 rounded-r-lg shadow-sm animate-in fade-in slide-in-from-left-2 duration-300",
            styles[type]
        )}>
            <div className="mr-3 mt-0.5">
                {icons[type]}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm">{title}</h4>
                    {date && <span className="text-[10px] uppercase opacity-70">{date}</span>}
                </div>
                <p className="text-sm mt-1 opacity-90 leading-tight">{description}</p>
                {actionLabel && (
                    <button
                        onClick={onAction}
                        className="mt-2 text-xs font-bold underline hover:no-underline transition-all"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FinancialAlertCard;
