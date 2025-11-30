import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ClientLayout from "./ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingCart, 
  Calendar, 
  FileText, 
  DollarSign,
  Package,
  Clock,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import type { Order, Booking } from "@shared/schema";

interface ClientStats {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  totalBookings: number;
  upcomingBookings: number;
  totalInvoices: number;
  unreadNotifications: number;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export default function ClientDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<ClientStats>({
    queryKey: ["/api/client/stats"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/client/orders"],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/client/bookings"],
  });

  const recentOrders = orders.slice(0, 3);
  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .slice(0, 3);

  return (
    <ClientLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="hover-elevate transition-all">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary" data-testid="text-total-spent">
                    R{stats?.totalSpent?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime purchases
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-orders">
                    {stats?.totalOrders || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.pendingOrders || 0} in progress
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-bookings">
                    {stats?.totalBookings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.upcomingBookings || 0} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-invoices">
                    {stats?.totalInvoices || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total documents
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </div>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="hover-elevate">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                  <Link href="/shop">
                    <Button variant="ghost" className="mt-2">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover-elevate cursor-pointer border border-transparent hover:border-border transition-all">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            Order #{order.orderNumber || order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} items • R{parseFloat(order.total).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
              </div>
              <Link href="/dashboard/bookings">
                <Button variant="ghost" size="sm" className="hover-elevate">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming bookings</p>
                  <Link href="/bookings">
                    <Button variant="ghost" className="mt-2">Book a Service</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                      <div className="h-10 w-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{booking.serviceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.date} at {booking.time}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/shop">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover-elevate">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Browse Shop</span>
                </Button>
              </Link>
              <Link href="/bookings">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover-elevate">
                  <Calendar className="h-6 w-6" />
                  <span>Book Service</span>
                </Button>
              </Link>
              <Link href="/quote">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover-elevate">
                  <FileText className="h-6 w-6" />
                  <span>Request Quote</span>
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover-elevate">
                  <TrendingUp className="h-6 w-6" />
                  <span>Update Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
