import { useState } from "react";
import { AdvisorTable, type Advisor } from "@/components/AdvisorTable";
import { AdvisorDetailModal } from "@/components/AdvisorDetailModal";
import { PerformanceChart } from "@/components/PerformanceChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus, Download } from "lucide-react";

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
  {
    id: "6",
    name: "Robert Taylor",
    initials: "RT",
    role: "Associate Advisor",
    aum: "$92.3M",
    aumChange: 22.1,
    clients: 78,
    revenue: "$445K",
    status: "exceeding",
  },
  {
    id: "7",
    name: "Amanda Foster",
    initials: "AF",
    role: "Senior Advisor",
    aum: "$168.7M",
    aumChange: -5.2,
    clients: 128,
    revenue: "$812K",
    status: "at-risk",
  },
];

// todo: remove mock functionality
const comparisonData = [
  { name: "Johnson", aum: 185, target: 180 },
  { name: "Chen", aum: 125, target: 150 },
  { name: "Williams", aum: 156, target: 150 },
  { name: "Brown", aum: 79, target: 75 },
  { name: "Martinez", aum: 142, target: 140 },
  { name: "Taylor", aum: 92, target: 80 },
  { name: "Foster", aum: 169, target: 180 },
];

export default function Team() {
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleViewDetails = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setModalOpen(true);
  };

  const filteredAdvisors = mockAdvisors.filter((advisor) => {
    const matchesSearch =
      searchQuery === "" ||
      advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || advisor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Team Performance</h1>
          <p className="text-muted-foreground">
            Monitor and compare advisor metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export-team">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-add-advisor">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Advisor
          </Button>
        </div>
      </div>

      <PerformanceChart
        title="AUM vs Target by Advisor"
        data={comparisonData}
        type="bar"
        dataKeys={[
          { key: "aum", color: "hsl(210, 85%, 42%)", name: "Current AUM ($M)" },
          { key: "target", color: "hsl(var(--muted))", name: "Target ($M)" },
        ]}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search advisors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-advisors"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="exceeding">Exceeding</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AdvisorTable advisors={filteredAdvisors} onViewDetails={handleViewDetails} />

      <AdvisorDetailModal
        advisor={selectedAdvisor}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
