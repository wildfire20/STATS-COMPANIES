import { AdvisorTable, type Advisor } from "../AdvisorTable";

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
];

export default function AdvisorTableExample() {
  return (
    <div className="p-6">
      <AdvisorTable
        advisors={mockAdvisors}
        onViewDetails={(advisor) => console.log("View details:", advisor.name)}
      />
    </div>
  );
}
