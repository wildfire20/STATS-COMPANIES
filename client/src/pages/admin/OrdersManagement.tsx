import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ShoppingCart, Trash2, Eye, Package, User, MapPin, CreditCard, Clock, Copy, Check } from "lucide-react";
import type { Order, OrderItem } from "@shared/schema";

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

interface OrderWithHistory extends Order {
  statusHistory?: Array<{
    id: number;
    orderId: string;
    status: string;
    note: string | null;
    createdAt: Date;
  }>;
}

export default function OrdersManagement() {
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: selectedOrder, isLoading: isLoadingDetail } = useQuery<OrderWithHistory>({
    queryKey: ["/api/admin/orders", selectedOrderId],
    enabled: !!selectedOrderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, paymentStatus }: { id: string; status: string; paymentStatus?: string }) => {
      return apiRequest("PUT", `/api/admin/orders/${id}/status`, { status, paymentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Order status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Order deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete order", variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "paid": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `R${num.toFixed(2)}`;
  };

  return (
    <AdminLayout title="Orders Management">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          <p className="text-muted-foreground">
            Manage customer orders and update their status.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        ) : orders && orders.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs" data-testid={`text-order-id-${order.id}`}>
                            {order.orderNumber || order.id.slice(0, 8) + "..."}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(order.id, order.id)}
                            data-testid={`button-copy-id-${order.id}`}
                          >
                            {copiedId === order.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.items?.length || 0} items
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateStatusMutation.mutate({ 
                            id: order.id, 
                            status: value 
                          })}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.paymentStatus}
                          onValueChange={(value) => updateStatusMutation.mutate({ 
                            id: order.id, 
                            status: order.status,
                            paymentStatus: value 
                          })}
                        >
                          <SelectTrigger className="w-28">
                            <Badge className={getStatusColor(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => setSelectedOrderId(order.id)}
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(order.id)}
                            data-testid={`button-delete-order-${order.id}`}
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
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No orders yet.</p>
          </Card>
        )}
      </div>

      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </SheetTitle>
            <SheetDescription>
              Complete order information for fulfillment
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoadingDetail ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-32" />
                <Skeleton className="h-48" />
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Order Overview</h3>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Order ID</span>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-background px-2 py-1 rounded" data-testid="text-full-order-id">
                          {selectedOrder.id}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(selectedOrder.id, "detail-id")}
                        >
                          {copiedId === "detail-id" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {selectedOrder.orderNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Order Number</span>
                        <span className="font-mono text-sm" data-testid="text-order-number">{selectedOrder.orderNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Payment</span>
                      <Badge className={getStatusColor(selectedOrder.paymentStatus)}>{selectedOrder.paymentStatus}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Customer Information</h3>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Name</span>
                      <span className="text-sm font-medium" data-testid="text-customer-name">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <a 
                        href={`mailto:${selectedOrder.customerEmail}`} 
                        className="text-sm text-primary hover:underline"
                        data-testid="link-customer-email"
                      >
                        {selectedOrder.customerEmail}
                      </a>
                    </div>
                    {selectedOrder.customerPhone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Phone</span>
                        <a 
                          href={`tel:${selectedOrder.customerPhone}`} 
                          className="text-sm text-primary hover:underline"
                          data-testid="link-customer-phone"
                        >
                          {selectedOrder.customerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Fulfillment Details</h3>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Method</span>
                      <Badge variant="outline" data-testid="text-delivery-method">
                        {selectedOrder.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
                      </Badge>
                    </div>
                    {selectedOrder.deliveryMethod === "delivery" && selectedOrder.deliveryAddress && (
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground block mb-1">Delivery Address</span>
                        <p className="text-sm bg-background p-3 rounded whitespace-pre-wrap" data-testid="text-delivery-address">
                          {selectedOrder.deliveryAddress}
                        </p>
                      </div>
                    )}
                    {selectedOrder.deliveryMethod === "pickup" && selectedOrder.pickupLocation && (
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground block mb-1">Pickup Location</span>
                        <p className="text-sm bg-background p-3 rounded" data-testid="text-pickup-location">
                          {selectedOrder.pickupLocation}
                        </p>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tracking Number</span>
                        <code className="text-sm" data-testid="text-tracking-number">{selectedOrder.trackingNumber}</code>
                      </div>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Delivery</span>
                        <span className="text-sm">{formatDate(selectedOrder.estimatedDelivery)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Order Items ({selectedOrder.items?.length || 0})</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: OrderItem, index: number) => (
                      <div 
                        key={index} 
                        className="bg-muted/50 rounded-lg p-4"
                        data-testid={`card-order-item-${index}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium" data-testid={`text-item-name-${index}`}>{item.productName}</h4>
                          <span className="font-semibold" data-testid={`text-item-total-${index}`}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>Qty: {item.quantity}</span>
                          <span>{formatCurrency(item.price)} each</span>
                        </div>
                        {item.options && Object.keys(item.options).length > 0 && (
                          <div className="pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground block mb-1">Options:</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(item.options).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.artworkUrl && (
                          <div className="pt-2 border-t border-border/50 mt-2">
                            <a 
                              href={item.artworkUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                              data-testid={`link-artwork-${index}`}
                            >
                              View Artwork File
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Payment Summary</h3>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>{formatCurrency(selectedOrder.deliveryFee || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span data-testid="text-order-total">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">Status History</h3>
                      </div>
                      <div className="space-y-2">
                        {selectedOrder.statusHistory.map((history, index) => (
                          <div key={history.id || index} className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <Badge variant="outline" className="text-xs">{history.status}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(history.createdAt)}
                                </span>
                              </div>
                              {history.note && (
                                <p className="text-muted-foreground mt-1">{history.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Order not found
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
