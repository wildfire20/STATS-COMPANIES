import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Video, Palette, Megaphone, Printer, Sparkles, X, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      {/* Hero Section */}
      <motion.section 
        className="py-20 md:py-28 hero-gradient relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 decorative-dots opacity-5" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Portfolio
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight" data-testid="text-portfolio-title">
              Our
              <span className="block text-gradient-light">Work</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Explore our portfolio of photography, videography, design, and printing projects. Each piece represents our commitment to quality and creativity.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Portfolio Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <motion.div 
              className="flex justify-center mb-12 overflow-x-auto pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TabsList className="inline-flex h-auto p-1.5 bg-muted/50 rounded-2xl">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="whitespace-nowrap rounded-xl py-3 px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all font-medium"
                    data-testid={`tab-${category.id}`}
                  >
                    {category.icon && <category.icon className="h-4 w-4 mr-2 hidden sm:block" />}
                    <span className="text-xs sm:text-sm">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            <TabsContent value={selectedCategory}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {Array(6).fill(0).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-2xl" />
                    ))}
                  </motion.div>
                ) : filteredItems && filteredItems.length > 0 ? (
                  <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={selectedCategory}
                  >
                    {filteredItems.map((item, index) => {
                      const Icon = getCategoryIcon(item.category);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="overflow-hidden cursor-pointer group border-0 shadow-lg hover:shadow-2xl transition-all duration-500"
                            onClick={() => setSelectedItem(item)}
                            data-testid={`card-portfolio-${item.id}`}
                          >
                            <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden img-hover-zoom">
                              {(item.thumbnailUrl || item.mediaUrl) ? (
                                <img 
                                  src={item.thumbnailUrl || item.mediaUrl} 
                                  alt={item.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  data-testid={`img-portfolio-${item.id}`}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Icon className="h-20 w-20 text-muted-foreground/20" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <motion.div 
                                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Eye className="w-6 h-6 text-white" />
                                </motion.div>
                              </div>
                              {item.featured && (
                                <Badge className="absolute top-4 right-4 bg-secondary/90 backdrop-blur-sm shadow-lg">Featured</Badge>
                              )}
                            </div>
                            <CardContent className="p-5">
                              <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="capitalize text-xs">
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
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="icon-container-lg mx-auto mb-6">
                      <Camera className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-display font-semibold mb-3">No items in this category</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Check back soon for more work in this category.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card">
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                {(selectedItem.thumbnailUrl || selectedItem.mediaUrl) ? (
                  <img 
                    src={selectedItem.thumbnailUrl || selectedItem.mediaUrl} 
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    data-testid="img-portfolio-detail"
                  />
                ) : selectedItem.type === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-20 w-20 text-muted-foreground/20" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-20 w-20 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display">{selectedItem.title}</DialogTitle>
                </DialogHeader>
                {selectedItem.description && (
                  <p className="text-muted-foreground leading-relaxed">{selectedItem.description}</p>
                )}
                <div className="flex items-center gap-3 flex-wrap pt-2">
                  <Badge variant="secondary" className="capitalize">{selectedItem.category}</Badge>
                  <Badge variant="outline">{selectedItem.type}</Badge>
                  {selectedItem.client && (
                    <span className="text-sm">Client: <strong>{selectedItem.client}</strong></span>
                  )}
                  {selectedItem.date && (
                    <span className="text-sm text-muted-foreground">{selectedItem.date}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
