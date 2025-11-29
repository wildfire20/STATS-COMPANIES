import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Video, Megaphone, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Service } from "@shared/schema";

const serviceCategories = [
  { id: "all", name: "All Services", icon: null },
  { id: "photography", name: "Photography", icon: Camera },
  { id: "videography", name: "Videography", icon: Video },
  { id: "marketing", name: "Digital Marketing", icon: Megaphone },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

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
              Our Services
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight" data-testid="text-services-title">
              Media & Marketing
              <span className="block text-gradient-light">Services</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Professional photography, videography, and digital marketing services to elevate your brand and capture your most important moments.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <motion.div 
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <TabsList className="grid grid-cols-4 w-full max-w-2xl h-auto p-1.5 bg-muted/50 rounded-2xl">
                {serviceCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="rounded-xl py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all font-medium"
                    data-testid={`tab-${category.id}`}
                  >
                    {category.icon && <category.icon className="h-4 w-4 mr-2 hidden sm:block" />}
                    <span className="text-xs sm:text-sm">{category.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            {serviceCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array(6).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-96 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services?.filter(s => category.id === "all" || s.category === category.id).map((service, index) => {
                      const Icon = getCategoryIcon(service.category);
                      return (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="flex flex-col h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group" data-testid={`card-service-${service.id}`}>
                            <CardHeader className="p-0">
                              <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center overflow-hidden img-hover-zoom">
                                {service.image ? (
                                  <img 
                                    src={service.image} 
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                    data-testid={`img-service-${service.id}`}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                                    <Icon className="h-16 w-16" />
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6">
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                  <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">{service.name}</CardTitle>
                                  <Badge variant="secondary" className="mt-2 capitalize text-xs">
                                    {service.category}
                                  </Badge>
                                </div>
                              </div>
                              <CardDescription className="mb-5 line-clamp-2">
                                {service.description}
                              </CardDescription>
                              {service.features && service.features.length > 0 && (
                                <ul className="space-y-2">
                                  {service.features.slice(0, 4).map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </CardContent>
                            <CardFooter className="flex items-center justify-between p-6 pt-0 gap-4">
                              <div>
                                <span className="text-xs text-muted-foreground">Starting from</span>
                                <p className="text-2xl font-display font-bold text-primary">R{service.startingPrice}</p>
                              </div>
                              <Link href="/bookings">
                                <Button className="btn-premium rounded-full px-6" data-testid={`button-book-${service.id}`}>
                                  Book Now
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-24 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Get <span className="text-gradient">Started?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose a service and book your session today
            </p>
            <div className="section-divider mt-6" />
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Camera, title: "Book a Photographer", description: "Events, portraits, products, weddings, and more.", href: "/bookings" },
              { icon: Video, title: "Book a Videographer", description: "Corporate videos, events, social media content.", href: "/bookings" },
              { icon: Megaphone, title: "Request Marketing Quote", description: "Social media, ads, branding, and design packages.", href: "/quote" },
            ].map((cta, index) => (
              <motion.div
                key={cta.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                data-testid={`cta-${cta.title.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="icon-container-lg mx-auto mb-6">
                  <cta.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-3">{cta.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {cta.description}
                </p>
                <Link href={cta.href}>
                  <Button variant="outline" className="rounded-full px-6">
                    {cta.href === "/quote" ? "Get Quote" : "Book Now"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
