import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Advisor } from "./AdvisorTable";

interface AdvisorDetailModalProps {
  advisor: Advisor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvisorDetailModal({
  advisor,
  open,
  onOpenChange,
}: AdvisorDetailModalProps) {
  if (!advisor) return null;

  const getStatusBadge = (status: Advisor["status"]) => {
    switch (status) {
      case "exceeding":
        return <Badge className="bg-green-600 dark:bg-green-700">Exceeding Target</Badge>;
      case "at-risk":
        return <Badge variant="destructive">At Risk</Badge>;
      default:
        return <Badge variant="secondary">On Track</Badge>;
    }
  };

  // todo: remove mock functionality
  const performanceData = [
    { month: "Jul", aum: 165 },
    { month: "Aug", aum: 172 },
    { month: "Sep", aum: 168 },
    { month: "Oct", aum: 178 },
    { month: "Nov", aum: 182 },
    { month: "Dec", aum: 185 },
  ];

  // todo: remove mock functionality
  const recentActivity = [
    { action: "Added new client", time: "2 hours ago" },
    { action: "Updated portfolio allocation", time: "1 day ago" },
    { action: "Completed compliance training", time: "3 days ago" },
    { action: "Quarterly review meeting", time: "1 week ago" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-advisor-detail">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {advisor.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span>{advisor.name}</span>
                {getStatusBadge(advisor.status)}
              </div>
              <p className="text-sm font-normal text-muted-foreground">
                {advisor.role}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">Assets Under Management</span>
                  </div>
                  <div className="text-2xl font-semibold font-mono">{advisor.aum}</div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs mt-1",
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
                    <span className="text-muted-foreground">vs. last quarter</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Active Clients</span>
                  </div>
                  <div className="text-2xl font-semibold font-mono">{advisor.clients}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Revenue YTD</span>
                  </div>
                  <div className="text-2xl font-semibold font-mono">{advisor.revenue}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Target Progress</span>
                  </div>
                  <div className="text-2xl font-semibold font-mono">87%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="text-sm font-medium mb-4">AUM Trend (6 Months)</div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                        formatter={(value) => [`$${value}M`, "AUM"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="aum"
                        stroke="hsl(210, 85%, 42%)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <span className="text-sm">{activity.action}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
