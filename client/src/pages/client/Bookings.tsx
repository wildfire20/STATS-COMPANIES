import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ClientLayout from "./ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin,
  Plus,
  Phone,
  Mail
} from "lucide-react";
import type { Booking } from "@shared/schema";

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export default function ClientBookings() {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/client/bookings"],
  });

  const upcomingBookings = bookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status) && new Date(b.date) >= new Date()
  );
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || new Date(b.date) < new Date()
  );

  if (isLoading) {
    return (
      <ClientLayout title="My Bookings">
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
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="My Bookings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Service Appointments</h3>
            <p className="text-sm text-muted-foreground">Manage your scheduled services</p>
          </div>
          <Link href="/bookings">
            <Button className="hover-elevate">
              <Plus className="h-4 w-4 mr-2" />
              Book New Service
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">No upcoming bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule a service appointment to get started.
                  </p>
                  <Link href="/bookings">
                    <Button>Book a Service</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">No past bookings</h3>
                  <p className="text-muted-foreground">
                    Your completed appointments will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isPast />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't made any service appointments yet.
                  </p>
                  <Link href="/bookings">
                    <Button>Book Your First Service</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
}

function BookingCard({ booking, isPast = false }: { booking: Booking; isPast?: boolean }) {
  const bookingDate = new Date(booking.date);
  const isToday = bookingDate.toDateString() === new Date().toDateString();

  return (
    <Card className={`hover-elevate transition-all ${isPast ? 'opacity-75' : ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className={`h-16 w-16 rounded-lg flex items-center justify-center shrink-0 ${
            isToday 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-primary/10'
          }`}>
            <div className="text-center">
              <div className={`text-xl font-bold ${isToday ? '' : 'text-primary'}`}>
                {bookingDate.getDate()}
              </div>
              <div className={`text-xs uppercase ${isToday ? '' : 'text-primary'}`}>
                {bookingDate.toLocaleString('default', { month: 'short' })}
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{booking.serviceName}</h3>
              <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
              {isToday && <Badge variant="outline" className="bg-primary/10 text-primary border-primary">Today</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{bookingDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{booking.time}</span>
              </div>
            </div>
            {booking.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                Notes: {booking.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {!isPast && booking.status !== 'cancelled' && (
              <>
                <Button variant="outline" size="sm" className="hover-elevate">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </>
            )}
            {isPast && booking.status === 'completed' && (
              <Link href="/bookings">
                <Button variant="outline" size="sm" className="hover-elevate">
                  Book Again
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
