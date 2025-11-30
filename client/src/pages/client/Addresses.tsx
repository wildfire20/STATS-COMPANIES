import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ClientLayout from "./ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2,
  Star,
  Home,
  Building2
} from "lucide-react";
import type { Address, InsertAddress } from "@shared/schema";

const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

export default function ClientAddresses() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<InsertAddress>>({
    label: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "South Africa",
    type: "delivery",
    isDefault: false,
  });

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["/api/client/addresses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertAddress>) => {
      const response = await apiRequest("POST", "/api/client/addresses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/addresses"] });
      toast({ title: "Address Added", description: "Your address has been saved." });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add address.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAddress> }) => {
      const response = await apiRequest("PUT", `/api/client/addresses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/addresses"] });
      toast({ title: "Address Updated", description: "Your address has been updated." });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update address.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/client/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/addresses"] });
      toast({ title: "Address Deleted", description: "The address has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete address.", variant: "destructive" });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/client/addresses/${id}/default`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/addresses"] });
      toast({ title: "Default Updated", description: "Your default address has been changed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to set default address.", variant: "destructive" });
    },
  });

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        street: address.street,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: address.country || "South Africa",
        type: address.type || "delivery",
        isDefault: address.isDefault || false,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: "",
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "South Africa",
        type: "delivery",
        isDefault: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
  };

  const handleSubmit = () => {
    if (!formData.label || !formData.street || !formData.city || !formData.province || !formData.postalCode) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <ClientLayout title="My Addresses">
        <div className="grid gap-4 md:grid-cols-2">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="My Addresses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Saved Addresses</h3>
            <p className="text-sm text-muted-foreground">
              Manage your delivery and billing addresses
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="hover-elevate">
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No addresses saved</h3>
              <p className="text-muted-foreground mb-4">
                Add your first address for faster checkout.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <Card key={address.id} className={`hover-elevate transition-all ${address.isDefault ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {address.type === 'billing' ? (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Home className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h4 className="font-semibold">{address.label}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {address.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {address.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <p>{address.street}</p>
                    <p>{address.city}, {address.province}</p>
                    <p>{address.postalCode}, {address.country}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleOpenDialog(address)}
                      className="hover-elevate"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(address.id)}
                          disabled={setDefaultMutation.isPending}
                          className="hover-elevate"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this address?")) {
                              deleteMutation.mutate(address.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive hover-elevate"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress 
                ? "Update the address details below." 
                : "Enter your address details below."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  placeholder="e.g., Home, Office"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  data-testid="input-label"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type || "delivery"} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                placeholder="123 Main Street, Unit 4"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                data-testid="input-street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Pretoria"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  data-testid="input-city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Select 
                  value={formData.province} 
                  onValueChange={(value) => setFormData({ ...formData, province: value })}
                >
                  <SelectTrigger data-testid="select-province">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {SA_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="0001"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  data-testid="input-postal-code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country || "South Africa"}
                  disabled
                  data-testid="input-country"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Saving..." 
                : editingAddress ? "Update Address" : "Add Address"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
}
