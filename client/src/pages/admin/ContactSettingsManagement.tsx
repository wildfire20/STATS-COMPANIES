import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  Save,
  Globe
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import type { ContactSetting } from "@shared/schema";
import { insertContactSettingSchema } from "@shared/schema";

const contactSettingsFormSchema = insertContactSettingSchema.extend({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  businessHours: z.string().optional(),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  youtube: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
});

type ContactSettingsFormValues = z.infer<typeof contactSettingsFormSchema>;

export default function ContactSettingsManagement() {
  const { toast } = useToast();

  const form = useForm<ContactSettingsFormValues>({
    resolver: zodResolver(contactSettingsFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      country: "South Africa",
      businessHours: "",
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      tiktok: "",
      googleMapsUrl: "",
    },
  });

  const { data: settings, isLoading } = useQuery<ContactSetting | null>({
    queryKey: ["/api/admin/contact-settings"],
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        email: settings.email || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        address: settings.address || "",
        city: settings.city || "",
        province: settings.province || "",
        postalCode: settings.postalCode || "",
        country: settings.country || "South Africa",
        businessHours: settings.businessHours || "",
        facebook: settings.facebook || "",
        instagram: settings.instagram || "",
        twitter: settings.twitter || "",
        linkedin: settings.linkedin || "",
        youtube: settings.youtube || "",
        tiktok: settings.tiktok || "",
        googleMapsUrl: settings.googleMapsUrl || "",
      });
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: ContactSettingsFormValues) => {
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
      );
      
      if (settings?.id) {
        return apiRequest("PUT", `/api/admin/contact-settings/${settings.id}`, cleanData);
      } else {
        return apiRequest("POST", "/api/admin/contact-settings", cleanData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contact-info"] });
      toast({ title: "Contact settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save contact settings", variant: "destructive" });
    },
  });

  const onSubmit = (data: ContactSettingsFormValues) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Contact Settings">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Contact Settings">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Primary Contact Information
              </CardTitle>
              <CardDescription>
                Set up your main contact details that customers will use to reach you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="info@statscompanies.co.za"
                          data-testid="input-email"
                          {...field}
                        />
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
                        <Input
                          type="tel"
                          placeholder="+27 12 345 6789"
                          data-testid="input-phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      WhatsApp Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+27 82 123 4567"
                        data-testid="input-whatsapp"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include country code for WhatsApp links to work correctly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Physical Address
              </CardTitle>
              <CardDescription>
                Your business location for customers who want to visit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Main Street, Business Park"
                        rows={2}
                        data-testid="input-address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pretoria"
                          data-testid="input-city"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Gauteng"
                          data-testid="input-province"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0001"
                          data-testid="input-postal-code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="South Africa"
                          data-testid="input-country"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="googleMapsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps Link</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://goo.gl/maps/..."
                        data-testid="input-google-maps"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Paste your Google Maps share link so customers can get directions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>
                Let customers know when you're available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="businessHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Hours</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={"Monday - Friday: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed"}
                        rows={4}
                        data-testid="input-business-hours"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter each day on a new line for better readability.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media
              </CardTitle>
              <CardDescription>
                Connect your social media profiles to increase your online presence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Facebook
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://facebook.com/yourpage"
                          data-testid="input-facebook"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        Instagram
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://instagram.com/yourprofile"
                          data-testid="input-instagram"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Twitter className="h-4 w-4" />
                        Twitter / X
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://twitter.com/yourhandle"
                          data-testid="input-twitter"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-blue-700" />
                        LinkedIn
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://linkedin.com/company/yourcompany"
                          data-testid="input-linkedin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-600" />
                        YouTube
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://youtube.com/@yourchannel"
                          data-testid="input-youtube"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tiktok"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <SiTiktok className="h-4 w-4" />
                        TikTok
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://tiktok.com/@yourprofile"
                          data-testid="input-tiktok"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              disabled={saveMutation.isPending}
              data-testid="button-save-contact-settings"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Contact Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}
