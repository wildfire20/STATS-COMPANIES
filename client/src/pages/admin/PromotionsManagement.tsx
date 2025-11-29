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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Tag, Calendar } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import type { Promotion } from "@shared/schema";

export default function PromotionsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount: "",
    validUntil: "",
    image: "",
    isActive: true,
  });

  const { data: promotions, isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/admin/promotions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/promotions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Promotion created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create promotion", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/promotions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      setIsDialogOpen(false);
      setEditingPromotion(null);
      resetForm();
      toast({ title: "Promotion updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update promotion", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/promotions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      toast({ title: "Promotion deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete promotion", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount: "",
      validUntil: "",
      image: "",
      isActive: true,
    });
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discount: promotion.discount || "",
      validUntil: promotion.validUntil || "",
      image: promotion.image || "",
      isActive: promotion.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Promotions Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Manage your promotional offers and discounts.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingPromotion(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-promotion">
                <Plus className="h-4 w-4 mr-2" />
                Add Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPromotion ? "Edit Promotion" : "Add New Promotion"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Promotion Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="input-promotion-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    data-testid="input-promotion-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (e.g., "15% off" or "Save R500")</Label>
                    <Input
                      id="discount"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder="15% off"
                      data-testid="input-promotion-discount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      data-testid="input-promotion-date"
                    />
                  </div>
                </div>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  label="Promotion Image"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-promotion"
                  >
                    {editingPromotion ? "Update" : "Create"} Promotion
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : promotions && promotions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promotion) => (
              <Card key={promotion.id} data-testid={`card-promotion-${promotion.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Tag className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{promotion.title}</CardTitle>
                        <Badge variant={promotion.isActive ? "default" : "secondary"} className="mt-1">
                          {promotion.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(promotion)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {promotion.description}
                  </p>
                  {promotion.discount && (
                    <Badge variant="secondary" className="mb-2">{promotion.discount}</Badge>
                  )}
                  {promotion.validUntil && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Valid until {promotion.validUntil}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No promotions found. Create your first promotion!</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
