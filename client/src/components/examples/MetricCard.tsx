import { MetricCard } from "../MetricCard";
import { DollarSign, Users, TrendingUp, Briefcase } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <MetricCard
        title="Total AUM"
        value="$847.2M"
        change={12.5}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <MetricCard
        title="Active Clients"
        value="1,284"
        change={8.2}
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Revenue YTD"
        value="$4.23M"
        change={-2.1}
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
  );
}
