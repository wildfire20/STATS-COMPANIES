import { AuditLogViewer, type AuditLogEntry } from "../AuditLogViewer";

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
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    userId: "user-456",
    userName: "Michael Chen",
    action: "view",
    resource: "Performance Report",
    resourceId: "PR-2024-Q3",
    ipAddress: "192.168.1.142",
  },
  {
    id: "log-003",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    userId: "user-789",
    userName: "Emily Williams",
    action: "export",
    resource: "Client List",
    ipAddress: "192.168.1.87",
    details: { format: "CSV", recordCount: 156 },
  },
  {
    id: "log-004",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
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
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    userId: "admin-001",
    userName: "Admin User",
    action: "login",
    resource: "System",
    ipAddress: "10.0.0.1",
  },
];

export default function AuditLogViewerExample() {
  return (
    <div className="p-6">
      <AuditLogViewer
        logs={mockLogs}
        onExport={() => console.log("Exporting audit logs...")}
      />
    </div>
  );
}
