import { MetricCard } from "@/components/MetricCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { TrendingUp, Users, Target, Award } from "lucide-react";

// todo: remove mock functionality
const quarterlyData = [
  { name: "Q1 2024", revenue: 980, aum: 780, clients: 1180 },
  { name: "Q2 2024", revenue: 1050, aum: 810, clients: 1220 },
  { name: "Q3 2024", revenue: 1120, aum: 830, clients: 1260 },
  { name: "Q4 2024", revenue: 1080, aum: 847, clients: 1284 },
];

// todo: remove mock functionality
const monthlyData = [
  { name: "Jul", revenue: 350, aum: 815, clients: 1240 },
  { name: "Aug", revenue: 380, aum: 822, clients: 1252 },
  { name: "Sep", revenue: 390, aum: 830, clients: 1260 },
  { name: "Oct", revenue: 345, aum: 838, clients: 1270 },
  { name: "Nov", revenue: 365, aum: 842, clients: 1278 },
  { name: "Dec", revenue: 400, aum: 847, clients: 1284 },
];

// todo: remove mock functionality
const roleBreakdown = [
  { name: "Senior Advisors", count: 3, aum: 510.3, revenue: 2449 },
  { name: "Financial Advisors", count: 2, aum: 266.9, revenue: 1290 },
  { name: "Associate Advisors", count: 2, aum: 170.8, revenue: 830 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("6m");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into performance metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]" data-testid="select-time-range">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Avg Revenue/Advisor"
          value="$604K"
          change={6.8}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Client Retention"
          value="94.2%"
          change={1.2}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Target Achievement"
          value="87%"
          change={4.5}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Top Performers"
          value="4"
          change={33.3}
          changeLabel="exceeding targets"
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends" data-testid="tab-trends">Trends</TabsTrigger>
          <TabsTrigger value="quarterly" data-testid="tab-quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="breakdown" data-testid="tab-breakdown">Team Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart
              title="Revenue Trend"
              data={monthlyData}
              type="line"
              dataKeys={[
                { key: "revenue", color: "hsl(210, 85%, 42%)", name: "Revenue ($K)" },
              ]}
            />
            <PerformanceChart
              title="AUM Growth"
              data={monthlyData}
              type="line"
              dataKeys={[
                { key: "aum", color: "hsl(150, 65%, 35%)", name: "AUM ($M)" },
              ]}
            />
          </div>
          <PerformanceChart
            title="Client Base Growth"
            data={monthlyData}
            type="bar"
            dataKeys={[
              { key: "clients", color: "hsl(25, 75%, 45%)", name: "Total Clients" },
            ]}
          />
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-6">
          <PerformanceChart
            title="Quarterly Performance Overview"
            data={quarterlyData}
            type="bar"
            dataKeys={[
              { key: "revenue", color: "hsl(210, 85%, 42%)", name: "Revenue ($K)" },
              { key: "aum", color: "hsl(150, 65%, 35%)", name: "AUM ($M)" },
            ]}
          />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleBreakdown.map((role) => (
                  <div
                    key={role.name}
                    className="flex items-center justify-between p-4 rounded-md bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.count} members
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        ${role.aum.toFixed(1)}M AUM
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        ${role.revenue}K Revenue
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
