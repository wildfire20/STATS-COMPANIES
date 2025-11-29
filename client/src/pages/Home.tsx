import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Camera, Video, Megaphone, ArrowRight, Star, CheckCircle } from "lucide-react";
import type { Service, Testimonial, PortfolioItem, Promotion } from "@shared/schema";

const services = [
  {
    icon: Printer,
    title: "Digital Printing",
    description: "Business cards, flyers, banners, apparel, stickers, and large format printing.",
    href: "/shop",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  {
    icon: Camera,
    title: "Photography",
    description: "Event coverage, studio shoots, corporate portraits, weddings, and product photography.",
    href: "/services?category=photography",
    color: "bg-green-500/10 text-green-600 dark:text-green-400"
  },
  {
    icon: Video,
    title: "Videography",
    description: "Event videos, corporate films, social media content, and wedding cinematography.",
    href: "/services?category=videography",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Social media management, paid ads, content creation, and brand identity design.",
    href: "/services?category=marketing",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
  }
];

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "200+", label: "Happy Clients" },
  { value: "5+", label: "Years Experience" },
  { value: "4", label: "Services" }
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

  return (
    <div className="flex flex-col">
      <section className="relative hero-gradient text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4" data-testid="badge-tagline">
              You dream it, We make it
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
              Transform Your Vision Into Reality
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto" data-testid="text-hero-description">
              Professional digital printing, photography, videography, and digital marketing services in Pretoria. Quality craftsmanship for businesses and individuals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/shop">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto" data-testid="button-hero-shop">
                  Shop Printing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/bookings">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 hover:bg-white/20 text-white" data-testid="button-hero-book">
                  Book a Session
                </Button>
              </Link>
              <Link href="/quote">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/30 hover:bg-white/20 text-white" data-testid="button-hero-quote">
                  Request Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-services-title">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From stunning prints to captivating visuals, we offer comprehensive creative services to elevate your brand.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card className="h-full hover-elevate cursor-pointer group" data-testid={`card-service-${index}`}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-md flex items-center justify-center mb-4 ${service.color}`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                    <div className="mt-4 text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {promotions && promotions.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-promotions-title">Current Promotions</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {promotions.map((promo) => (
                <Card key={promo.id} className="border-primary/20" data-testid={`card-promo-${promo.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">{promo.title}</CardTitle>
                        <CardDescription className="mt-2">{promo.description}</CardDescription>
                      </div>
                      {promo.discount && (
                        <Badge variant="default" className="whitespace-nowrap">{promo.discount}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {promo.validUntil && (
                      <p className="text-sm text-muted-foreground">Valid until: {new Date(promo.validUntil).toLocaleDateString()}</p>
                    )}
                    <Link href="/quote">
                      <Button className="mt-4" size="sm">Claim Offer</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-portfolio-title">Featured Work</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A glimpse of our recent projects across printing, photography, videography, and marketing.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-md" />
              ))
            ) : portfolio?.slice(0, 6).map((item) => (
              <Card key={item.id} className="overflow-hidden group hover-elevate" data-testid={`card-portfolio-${item.id}`}>
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-muted-foreground/20">
                      {item.type === "video" ? <Video className="h-12 w-12" /> : <Camera className="h-12 w-12" />}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    {item.client && <span className="text-sm text-muted-foreground">{item.client}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/portfolio">
              <Button variant="outline" data-testid="button-view-portfolio">
                View Full Portfolio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-testimonials-title">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied clients.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonialsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-md" />
              ))
            ) : testimonials?.map((testimonial) => (
              <Card key={testimonial.id} data-testid={`card-testimonial-${testimonial.id}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array(testimonial.rating).fill(0).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      {testimonial.company && (
                        <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose STATS Companies?</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Quality First", desc: "Premium materials and professional execution on every project." },
              { title: "Fast Turnaround", desc: "Efficient delivery without compromising on quality." },
              { title: "Creative Experts", desc: "A team of experienced designers, photographers, and marketers." },
              { title: "Fair Pricing", desc: "Competitive rates with transparent pricing, no hidden costs." }
            ].map((item, index) => (
              <div key={index} className="text-center" data-testid={`feature-${index}`}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Whether you need printing, photography, videography, or marketing services, we're here to help bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" variant="secondary" data-testid="button-cta-quote">
                Request a Quote
              </Button>
            </Link>
            <Link href="/bookings">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white" data-testid="button-cta-book">
                Book a Session
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
