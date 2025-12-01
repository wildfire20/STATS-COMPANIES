import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Camera, Video, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import type { Equipment, EquipmentRental } from "@shared/schema";
import { format } from "date-fns";

const categories = [
  { id: "camera", name: "Cameras" },
  { id: "lens", name: "Lenses" },
  { id: "lighting", name: "Lighting" },
  { id: "audio", name: "Audio" },
  { id: "tripod", name: "Tripods & Supports" },
  { id: "drone", name: "Drones" },
  { id: "other", name: "Other" },
];

const conditions = [
  { id: "excellent", name: "Excellent" },
  { id: "good", name: "Good" },
  { id: "fair", name: "Fair" },
];

export default function EquipmentManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState("equipment");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "camera",
    brand: "",
    model: "",
    image: "",
    dailyRate: "",
    weeklyRate: "",
    deposit: "",
    quantity: "1",
    availableQuantity: "1",
    condition: "excellent",
    specifications: "",
    isActive: true,
  });

  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment/all"],
  });

  const { data: rentals, isLoading: rentalsLoading } = useQuery<EquipmentRental[]>({
    queryKey: ["/api/equipment-rentals"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/equipment", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Equipment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add equipment", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/equipment/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setIsDialogOpen(false);
      setEditingEquipment(null);
      resetForm();
      toast({ title: "Equipment updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update equipment", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/equipment/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({ title: "Equipment deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete equipment", variant: "destructive" });
    },
  });

  const updateRentalStatusMutation = useMutation({
    mutationFn: async ({ id, status, paymentStatus }: { id: string; status: string; paymentStatus?: string }) => {
      return apiRequest("PATCH", `/api/equipment-rentals/${id}/status`, { status, paymentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment-rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({ title: "Rental status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update rental status", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "camera",
      brand: "",
      model: "",
      image: "",
      dailyRate: "",
      weeklyRate: "",
      deposit: "",
      quantity: "1",
      availableQuantity: "1",
      condition: "excellent",
      specifications: "",
      isActive: true,
    });
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      brand: item.brand || "",
      model: item.model || "",
      image: item.image || "",
      dailyRate: item.dailyRate,
      weeklyRate: item.weeklyRate || "",
      deposit: item.deposit || "",
      quantity: String(item.quantity),
      availableQuantity: String(item.availableQuantity),
      condition: item.condition || "excellent",
      specifications: item.specifications || "",
      isActive: item.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      dailyRate: formData.dailyRate || "0",
      weeklyRate: formData.weeklyRate || "0",
      deposit: formData.deposit || "0",
      quantity: parseInt(formData.quantity) || 1,
      availableQuantity: parseInt(formData.availableQuantity) || 1,
    };
    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "active":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case "returned":
        return <Badge variant="outline"><Package className="h-3 w-3 mr-1" /> Returned</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "camera":
        return <Camera className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout title="Equipment Rental Management">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="equipment" data-testid="tab-equipment">Equipment</TabsTrigger>
              <TabsTrigger value="rentals" data-testid="tab-rentals">Rental Requests</TabsTrigger>
            </TabsList>

            {activeTab === "equipment" && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingEquipment(null);
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-equipment">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{editingEquipment ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Equipment Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          data-testid="input-equipment-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="e.g., Canon, Sony"
                          data-testid="input-brand"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          placeholder="e.g., EOS R5"
                          data-testid="input-model"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the equipment and what it's best used for"
                        data-testid="input-description"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dailyRate">Daily Rate (R)</Label>
                        <Input
                          id="dailyRate"
                          type="number"
                          step="0.01"
                          value={formData.dailyRate}
                          onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                          required
                          data-testid="input-daily-rate"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weeklyRate">Weekly Rate (R)</Label>
                        <Input
                          id="weeklyRate"
                          type="number"
                          step="0.01"
                          value={formData.weeklyRate}
                          onChange={(e) => setFormData({ ...formData, weeklyRate: e.target.value })}
                          placeholder="Optional"
                          data-testid="input-weekly-rate"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deposit">Deposit (R)</Label>
                        <Input
                          id="deposit"
                          type="number"
                          step="0.01"
                          value={formData.deposit}
                          onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                          placeholder="Optional"
                          data-testid="input-deposit"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Total Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          required
                          data-testid="input-quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availableQuantity">Available</Label>
                        <Input
                          id="availableQuantity"
                          type="number"
                          min="0"
                          value={formData.availableQuantity}
                          onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                          required
                          data-testid="input-available-quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="condition">Condition</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) => setFormData({ ...formData, condition: value })}
                        >
                          <SelectTrigger data-testid="select-condition">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditions.map((cond) => (
                              <SelectItem key={cond.id} value={cond.id}>{cond.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specifications">Specifications</Label>
                      <Textarea
                        id="specifications"
                        value={formData.specifications}
                        onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                        placeholder="Technical specifications, included accessories, etc."
                        data-testid="input-specifications"
                      />
                    </div>

                    <ImageUpload
                      value={formData.image}
                      onChange={(url) => setFormData({ ...formData, image: url })}
                      label="Equipment Image"
                    />

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        data-testid="switch-active"
                      />
                      <Label htmlFor="isActive">Available for Rental</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-equipment">
                        {editingEquipment ? "Update" : "Add"} Equipment
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="equipment" className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : equipment && equipment.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {equipment.map((item) => (
                  <Card key={item.id} className="overflow-hidden" data-testid={`card-equipment-${item.id}`}>
                    <div className="aspect-video bg-muted relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      {!item.isActive && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">Inactive</Badge>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm capitalize">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">{item.name}</CardTitle>
                          {item.brand && item.model && (
                            <p className="text-sm text-muted-foreground">{item.brand} {item.model}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-lg">R{item.dailyRate}/day</span>
                        <span className="text-muted-foreground">
                          {item.availableQuantity}/{item.quantity} available
                        </span>
                      </div>
                      {item.deposit && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Deposit: R{item.deposit}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Equipment Yet</h3>
                <p className="text-muted-foreground mb-4">Add your first piece of equipment to start accepting rentals.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rentals" className="mt-6">
            {rentalsLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : rentals && rentals.length > 0 ? (
              <div className="space-y-4">
                {rentals.map((rental) => (
                  <Card key={rental.id} data-testid={`card-rental-${rental.id}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground">{rental.rentalNumber}</span>
                            {getStatusBadge(rental.status || "pending")}
                          </div>
                          <h4 className="font-semibold">{rental.equipmentName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rental.customerName} - {rental.customerEmail}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span>
                              {format(new Date(rental.startDate), "MMM d, yyyy")} - {format(new Date(rental.endDate), "MMM d, yyyy")}
                            </span>
                            <span className="text-muted-foreground">({rental.totalDays} days)</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-lg font-semibold">R{rental.total}</p>
                            {rental.deposit && parseFloat(rental.deposit) > 0 && (
                              <p className="text-xs text-muted-foreground">Incl. R{rental.deposit} deposit</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {rental.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateRentalStatusMutation.mutate({ id: rental.id, status: "approved" })}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateRentalStatusMutation.mutate({ id: rental.id, status: "cancelled" })}
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {rental.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => updateRentalStatusMutation.mutate({ id: rental.id, status: "active", paymentStatus: "deposit_paid" })}
                              >
                                Mark as Active
                              </Button>
                            )}
                            {rental.status === "active" && (
                              <Button
                                size="sm"
                                onClick={() => updateRentalStatusMutation.mutate({ id: rental.id, status: "returned", paymentStatus: "refunded" })}
                              >
                                Mark as Returned
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {rental.notes && (
                        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                          Note: {rental.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Rental Requests</h3>
                <p className="text-muted-foreground">Rental requests from customers will appear here.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
