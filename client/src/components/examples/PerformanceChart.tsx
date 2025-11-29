import { PerformanceChart } from "../PerformanceChart";

const lineData = [
  { name: "Jan", revenue: 120, clients: 45 },
  { name: "Feb", revenue: 135, clients: 52 },
  { name: "Mar", revenue: 148, clients: 58 },
  { name: "Apr", revenue: 142, clients: 55 },
  { name: "May", revenue: 165, clients: 63 },
  { name: "Jun", revenue: 178, clients: 71 },
];

const barData = [
  { name: "Smith", aum: 185, target: 200 },
  { name: "Johnson", aum: 142, target: 150 },
  { name: "Williams", aum: 198, target: 180 },
  { name: "Brown", aum: 125, target: 140 },
  { name: "Davis", aum: 167, target: 160 },
];

export default function PerformanceChartExample() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <PerformanceChart
        title="Revenue Trend"
        data={lineData}
        type="line"
        dataKeys={[
          { key: "revenue", color: "hsl(210, 85%, 42%)", name: "Revenue ($K)" },
          { key: "clients", color: "hsl(150, 65%, 35%)", name: "New Clients" },
        ]}
      />
      <PerformanceChart
        title="Advisor AUM vs Target"
        data={barData}
        type="bar"
        dataKeys={[
          { key: "aum", color: "hsl(210, 85%, 42%)", name: "AUM ($M)" },
          { key: "target", color: "hsl(var(--muted))", name: "Target ($M)" },
        ]}
      />
    </div>
  );
}
