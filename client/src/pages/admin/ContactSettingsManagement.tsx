import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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

export default function ContactSettingsManagement() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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
  });

  const { data: settings, isLoading } = useQuery<ContactSetting | null>({
    queryKey: ["/api/admin/contact-settings"],
  });

  useEffect(() => {
    if (settings) {
      setFormData({
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
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (settings?.id) {
        return apiRequest("PUT", `/api/admin/contact-settings/${settings.id}`, data);
      } else {
        return apiRequest("POST", "/api/admin/contact-settings", data);
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
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
      <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="info@statscompanies.co.za"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 12 345 6789"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  data-testid="input-phone"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+27 82 123 4567"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  data-testid="input-whatsapp"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Include country code for WhatsApp links to work correctly.
              </p>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Textarea
                id="address"
                placeholder="123 Main Street, Business Park"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={2}
                data-testid="input-address"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Pretoria"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  data-testid="input-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  placeholder="Gauteng"
                  value={formData.province}
                  onChange={(e) => handleChange("province", e.target.value)}
                  data-testid="input-province"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="0001"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  data-testid="input-postal-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="South Africa"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  data-testid="input-country"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleMapsUrl">Google Maps Link</Label>
              <Input
                id="googleMapsUrl"
                type="url"
                placeholder="https://goo.gl/maps/..."
                value={formData.googleMapsUrl}
                onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                data-testid="input-google-maps"
              />
              <p className="text-xs text-muted-foreground">
                Paste your Google Maps share link so customers can get directions.
              </p>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="businessHours">Operating Hours</Label>
              <Textarea
                id="businessHours"
                placeholder="Monday - Friday: 8:00 AM - 5:00 PM&#10;Saturday: 9:00 AM - 1:00 PM&#10;Sunday: Closed"
                value={formData.businessHours}
                onChange={(e) => handleChange("businessHours", e.target.value)}
                rows={4}
                data-testid="input-business-hours"
              />
              <p className="text-xs text-muted-foreground">
                Enter each day on a new line for better readability.
              </p>
            </div>
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
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.facebook}
                  onChange={(e) => handleChange("facebook", e.target.value)}
                  data-testid="input-facebook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/yourprofile"
                  value={formData.instagram}
                  onChange={(e) => handleChange("instagram", e.target.value)}
                  data-testid="input-instagram"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter / X
                </Label>
                <Input
                  id="twitter"
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={formData.twitter}
                  onChange={(e) => handleChange("twitter", e.target.value)}
                  data-testid="input-twitter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/company/yourcompany"
                  value={formData.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  data-testid="input-linkedin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/@yourchannel"
                  value={formData.youtube}
                  onChange={(e) => handleChange("youtube", e.target.value)}
                  data-testid="input-youtube"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center gap-2">
                  <SiTiktok className="h-4 w-4" />
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  type="url"
                  placeholder="https://tiktok.com/@yourprofile"
                  value={formData.tiktok}
                  onChange={(e) => handleChange("tiktok", e.target.value)}
                  data-testid="input-tiktok"
                />
              </div>
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
    </AdminLayout>
  );
}
