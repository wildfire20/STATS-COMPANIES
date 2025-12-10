import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Camera, Video, Megaphone, ArrowRight, Star, Truck, Shield, Clock, ChevronRight, Quote, Sparkles, Play, MousePointer } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Testimonial, PortfolioItem, Promotion, Product } from "@shared/schema";

const services = [
  {
    icon: Printer,
    title: "Digital Printing",
    description: "Business cards, flyers, banners, apparel, stickers, and large format printing.",
    href: "/shop",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Camera,
    title: "Photography",
    description: "Event coverage, studio shoots, corporate portraits, weddings, and product photography.",
    href: "/services?category=photography",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Video,
    title: "Videography",
    description: "Event videos, corporate films, social media content, and wedding cinematography.",
    href: "/services?category=videography",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Social media management, paid ads, content creation, and brand identity design.",
    href: "/services?category=marketing",
    gradient: "from-green-500/20 to-emerald-500/20",
  }
];

const features = [
  { icon: Truck, title: "Fast Delivery", description: "Quick turnaround on all orders" },
  { icon: Shield, title: "Quality Guaranteed", description: "Premium materials & finishes" },
  { icon: Clock, title: "24/7 Support", description: "We're here when you need us" },
];

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "150+", label: "Happy Clients" },
  { value: "5", label: "Years Experience" },
  { value: "24/7", label: "Support Available" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      
      const handleCanPlay = () => {
        video.play().catch(() => {});
      };
      
      video.addEventListener('canplay', handleCanPlay);
      
      // Also try to play if already loaded
      if (video.readyState >= 3) {
        video.play().catch(() => {});
      }
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

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
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Bold & Impactful */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-[100vh] flex items-center hero-gradient-animated overflow-hidden"
        style={{ opacity: heroOpacity }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="blob-bg w-96 h-96 bg-secondary/30 top-20 -left-20"
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="blob-bg w-80 h-80 bg-accent/20 bottom-20 right-10"
            animate={{ 
              x: [0, -25, 0],
              y: [0, 25, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="blob-bg w-64 h-64 bg-primary/20 top-1/2 left-1/3"
            animate={{ 
              x: [0, 20, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 decorative-grid opacity-5" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            style={{ scale: heroScale, y: heroY }}
          >
            <motion.div 
              className="space-y-8"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium" data-testid="badge-tagline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  You dream it, We make it
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-white leading-[1.05] tracking-tight"
                variants={fadeInUp}
                data-testid="text-hero-title"
              >
                Transform
                <span className="block text-gradient-light">Your Vision</span>
                <span className="block">Into Reality</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-white/70 max-w-xl font-light leading-relaxed"
                variants={fadeInUp}
                data-testid="text-hero-description"
              >
                Professional digital printing, photography, videography, and digital marketing services in Pretoria. Quality craftsmanship for businesses and individuals.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-4"
                variants={fadeInUp}
              >
                <Link href="/shop">
                  <Button 
                    size="lg" 
                    className="btn-premium bg-white text-primary hover:bg-white/90 shadow-xl shadow-white/10 px-8 h-14 text-base font-semibold group" 
                    data-testid="button-hero-shop"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/quote">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 h-14 text-base font-semibold" 
                    data-testid="button-hero-quote"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Get a Quote
                  </Button>
                </Link>
              </motion.div>

              {/* Stats Row */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10"
                variants={fadeInUp}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-3xl md:text-4xl font-display font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/50 mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative">
                {/* Decorative rings */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-white/10"
                  style={{ transform: 'scale(1.2)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-0 rounded-full border border-white/5"
                  style={{ transform: 'scale(1.4)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Hero video with glow effect */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-accent/40 rounded-2xl blur-3xl" />
                  <video 
                    ref={videoRef}
                    src="/api/hero-video" 
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative h-72 md:h-80 lg:h-96 w-auto rounded-2xl float-animation drop-shadow-2xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    data-testid="video-hero"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MousePointer className="w-6 h-6 text-white/40" />
        </motion.div>
      </motion.section>

      {/* Features Strip */}
      <motion.section 
        className="relative -mt-16 z-20 mx-4 md:mx-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto">
          <div className="glass-card p-2 md:p-3">
            <div className="grid md:grid-cols-3 gap-2">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-4 p-4 md:p-6 rounded-xl hover-elevate bg-white/50 dark:bg-white/5 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  data-testid={`feature-${index}`}
                >
                  <div className="icon-container flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary dark:text-accent" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-foreground">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Promotions Section */}
      {promotions && promotions.length > 0 && (
        <motion.section 
          className="py-24 bg-muted/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">Limited Time</Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold">
                  Deals of the
                  <span className="text-gradient ml-2">Month</span>
                </h2>
              </div>
              <Link href="/promotions">
                <Button variant="ghost" className="gap-2 group" data-testid="link-view-all-promos">
                  View All Deals
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotions.slice(0, 4).map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-500 h-full" data-testid={`card-promo-${promo.id}`}>
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/15 flex items-center justify-center relative overflow-hidden">
                      {promo.image ? (
                        <img 
                          src={promo.image} 
                          alt={promo.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {promo.discount && (
                        <span className="discount-badge shimmer">{promo.discount}</span>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="font-display font-bold text-xl">{promo.title}</div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{promo.description}</p>
                      <Link href="/quote">
                        <Button variant="ghost" className="p-0 h-auto text-secondary hover:text-secondary/80 font-semibold group/btn">
                          Claim Offer
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Services Section */}
      <motion.section 
        className="py-24 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-muted/50 to-transparent -z-10" />
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">What We Do</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6" data-testid="text-services-title">
              Our <span className="text-gradient">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From stunning prints to captivating visuals, we offer comprehensive creative services to elevate your brand and bring your ideas to life.
            </p>
            <div className="section-divider mt-8" />
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={service.href}>
                  <Card 
                    className="h-full cursor-pointer group border-0 shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden" 
                    data-testid={`card-service-${index}`}
                  >
                    <CardHeader className="pb-4 relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <motion.div 
                        className="icon-container-lg mx-auto mb-4 relative z-10"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <service.icon className="h-8 w-8 text-primary dark:text-accent" />
                      </motion.div>
                      <CardTitle className="text-xl font-display text-center relative z-10">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center relative z-10">
                      <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                      <div className="mt-4 flex items-center justify-center text-secondary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        Learn More <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Products Section */}
      <motion.section 
        className="py-24 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">Shop</Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold">
                Popular
                <span className="text-gradient ml-2">Products</span>
              </h2>
            </div>
            <Link href="/shop">
              <Button variant="ghost" className="gap-2 group" data-testid="link-view-all-products">
                View All Products
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
          
          {productsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href="/shop">
                    <Card className="overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500" data-testid={`card-product-${product.id}`}>
                      <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center relative overflow-hidden img-hover-zoom">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            data-testid={`img-product-${product.id}`}
                          />
                        ) : (
                          <Printer className="h-20 w-20 text-primary/20" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
                        <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-display font-bold text-primary">From R{product.basePrice}</span>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <motion.section 
          className="py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">Testimonials</Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
                What Our <span className="text-gradient">Clients Say</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Trusted by businesses and individuals across South Africa
              </p>
              <div className="section-divider mt-8" />
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonialsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))
              ) : (
                testimonials.slice(0, 3).map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="relative h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500" data-testid={`card-testimonial-${testimonial.id}`}>
                      <CardContent className="pt-8 pb-6">
                        <Quote className="h-10 w-10 text-primary/10 absolute top-4 right-4" />
                        <div className="flex mb-4">
                          {Array(testimonial.rating || 5).fill(0).map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-muted-foreground mb-6 line-clamp-4 leading-relaxed italic">
                          "{testimonial.content}"
                        </p>
                        <div className="pt-4 border-t border-border/50">
                          <div className="font-display font-semibold text-lg">{testimonial.name}</div>
                          {testimonial.company && (
                            <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <motion.section 
        className="py-32 hero-gradient relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 decorative-dots opacity-10" />
        <motion.div 
          className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Ready to Start
              <span className="block text-gradient-light">Your Project?</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Get in touch with us today and let's bring your vision to life. From printing to photography, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button 
                  size="lg" 
                  className="btn-premium bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 px-10 h-14 text-base font-semibold"
                  data-testid="button-cta-quote"
                >
                  Request a Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/bookings">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10 h-14 text-base font-semibold" 
                  data-testid="button-cta-book"
                >
                  Book a Session
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
