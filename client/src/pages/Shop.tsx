import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Printer, Search, Filter, ShoppingCart } from "lucide-react";
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
      <section className="py-12 bg-muted border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Shop</Badge>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-shop-title">
              Digital Printing Products
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse our range of high-quality printing products. Customize, upload your artwork, and order online.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 border-b">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-md" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="flex flex-col hover-elevate" data-testid={`card-product-${product.id}`}>
                  <CardHeader className="pb-4">
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                      <Printer className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-4 border-t gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Starting from</span>
                      <p className="text-lg font-bold text-primary">R{product.basePrice}</p>
                    </div>
                    <Link href={`/shop/${product.id}`}>
                      <Button size="sm" data-testid={`button-view-${product.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Printer className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Need a Custom Order?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find exactly what you're looking for? We offer custom printing solutions for unique requirements.
            </p>
            <Link href="/quote">
              <Button data-testid="button-custom-quote">Request a Custom Quote</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
