import { useMutation, useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Trash2, Eye } from "lucide-react";
import type { QuoteRequest } from "@shared/schema";

const quoteStatuses = ["new", "contacted", "quoted", "accepted", "declined"];

export default function QuotesManagement() {
  const { toast } = useToast();

  const { data: quotes, isLoading } = useQuery<QuoteRequest[]>({
    queryKey: ["/api/admin/quotes"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/admin/quotes/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Quote status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update quote status", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/quotes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Quote deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete quote", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "quoted": return "bg-purple-100 text-purple-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "declined": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout title="Quote Requests">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground">
            View and manage customer quote requests.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        ) : quotes && quotes.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id} data-testid={`row-quote-${quote.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.name}</p>
                          <p className="text-xs text-muted-foreground">{quote.email}</p>
                          {quote.company && (
                            <p className="text-xs text-muted-foreground">{quote.company}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{quote.serviceType}</Badge>
                      </TableCell>
                      <TableCell>
                        {quote.budget || "-"}
                      </TableCell>
                      <TableCell>
                        {quote.timeline || "-"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={quote.status}
                          onValueChange={(value) => updateStatusMutation.mutate({ 
                            id: quote.id, 
                            status: value 
                          })}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(quote.status)}>
                              {quote.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {quoteStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Quote Request Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-1">Customer</h4>
                                  <p>{quote.name}</p>
                                  <p className="text-sm text-muted-foreground">{quote.email}</p>
                                  <p className="text-sm text-muted-foreground">{quote.phone}</p>
                                  {quote.company && (
                                    <p className="text-sm text-muted-foreground">{quote.company}</p>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium mb-1">Service Type</h4>
                                  <Badge variant="outline">{quote.serviceType}</Badge>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-1">Project Description</h4>
                                  <p className="text-sm">{quote.projectDescription}</p>
                                </div>
                                {quote.budget && (
                                  <div>
                                    <h4 className="font-medium mb-1">Budget</h4>
                                    <p className="text-sm">{quote.budget}</p>
                                  </div>
                                )}
                                {quote.timeline && (
                                  <div>
                                    <h4 className="font-medium mb-1">Timeline</h4>
                                    <p className="text-sm">{quote.timeline}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(quote.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No quote requests yet.</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
