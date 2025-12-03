import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Printer, Search, ShoppingCart, ChevronRight, ArrowRight, Sparkles, Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";

const categories = [
  { id: "all", name: "All Products" },
  { id: "printing", name: "Printing" },
  { id: "apparel", name: "Apparel" },
  { id: "gifts", name: "Corporate Gifts" },
];

export default function Shop() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const initialCategory = params.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { addItem } = useCart();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [selectedCategory !== "all" ? `/api/products?category=${selectedCategory}` : "/api/products"],
  });

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.id);
    try {
      await addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.image || undefined,
        quantity: 1,
        options: {},
        unitPrice: product.basePrice,
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Shop
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight" data-testid="text-shop-title">
              Digital Printing
              <span className="block text-gradient-light">Products</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Browse our range of high-quality printing products. Customize, upload your artwork, and order online.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Filter Bar */}
      <motion.section 
        className="py-6 bg-card/80 backdrop-blur-sm border-b sticky top-16 z-30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full px-5 transition-all ${
                    selectedCategory === category.id 
                      ? "shadow-lg shadow-primary/20" 
                      : ""
                  }`}
                  data-testid={`button-category-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-11 h-11 bg-muted/50 border-0 rounded-full focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Products Grid */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.08,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  whileHover={{ 
                    y: -12,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }}
                  className="group"
                >
                  <Card className="overflow-hidden cursor-pointer border-0 shadow-lg group-hover:shadow-2xl transition-shadow duration-500 h-full" data-testid={`card-product-${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center relative overflow-hidden">
                      {product.image ? (
                        <motion.img 
                          src={product.image} 
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          data-testid={`img-product-${product.id}`}
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      ) : (
                        <motion.div 
                          className="flex flex-col items-center gap-2"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <Printer className="h-20 w-20 text-primary/20" />
                        </motion.div>
                      )}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      />
                      <Badge className="absolute top-4 left-4 bg-secondary/90 backdrop-blur-sm text-white shadow-lg">
                        Popular
                      </Badge>
                      <motion.div
                        className="absolute bottom-4 left-4 right-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <span className="text-white/90 text-sm font-medium">View Details</span>
                      </motion.div>
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-3">
                        <Badge variant="secondary" className="text-xs capitalize mb-2">
                          {product.category}
                        </Badge>
                        <motion.h3 
                          className="font-display font-semibold text-lg text-foreground"
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.3 }}
                        >
                          {product.name}
                        </motion.h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                          <span className="text-xs text-muted-foreground">From</span>
                          <span className="block text-2xl font-display font-bold text-primary">R{product.basePrice}</span>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            size="sm" 
                            className="btn-premium rounded-full px-5" 
                            data-testid={`button-order-${product.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={addingToCart === product.id}
                          >
                            {addingToCart === product.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 mr-2" />
                            )}
                            {addingToCart === product.id ? "Adding..." : "Add to Cart"}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="icon-container-lg mx-auto mb-6">
                <Package className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">No products found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button 
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                variant="outline"
                className="rounded-full px-8"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-24 bg-muted/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Need a <span className="text-gradient">Custom Quote?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                For bulk orders, custom sizes, or special requirements, get in touch with us for a personalized quote.
              </p>
              <Link href="/quote">
                <Button size="lg" className="btn-premium rounded-full px-10 h-14 text-base font-semibold shadow-lg shadow-primary/20" data-testid="button-custom-quote">
                  Request Custom Quote
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
