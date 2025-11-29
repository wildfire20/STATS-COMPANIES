import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { AdvisorTable, type Advisor } from "@/components/AdvisorTable";
import { AdvisorDetailModal } from "@/components/AdvisorDetailModal";
import { DollarSign, Users, TrendingUp, Briefcase } from "lucide-react";

// todo: remove mock functionality
const mockAdvisors: Advisor[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    initials: "SJ",
    role: "Senior Advisor",
    aum: "$185.4M",
    aumChange: 12.3,
    clients: 142,
    revenue: "$892K",
    status: "exceeding",
  },
  {
    id: "2",
    name: "Michael Chen",
    initials: "MC",
    role: "Financial Advisor",
    aum: "$124.8M",
    aumChange: -2.1,
    clients: 98,
    revenue: "$612K",
    status: "at-risk",
  },
  {
    id: "3",
    name: "Emily Williams",
    initials: "EW",
    role: "Senior Advisor",
    aum: "$156.2M",
    aumChange: 8.7,
    clients: 115,
    revenue: "$745K",
    status: "on-track",
  },
  {
    id: "4",
    name: "David Brown",
    initials: "DB",
    role: "Associate Advisor",
    aum: "$78.5M",
    aumChange: 15.2,
    clients: 67,
    revenue: "$385K",
    status: "exceeding",
  },
  {
    id: "5",
    name: "Lisa Martinez",
    initials: "LM",
    role: "Financial Advisor",
    aum: "$142.1M",
    aumChange: 5.8,
    clients: 104,
    revenue: "$678K",
    status: "on-track",
  },
];

// todo: remove mock functionality
const revenueData = [
  { name: "Jul", revenue: 580, clients: 42 },
  { name: "Aug", revenue: 620, clients: 48 },
  { name: "Sep", revenue: 590, clients: 45 },
  { name: "Oct", revenue: 710, clients: 52 },
  { name: "Nov", revenue: 680, clients: 49 },
  { name: "Dec", revenue: 750, clients: 58 },
];

export default function Dashboard() {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground">Team performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total AUM"
          value="$847.2M"
          change={8.4}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Clients"
          value="1,284"
          change={5.2}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Revenue YTD"
          value="$4.23M"
          change={12.1}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="New Accounts"
          value="47"
          change={15.7}
          changeLabel="this month"
          icon={<Briefcase className="h-4 w-4" />}
        />
      </div>

      <PerformanceChart
        title="Revenue & Client Acquisition Trend"
        data={revenueData}
        type="line"
        dataKeys={[
          { key: "revenue", color: "hsl(210, 85%, 42%)", name: "Revenue ($K)" },
          { key: "clients", color: "hsl(150, 65%, 35%)", name: "New Clients" },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <AdvisorTable advisors={mockAdvisors} onViewDetails={handleViewDetails} />
      </div>

      <AdvisorDetailModal
        advisor={selectedAdvisor}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
