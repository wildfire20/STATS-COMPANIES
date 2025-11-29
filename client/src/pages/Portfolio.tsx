import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Video, Palette, Megaphone, Printer, X } from "lucide-react";
import type { PortfolioItem } from "@shared/schema";

const categories = [
  { id: "all", name: "All Work", icon: null },
  { id: "photography", name: "Photography", icon: Camera },
  { id: "videography", name: "Videography", icon: Video },
  { id: "design", name: "Design", icon: Palette },
  { id: "marketing", name: "Marketing", icon: Megaphone },
  { id: "printing", name: "Printing", icon: Printer },
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const { data: portfolioItems, isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"],
  });

  const filteredItems = selectedCategory === "all" 
    ? portfolioItems 
    : portfolioItems?.filter(item => item.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "photography": return Camera;
      case "videography": return Video;
      case "design": return Palette;
      case "marketing": return Megaphone;
      case "printing": return Printer;
      default: return Camera;
    }
  };

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-secondary text-white mb-4">Portfolio</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4" data-testid="text-portfolio-title">
              Our Work
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore our portfolio of photography, videography, design, and printing projects. Each piece represents our commitment to quality and creativity.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="flex justify-center mb-8 overflow-x-auto">
              <TabsList className="inline-flex">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="whitespace-nowrap"
                    data-testid={`tab-${category.id}`}
                  >
                    {category.icon && <category.icon className="h-4 w-4 mr-2 hidden sm:block" />}
                    <span className="text-xs sm:text-sm">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={selectedCategory}>
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : filteredItems && filteredItems.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    return (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden cursor-pointer group hover-elevate"
                        onClick={() => setSelectedItem(item)}
                        data-testid={`card-portfolio-${item.id}`}
                      >
                        <div className="aspect-square bg-muted relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="h-16 w-16 text-muted-foreground/20" />
                          </div>
                          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="text-sm font-medium text-primary">View Details</span>
                          </div>
                          {item.featured && (
                            <Badge className="absolute top-3 right-3">Featured</Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="capitalize">
                              {item.category}
                            </Badge>
                            {item.client && (
                              <span className="text-sm text-muted-foreground">{item.client}</span>
                            )}
                            {item.date && (
                              <span className="text-sm text-muted-foreground">{item.date}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Camera className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items in this category</h3>
                  <p className="text-muted-foreground">
                    Check back soon for more work in this category.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  {selectedItem.type === "video" ? (
                    <Video className="h-20 w-20 text-muted-foreground/20" />
                  ) : (
                    <Camera className="h-20 w-20 text-muted-foreground/20" />
                  )}
                </div>
                {selectedItem.description && (
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="capitalize">{selectedItem.category}</Badge>
                  <Badge variant="outline">{selectedItem.type}</Badge>
                  {selectedItem.client && (
                    <span className="text-sm">Client: {selectedItem.client}</span>
                  )}
                  {selectedItem.date && (
                    <span className="text-sm text-muted-foreground">{selectedItem.date}</span>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
