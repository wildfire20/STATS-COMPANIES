import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Video, Megaphone, CheckCircle, ArrowRight } from "lucide-react";
import type { Service } from "@shared/schema";

const serviceCategories = [
  { id: "all", name: "All Services", icon: null },
  { id: "photography", name: "Photography", icon: Camera },
  { id: "videography", name: "Videography", icon: Video },
  { id: "marketing", name: "Digital Marketing", icon: Megaphone },
];

export default function Services() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const initialCategory = params.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: [selectedCategory !== "all" ? `/api/services?category=${selectedCategory}` : "/api/services"],
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "photography": return Camera;
      case "videography": return Video;
      case "marketing": return Megaphone;
      default: return Camera;
    }
  };

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="bg-secondary text-white mb-4">Our Services</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4" data-testid="text-services-title">
              Media & Marketing Services
            </h1>
            <p className="text-muted-foreground text-lg">
              Professional photography, videography, and digital marketing services to elevate your brand and capture your most important moments.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                {serviceCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    data-testid={`tab-${category.id}`}
                  >
                    {category.icon && <category.icon className="h-4 w-4 mr-2 hidden sm:block" />}
                    <span className="text-xs sm:text-sm">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {serviceCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-80 rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services?.filter(s => category.id === "all" || s.category === category.id).map((service) => {
                      const Icon = getCategoryIcon(service.category);
                      return (
                        <Card key={service.id} className="flex flex-col hover-elevate" data-testid={`card-service-${service.id}`}>
                          <CardHeader>
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                              <Icon className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                <Badge variant="secondary" className="mt-1 capitalize">
                                  {service.category}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <CardDescription className="mb-4">
                              {service.description}
                            </CardDescription>
                            {service.features && service.features.length > 0 && (
                              <ul className="space-y-1">
                                {service.features.slice(0, 4).map((feature, index) => (
                                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                          <CardFooter className="flex items-center justify-between pt-4 border-t gap-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Starting from</span>
                              <p className="text-lg font-bold text-primary">R{service.startingPrice}</p>
                            </div>
                            <Link href="/bookings">
                              <Button size="sm" data-testid={`button-book-${service.id}`}>
                                Book Now
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center" data-testid="cta-photography">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Book a Photographer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Events, portraits, products, weddings, and more.
              </p>
              <Link href="/bookings">
                <Button variant="outline" size="sm">Book Now</Button>
              </Link>
            </div>
            <div className="text-center" data-testid="cta-videography">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Book a Videographer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Corporate videos, events, social media content.
              </p>
              <Link href="/bookings">
                <Button variant="outline" size="sm">Book Now</Button>
              </Link>
            </div>
            <div className="text-center" data-testid="cta-marketing">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Megaphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Request Marketing Quote</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Social media, ads, branding, and design packages.
              </p>
              <Link href="/quote">
                <Button variant="outline" size="sm">Get Quote</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
