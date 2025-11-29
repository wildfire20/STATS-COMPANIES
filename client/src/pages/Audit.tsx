import { AuditLogViewer, type AuditLogEntry } from "@/components/AuditLogViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Pencil, FileText, AlertTriangle } from "lucide-react";

// todo: remove mock functionality
const mockLogs: AuditLogEntry[] = [
  {
    id: "log-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    userId: "user-123",
    userName: "Sarah Johnson",
    action: "update",
    resource: "Client Portfolio",
    resourceId: "CP-4521",
    ipAddress: "192.168.1.105",
    details: { field: "allocation", oldValue: "60/40", newValue: "70/30" },
  },
  {
    id: "log-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    userId: "user-456",
    userName: "Michael Chen",
    action: "view",
    resource: "Performance Report",
    resourceId: "PR-2024-Q3",
    ipAddress: "192.168.1.142",
  },
  {
    id: "log-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    userId: "user-789",
    userName: "Emily Williams",
    action: "export",
    resource: "Client List",
    ipAddress: "192.168.1.87",
    details: { format: "CSV", recordCount: 156 },
  },
  {
    id: "log-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    userId: "user-123",
    userName: "Sarah Johnson",
    action: "create",
    resource: "Client Account",
    resourceId: "CA-8892",
    ipAddress: "192.168.1.105",
    details: { clientName: "Acme Corp", accountType: "Corporate" },
  },
  {
    id: "log-005",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    userId: "admin-001",
    userName: "Jane Doe",
    action: "login",
    resource: "System",
    ipAddress: "10.0.0.1",
  },
  {
    id: "log-006",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    userId: "user-456",
    userName: "Michael Chen",
    action: "update",
    resource: "Risk Profile",
    resourceId: "RP-1124",
    ipAddress: "192.168.1.142",
    details: { riskLevel: "moderate", previousLevel: "conservative" },
  },
  {
    id: "log-007",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    userId: "user-789",
    userName: "Emily Williams",
    action: "view",
    resource: "Compliance Dashboard",
    ipAddress: "192.168.1.87",
  },
  {
    id: "log-008",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    userId: "user-234",
    userName: "David Brown",
    action: "delete",
    resource: "Draft Report",
    resourceId: "DR-445",
    ipAddress: "192.168.1.98",
    details: { reason: "Duplicate entry" },
  },
  {
    id: "log-009",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    userId: "admin-001",
    userName: "Jane Doe",
    action: "export",
    resource: "Audit Report",
    ipAddress: "10.0.0.1",
    details: { format: "PDF", dateRange: "Q3 2024" },
  },
  {
    id: "log-010",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    userId: "user-345",
    userName: "Lisa Martinez",
    action: "create",
    resource: "Meeting Notes",
    resourceId: "MN-782",
    ipAddress: "192.168.1.112",
    details: { clientId: "CL-4421", type: "Quarterly Review" },
  },
];

// todo: remove mock functionality
const stats = {
  totalActions: 1247,
  viewActions: 543,
  updateActions: 312,
  exportActions: 89,
  flaggedActions: 3,
};

export default function Audit() {
  const handleExport = () => {
    console.log("Exporting audit logs...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Audit Logs</h1>
        <p className="text-muted-foreground">
          Compliance tracking and activity monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Actions
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              View Actions
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{stats.viewActions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Update Actions
            </CardTitle>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{stats.updateActions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exports
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">{stats.exportActions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Flagged
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono text-amber-600 dark:text-amber-400">
              {stats.flaggedActions}
            </div>
          </CardContent>
        </Card>
      </div>

      <AuditLogViewer logs={mockLogs} onExport={handleExport} />
    </div>
  );
}
