import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Clock, Camera, Video, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

const bookingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  serviceName: z.string().min(1, "Please select a service"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const services = [
  { id: "event-photography", name: "Event Photography", category: "photography" },
  { id: "studio-photoshoot", name: "Studio Photoshoot", category: "photography" },
  { id: "wedding-photography", name: "Wedding Photography", category: "photography" },
  { id: "event-videography", name: "Event Videography", category: "videography" },
  { id: "corporate-video", name: "Corporate Video", category: "videography" },
  { id: "social-media-video", name: "Social Media Video", category: "videography" },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

export default function Bookings() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [bookingComplete, setBookingComplete] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceName: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      setBookingComplete(true);
      toast({
        title: "Booking Confirmed",
        description: "We'll contact you shortly to confirm your appointment.",
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue("date", format(date, "yyyy-MM-dd"));
    }
  };

  if (bookingComplete) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for your booking. We'll contact you shortly to confirm your appointment details.
            </p>
            <Button onClick={() => setBookingComplete(false)} data-testid="button-new-booking">
              Make Another Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-secondary text-white mb-4">Book a Session</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4" data-testid="text-bookings-title">
              Schedule Your Session
            </h1>
            <p className="text-muted-foreground text-lg">
              Book a photography or videography session with our professional team. Select your preferred date and time.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5" />
                          Select Date & Time
                        </CardTitle>
                        <CardDescription>Choose your preferred date and time slot</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="mb-2 block">Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) => date < new Date() || date.getDay() === 0}
                            className="rounded-md border"
                            data-testid="calendar"
                          />
                          {form.formState.errors.date && (
                            <p className="text-sm text-destructive mt-2">{form.formState.errors.date.message}</p>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Slot</FormLabel>
                              <div className="grid grid-cols-3 gap-2">
                                {timeSlots.map((time) => (
                                  <Button
                                    key={time}
                                    type="button"
                                    variant={field.value === time ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => field.onChange(time)}
                                    data-testid={`button-time-${time}`}
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {time}
                                  </Button>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Service & Contact Details</CardTitle>
                        <CardDescription>Select your service and provide your contact information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="serviceName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-service">
                                    <SelectValue placeholder="Select a service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Photography</div>
                                  {services.filter(s => s.category === "photography").map((service) => (
                                    <SelectItem key={service.id} value={service.name}>
                                      <div className="flex items-center gap-2">
                                        <Camera className="h-3 w-3" />
                                        {service.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Videography</div>
                                  {services.filter(s => s.category === "videography").map((service) => (
                                    <SelectItem key={service.id} value={service.name}>
                                      <div className="flex items-center gap-2">
                                        <Video className="h-3 w-3" />
                                        {service.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} data-testid="input-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+27 12 345 6789" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us more about your requirements..."
                                  className="resize-none"
                                  {...field} 
                                  data-testid="input-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={bookingMutation.isPending}
                      data-testid="button-submit-booking"
                    >
                      {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
