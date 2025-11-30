import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import ClientLayout from "./ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Download
} from "lucide-react";
import type { Order } from "@shared/schema";

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];

function OrdersList() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/client/orders"],
  });

  const [filter, setFilter] = useState("all");

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    if (filter === "active") return !['delivered', 'completed', 'cancelled'].includes(order.status);
    if (filter === "completed") return ['delivered', 'completed'].includes(order.status);
    return order.status === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "all" ? "You haven't placed any orders yet." : `No ${filter} orders.`}
            </p>
            <Link href="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
              <Card className="hover-elevate cursor-pointer transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          Order #{order.orderNumber || order.id.slice(0, 8)}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} items • R{parseFloat(order.total).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Placed on {new Date(order.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.deliveryMethod === 'delivery' ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4" />
                          <span>Delivery</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Pickup</span>
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderDetails({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useQuery<Order & { statusHistory?: any[]; invoices?: any[] }>({
    queryKey: ["/api/client/orders", orderId],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="font-semibold text-lg mb-2">Order not found</h3>
          <Link href="/dashboard/orders">
            <Button variant="ghost">Back to Orders</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const currentStatusIndex = statusOrder.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon" className="hover-elevate">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold">
            Order #{order.orderNumber || order.id.slice(0, 8)}
          </h2>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt!).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Track your order progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                {statusOrder.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={status} className="flex flex-col items-center flex-1">
                      <div className={`relative ${index < statusOrder.length - 1 ? 'w-full' : ''}`}>
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        {index < statusOrder.length - 1 && (
                          <div className={`absolute top-5 left-10 w-full h-0.5 ${
                            index < currentStatusIndex ? 'bg-primary' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                      <span className={`mt-2 text-xs capitalize ${isCurrent ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>

              {order.trackingNumber && (
                <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="text-sm text-muted-foreground">{order.trackingNumber}</p>
                  </div>
                </div>
              )}

              {order.estimatedDelivery && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      {item.options && Object.keys(item.options).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold">R{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R{parseFloat(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>R{parseFloat(order.deliveryFee || "0").toLocaleString()}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">R{parseFloat(order.total).toLocaleString()}</span>
              </div>
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Status</span>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {order.deliveryMethod === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.deliveryMethod === 'delivery' ? (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm">{order.deliveryAddress}</p>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm">{order.pickupLocation || 'STATS COMPANIES, Pretoria'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {order.invoices && order.invoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.invoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-2 rounded border">
                      <span className="text-sm font-medium">{invoice.invoiceNumber}</span>
                      <Button variant="ghost" size="sm" className="hover-elevate">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const params = useParams();
  const orderId = params.id as string | undefined;

  return (
    <ClientLayout title={orderId ? "Order Details" : "My Orders"}>
      {orderId ? <OrderDetails orderId={orderId} /> : <OrdersList />}
    </ClientLayout>
  );
}
