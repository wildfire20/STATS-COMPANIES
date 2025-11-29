import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Camera, Video, Megaphone, ArrowRight, Star, Truck, Shield, Clock, ChevronRight, Quote } from "lucide-react";
import type { Testimonial, PortfolioItem, Promotion, Product } from "@shared/schema";
import logoImage from "@assets/states company logo_1764435536382.jpg";

const services = [
  {
    icon: Printer,
    title: "Digital Printing",
    description: "Business cards, flyers, banners, apparel, stickers, and large format printing.",
    href: "/shop",
  },
  {
    icon: Camera,
    title: "Photography",
    description: "Event coverage, studio shoots, corporate portraits, weddings, and product photography.",
    href: "/services?category=photography",
  },
  {
    icon: Video,
    title: "Videography",
    description: "Event videos, corporate films, social media content, and wedding cinematography.",
    href: "/services?category=videography",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Social media management, paid ads, content creation, and brand identity design.",
    href: "/services?category=marketing",
  }
];

const features = [
  { icon: Truck, title: "Fast Delivery", description: "Quick turnaround on all orders" },
  { icon: Shield, title: "Quality Guaranteed", description: "Premium materials & finishes" },
  { icon: Clock, title: "24/7 Support", description: "We're here when you need us" },
];

export default function Home() {
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials?featured=true"],
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio?featured=true"],
  });

  const { data: promotions, isLoading: promotionsLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="flex flex-col">
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-secondary text-white" data-testid="badge-tagline">
                You dream it, We make it
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary dark:text-white leading-tight" data-testid="text-hero-title">
                Transform Your Vision Into Reality
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl" data-testid="text-hero-description">
                Professional digital printing, photography, videography, and digital marketing services in Pretoria. Quality craftsmanship for businesses and individuals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/shop">
                  <Button size="lg" className="w-full sm:w-auto" data-testid="button-hero-shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/quote">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-hero-quote">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-3xl" />
                <img 
                  src={logoImage} 
                  alt="STATS Companies" 
                  className="relative h-64 md:h-80 lg:h-96 w-auto"
                  data-testid="img-hero-logo"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-white dark:bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-border">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 px-4 md:px-8 py-2" data-testid={`feature-${index}`}>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{feature.title}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {promotions && promotions.length > 0 && (
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Deals of the Month</h2>
              <Link href="/promotions">
                <Button variant="ghost" className="gap-1" data-testid="link-view-all-promos">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotions.slice(0, 4).map((promo) => (
                <Card key={promo.id} className="overflow-hidden hover-elevate group" data-testid={`card-promo-${promo.id}`}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center relative">
                    {promo.discount && (
                      <span className="discount-badge">{promo.discount}</span>
                    )}
                    <div className="text-center p-4">
                      <div className="font-bold text-lg text-primary dark:text-white">{promo.title}</div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                    <Link href="/quote">
                      <Button variant="ghost" className="p-0 h-auto mt-2 text-secondary hover:text-secondary/80">
                        Claim Offer
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-services-title">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From stunning prints to captivating visuals, we offer comprehensive creative services to elevate your brand.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card className="h-full hover-elevate cursor-pointer group text-center" data-testid={`card-service-${index}`}>
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <service.icon className="h-7 w-7 text-primary dark:text-white" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Products</h2>
            <Link href="/shop">
              <Button variant="ghost" className="gap-1" data-testid="link-view-all-products">
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {productsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.slice(0, 4).map((product) => (
                <Link key={product.id} href="/shop">
                  <Card className="overflow-hidden hover-elevate group cursor-pointer" data-testid={`card-product-${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative">
                      <Printer className="h-16 w-16 text-primary/30" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">From R{product.basePrice}</span>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {testimonials && testimonials.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-muted-foreground">Trusted by businesses and individuals across South Africa</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonialsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-md" />
                ))
              ) : (
                testimonials.slice(0, 3).map((testimonial) => (
                  <Card key={testimonial.id} className="relative" data-testid={`card-testimonial-${testimonial.id}`}>
                    <CardContent className="pt-6">
                      <Quote className="h-8 w-8 text-secondary/20 absolute top-4 right-4" />
                      <div className="flex mb-3">
                        {Array(testimonial.rating || 5).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-4">"{testimonial.content}"</p>
                      <div className="pt-4 border-t">
                        <div className="font-semibold">{testimonial.name}</div>
                        {testimonial.company && (
                          <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Get in touch with us today and let's bring your vision to life. From printing to photography, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" variant="secondary" data-testid="button-cta-quote">
                Request a Quote
              </Button>
            </Link>
            <Link href="/bookings">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-cta-book">
                Book a Session
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
