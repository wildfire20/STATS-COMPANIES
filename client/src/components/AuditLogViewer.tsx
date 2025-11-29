import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Download,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Lock,
  UserPlus,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: "view" | "create" | "update" | "delete" | "login" | "export";
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  onExport?: () => void;
}

export function AuditLogViewer({ logs, onExport }: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const getActionIcon = (action: AuditLogEntry["action"]) => {
    switch (action) {
      case "view":
        return <Eye className="h-3 w-3" />;
      case "create":
        return <UserPlus className="h-3 w-3" />;
      case "update":
        return <Pencil className="h-3 w-3" />;
      case "delete":
        return <Trash2 className="h-3 w-3" />;
      case "login":
        return <Lock className="h-3 w-3" />;
      case "export":
        return <FileText className="h-3 w-3" />;
    }
  };

  const getActionBadge = (action: AuditLogEntry["action"]) => {
    const variants: Record<AuditLogEntry["action"], string> = {
      view: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      create: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      update: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      delete: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      login: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      export: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    };

    return (
      <Badge variant="outline" className={cn("gap-1 capitalize", variants[action])}>
        {getActionIcon(action)}
        {action}
      </Badge>
    );
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedLogs);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedLogs(next);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <Card data-testid="audit-log-viewer">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Audit Log</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          data-testid="button-export-audit-logs"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, resource, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-audit-search"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-action-filter">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="export">Export</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found matching your criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <Collapsible
                key={log.id}
                open={expandedLogs.has(log.id)}
                onOpenChange={() => toggleExpand(log.id)}
              >
                <CollapsibleTrigger asChild>
                  <div
                    className="flex items-center gap-4 p-3 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                    data-testid={`row-audit-log-${log.id}`}
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                      <div className="font-mono text-xs text-muted-foreground">
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                      </div>
                      <div className="font-medium truncate">{log.userName}</div>
                      <div>{getActionBadge(log.action)}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {log.resource}
                        {log.resourceId && (
                          <span className="font-mono ml-1">#{log.resourceId}</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        expandedLogs.has(log.id) && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 ml-4 border-l-2 border-muted mt-1 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Log ID:</span>
                      <span className="font-mono text-xs">{log.id}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="font-mono text-xs">{log.userId}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span className="font-mono text-xs">
                        {log.timestamp.toISOString()}
                      </span>
                    </div>
                    {log.ipAddress && (
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-muted-foreground">IP Address:</span>
                        <span className="font-mono text-xs">{log.ipAddress}</span>
                      </div>
                    )}
                    {log.details && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Details:</span>
                        <pre className="bg-background p-2 rounded text-xs font-mono overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
