import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ClientLayout from "./ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Eye,
  Calendar,
  DollarSign
} from "lucide-react";
import type { Invoice } from "@shared/schema";

function getStatusColor(status: string) {
  switch (status) {
    case 'issued': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export default function ClientInvoices() {
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/client/invoices"],
  });

  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
  const totalPaid = paidInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0);
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + parseFloat(i.total), 0);

  if (isLoading) {
    return (
      <ClientLayout title="Invoices">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Invoices">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">
                All time documents
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R{totalPaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {paidInvoices.length} invoices paid
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R{totalUnpaid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {unpaidInvoices.length} invoices pending
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg mb-2">No invoices yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your invoices will appear here after completing orders.
                </p>
                <Link href="/shop">
                  <Button>Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover-elevate">
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.issuedAt!).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold">
                          R{parseFloat(invoice.total).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status || 'issued')}>
                            {invoice.status || 'issued'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.dueDate 
                            ? new Date(invoice.dueDate).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="hover-elevate"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.fileUrl && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="hover-elevate"
                                title="Download Invoice"
                                onClick={() => window.open(invoice.fileUrl!, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
