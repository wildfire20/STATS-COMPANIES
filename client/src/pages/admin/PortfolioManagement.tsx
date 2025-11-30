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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Image, Star, Video, Play } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { VideoUpload } from "@/components/VideoUpload";
import type { PortfolioItem } from "@shared/schema";

const categories = [
  { id: "photography", name: "Photography" },
  { id: "videography", name: "Videography" },
  { id: "printing", name: "Printing" },
  { id: "marketing", name: "Marketing" },
];

export default function PortfolioManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "photography",
    type: "image",
    mediaUrl: "",
    thumbnailUrl: "",
    client: "",
    date: "",
    featured: false,
  });

  const { data: items, isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/admin/portfolio"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/portfolio", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Portfolio item created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create portfolio item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/portfolio/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast({ title: "Portfolio item updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update portfolio item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Portfolio item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete portfolio item", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "photography",
      type: "image",
      mediaUrl: "",
      thumbnailUrl: "",
      client: "",
      date: "",
      featured: false,
    });
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      type: item.type,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl || "",
      client: item.client || "",
      date: item.date || "",
      featured: item.featured ?? false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Portfolio Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Showcase your best work in the portfolio gallery.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingItem(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-portfolio">
                <Plus className="h-4 w-4 mr-2" />
                Add Portfolio Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Portfolio Item" : "Add New Portfolio Item"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      data-testid="input-portfolio-title"
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
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    data-testid="input-portfolio-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client Name (optional)</Label>
                    <Input
                      id="client"
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      placeholder="Client name"
                      data-testid="input-portfolio-client"
                    />
                  </div>
                </div>
                {formData.type === "video" ? (
                  <VideoUpload
                    value={formData.mediaUrl}
                    onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                    label="Portfolio Video"
                  />
                ) : (
                  <ImageUpload
                    value={formData.mediaUrl}
                    onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                    label="Portfolio Image"
                  />
                )}
                {formData.type === "video" && (
                  <ImageUpload
                    value={formData.thumbnailUrl}
                    onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                    label="Video Thumbnail (optional)"
                  />
                )}
                <div className="space-y-2">
                  <Label htmlFor="date">Project Date (optional)</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g., June 2024"
                    data-testid="input-portfolio-date"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured (show on homepage)</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-portfolio"
                  >
                    {editingItem ? "Update" : "Create"} Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden" data-testid={`card-portfolio-${item.id}`}>
                <div className="aspect-video bg-muted relative">
                  {item.mediaUrl ? (
                    item.type === "video" ? (
                      <div className="relative w-full h-full">
                        {item.thumbnailUrl ? (
                          <img 
                            src={item.thumbnailUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={item.mediaUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="h-6 w-6 text-primary ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.thumbnailUrl || item.mediaUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {item.type === "video" ? (
                        <Video className="h-8 w-8 text-muted-foreground/30" />
                      ) : (
                        <Image className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.featured && (
                      <Badge className="bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" /> Featured
                      </Badge>
                    )}
                    {item.type === "video" && (
                      <Badge variant="secondary">
                        <Video className="h-3 w-3 mr-1" /> Video
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  {item.client && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Client: {item.client}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No portfolio items yet. Add your first work!</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
