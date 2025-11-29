import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Printer, Search, ShoppingCart, ChevronRight } from "lucide-react";
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

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [selectedCategory !== "all" ? `/api/products?category=${selectedCategory}` : "/api/products"],
  });

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-secondary text-white mb-4">Shop</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4" data-testid="text-shop-title">
              Digital Printing Products
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse our range of high-quality printing products. Customize, upload your artwork, and order online.
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white dark:bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`button-category-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-md" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover-elevate group cursor-pointer" data-testid={`card-product-${product.id}`}>
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        data-testid={`img-product-${product.id}`}
                      />
                    ) : (
                      <Printer className="h-20 w-20 text-primary/20 group-hover:scale-110 transition-transform" />
                    )}
                    <Badge className="absolute top-3 left-3 bg-secondary text-white">
                      Popular
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <span className="text-xs text-muted-foreground">From</span>
                        <span className="block font-bold text-lg text-primary">R{product.basePrice}</span>
                      </div>
                      <Button size="sm" data-testid={`button-order-${product.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Printer className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Quote?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            For bulk orders, custom sizes, or special requirements, get in touch with us for a personalized quote.
          </p>
          <Link href="/quote">
            <Button size="lg" data-testid="button-custom-quote">
              Request Custom Quote
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
