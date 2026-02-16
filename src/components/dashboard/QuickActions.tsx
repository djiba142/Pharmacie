import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'outline' | 'secondary';
    disabled?: boolean;
}

interface QuickActionsProps {
    actions: QuickAction[];
    title?: string;
    columns?: 2 | 3 | 4;
}

export default function QuickActions({
    actions,
    title = 'Actions Rapides',
    columns = 3
}: QuickActionsProps) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4'
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`grid ${gridCols[columns]} gap-3`}>
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                className="h-auto flex-col gap-2 py-4 px-3"
                                onClick={action.onClick}
                                disabled={action.disabled}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium leading-tight text-center">
                                    {action.label}
                                </span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
