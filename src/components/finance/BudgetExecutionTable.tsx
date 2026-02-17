
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface BudgetEntity {
    name: string;
    allocated: number;
    consumed: number;
    type: string;
}

interface BudgetExecutionTableProps {
    entities: BudgetEntity[];
}

const BudgetExecutionTable: React.FC<BudgetExecutionTableProps> = ({ entities }) => {
    const formatGNF = (val: number) => {
        return new Intl.NumberFormat('fr-GN').format(val) + " GNF";
    };

    return (
        <Table>
            <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead className="text-xs uppercase">Entité</TableHead>
                    <TableHead className="text-xs uppercase w-[200px]">Exécution</TableHead>
                    <TableHead className="text-xs uppercase text-right">Budget Alloué</TableHead>
                    <TableHead className="text-xs uppercase text-right">Consommé</TableHead>
                    <TableHead className="text-xs uppercase text-right">Statut</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entities.map((entity, idx) => {
                    const percentage = (entity.consumed / entity.allocated) * 100;
                    let statusColor = "bg-green-500";
                    let statusText = "Normal";
                    let textColor = "text-green-700";
                    let bgColor = "bg-green-100";

                    if (percentage >= 90) {
                        statusColor = "bg-red-500";
                        statusText = "Critique";
                        textColor = "text-red-700";
                        bgColor = "bg-red-100";
                    } else if (percentage >= 75) {
                        statusColor = "bg-amber-500";
                        statusText = "Attention";
                        textColor = "text-amber-700";
                        bgColor = "bg-amber-100";
                    } else if (percentage < 20) {
                        statusColor = "bg-blue-500";
                        statusText = "Sous-exécuté";
                        textColor = "text-blue-700";
                        bgColor = "bg-blue-100";
                    }

                    return (
                        <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                            <TableCell>
                                <div className="font-semibold text-sm">{entity.name}</div>
                                <div className="text-[10px] text-muted-foreground uppercase">{entity.type}</div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span>{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className={cn("h-1.5 w-full rounded-full bg-slate-100 overflow-hidden")}>
                                        <Progress value={percentage} className={cn("h-full transition-all", statusColor)} />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">{formatGNF(entity.allocated)}</TableCell>
                            <TableCell className="text-right text-sm">{formatGNF(entity.consumed)}</TableCell>
                            <TableCell className="text-right">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                    textColor,
                                    bgColor
                                )}>
                                    {statusText}
                                </span>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default BudgetExecutionTable;
