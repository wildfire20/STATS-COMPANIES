import { useState } from "react";
import { AdvisorDetailModal } from "../AdvisorDetailModal";
import { Button } from "@/components/ui/button";
import type { Advisor } from "../AdvisorTable";

const mockAdvisor: Advisor = {
  id: "1",
  name: "Sarah Johnson",
  initials: "SJ",
  role: "Senior Advisor",
  aum: "$185.4M",
  aumChange: 12.3,
  clients: 142,
  revenue: "$892K",
  status: "exceeding",
};

export default function AdvisorDetailModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)} data-testid="button-open-modal">
        View Advisor Details
      </Button>
      <AdvisorDetailModal
        advisor={mockAdvisor}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
