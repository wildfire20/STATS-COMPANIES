import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ClientLayout from "./ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  User,
  Mail, 
  Phone, 
  Save,
  Bell,
  Shield
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function ClientProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["/api/client/profile"],
  });

  const [formData, setFormData] = useState({
    phone: "",
    marketingOptIn: false,
  });
  const phoneIsValid = formData.phone.trim().length >= 10 && formData.phone.trim().length <= 30;

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserType>) => {
      const response = await apiRequest("PUT", "/api/client/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: async (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (user) {
      setFormData({
        phone: user.phone || "",
        marketingOptIn: user.marketingOptIn || false,
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!phoneIsValid) {
      toast({ title: "Valid phone number required", description: "Enter a phone number between 10 and 30 characters.", variant: "destructive" });
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        phone: user.phone || "",
        marketingOptIn: user.marketingOptIn || false,
      });
    }
  };

  if (isLoading) {
    return (
      <ClientLayout title="My Profile">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit} className="hover-elevate">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update your contact preferences below"
                : "Your account information"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.firstName || "-"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.lastName || "-"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+27 12 345 6789"
                    className="pl-10"
                    required
                    minLength={10}
                    maxLength={30}
                    data-testid="input-phone"
                  />
                  {!phoneIsValid && <p className="mt-1 text-xs text-destructive">A phone number between 10 and 30 characters is required.</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.phone || "Not provided"}</span>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={updateMutation.isPending || !phoneIsValid}
                  className="hover-elevate"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Manage how you receive updates from us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive promotional offers and news
                </p>
              </div>
              <Switch
                checked={isEditing ? formData.marketingOptIn : user?.marketingOptIn || false}
                onCheckedChange={(checked) => {
                  if (isEditing) {
                    setFormData({ ...formData, marketingOptIn: checked });
                  } else {
                    updateMutation.mutate({ phone: user?.phone || "", marketingOptIn: checked });
                  }
                }}
                data-testid="switch-marketing"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about order status changes
                </p>
              </div>
              <Switch checked disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Booking Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders for upcoming appointments
                </p>
              </div>
              <Switch checked disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">
                  Last changed: Never
                </p>
              </div>
              <Button variant="outline" className="hover-elevate">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
