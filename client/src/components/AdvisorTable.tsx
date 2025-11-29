import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Advisor {
  id: string;
  name: string;
  initials: string;
  role: string;
  aum: string;
  aumChange: number;
  clients: number;
  revenue: string;
  status: "on-track" | "at-risk" | "exceeding";
}

interface AdvisorTableProps {
  advisors: Advisor[];
  onViewDetails?: (advisor: Advisor) => void;
}

export function AdvisorTable({ advisors, onViewDetails }: AdvisorTableProps) {
  const getStatusBadge = (status: Advisor["status"]) => {
    switch (status) {
      case "exceeding":
        return <Badge variant="default" className="bg-green-600 dark:bg-green-700">Exceeding</Badge>;
      case "at-risk":
        return <Badge variant="destructive">At Risk</Badge>;
      default:
        return <Badge variant="secondary">On Track</Badge>;
    }
  };

  return (
    <div className="rounded-md border" data-testid="table-advisors">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Advisor</TableHead>
            <TableHead className="text-right">AUM</TableHead>
            <TableHead className="text-right">Clients</TableHead>
            <TableHead className="text-right">Revenue YTD</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {advisors.map((advisor) => (
            <TableRow key={advisor.id} data-testid={`row-advisor-${advisor.id}`}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {advisor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{advisor.name}</div>
                    <div className="text-xs text-muted-foreground">{advisor.role}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="font-mono">{advisor.aum}</div>
                <div
                  className={cn(
                    "flex items-center justify-end gap-1 text-xs",
                    advisor.aumChange >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {advisor.aumChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="font-mono">
                    {advisor.aumChange >= 0 ? "+" : ""}
                    {advisor.aumChange}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">{advisor.clients}</TableCell>
              <TableCell className="text-right font-mono">{advisor.revenue}</TableCell>
              <TableCell>{getStatusBadge(advisor.status)}</TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onViewDetails?.(advisor)}
                  data-testid={`button-view-advisor-${advisor.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
