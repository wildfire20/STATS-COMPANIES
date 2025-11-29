import { 
  type User, type InsertUser,
  type Product, type InsertProduct, type ProductOption,
  type Service, type InsertService,
  type PortfolioItem, type InsertPortfolioItem,
  type Booking, type InsertBooking,
  type Order, type InsertOrder, type OrderItem,
  type QuoteRequest, type InsertQuoteRequest,
  type Promotion, type InsertPromotion,
  type Testimonial, type InsertTestimonial,
  type TeamMember, type InsertTeamMember,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  getServicesByCategory(category: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  getPortfolioItems(): Promise<PortfolioItem[]>;
  getPortfolioItem(id: string): Promise<PortfolioItem | undefined>;
  getPortfolioItemsByCategory(category: string): Promise<PortfolioItem[]>;
  getFeaturedPortfolioItems(): Promise<PortfolioItem[]>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  getQuoteRequests(): Promise<QuoteRequest[]>;
  createQuoteRequest(quote: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequestStatus(id: string, status: string): Promise<QuoteRequest | undefined>;
  
  getPromotions(): Promise<Promotion[]>;
  getActivePromotions(): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  
  getTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  getTeamMembers(): Promise<TeamMember[]>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private services: Map<string, Service>;
  private portfolioItems: Map<string, PortfolioItem>;
  private bookings: Map<string, Booking>;
  private orders: Map<string, Order>;
  private quoteRequests: Map<string, QuoteRequest>;
  private promotions: Map<string, Promotion>;
  private testimonials: Map<string, Testimonial>;
  private teamMembers: Map<string, TeamMember>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.services = new Map();
    this.portfolioItems = new Map();
    this.bookings = new Map();
    this.orders = new Map();
    this.quoteRequests = new Map();
    this.promotions = new Map();
    this.testimonials = new Map();
    this.teamMembers = new Map();
    
    this.seedData();
  }

  private seedData() {
    const productData: Array<{
      name: string;
      description: string;
      category: string;
      basePrice: string;
      image: string | null;
      options: ProductOption[] | null;
      isActive: boolean | null;
    }> = [
      {
        name: "Business Cards",
        description: "Premium quality business cards with various finishes. Make a lasting impression with professionally printed cards.",
        category: "printing",
        basePrice: "150.00",
        image: null,
        options: [
          { name: "Quantity", type: "select", values: [
            { label: "100 cards", price: 0 },
            { label: "250 cards", price: 80 },
            { label: "500 cards", price: 150 },
            { label: "1000 cards", price: 250 }
          ]},
          { name: "Finish", type: "select", values: [
            { label: "Matte", price: 0 },
            { label: "Glossy", price: 30 },
            { label: "Soft Touch", price: 50 }
          ]},
          { name: "Print Sides", type: "select", values: [
            { label: "Single Sided", price: 0 },
            { label: "Double Sided", price: 40 }
          ]}
        ],
        isActive: true
      },
      {
        name: "Flyers & Brochures",
        description: "Eye-catching flyers and brochures for your marketing campaigns. Available in multiple sizes and paper types.",
        category: "printing",
        basePrice: "200.00",
        image: null,
        options: [
          { name: "Size", type: "select", values: [
            { label: "A5", price: 0 },
            { label: "A4", price: 50 },
            { label: "A3", price: 100 }
          ]},
          { name: "Quantity", type: "select", values: [
            { label: "100", price: 0 },
            { label: "250", price: 100 },
            { label: "500", price: 180 },
            { label: "1000", price: 300 }
          ]}
        ],
        isActive: true
      },
      {
        name: "Posters & Banners",
        description: "Large format printing for maximum impact. Perfect for events, advertising, and promotions.",
        category: "printing",
        basePrice: "350.00",
        image: null,
        options: [
          { name: "Size", type: "select", values: [
            { label: "A2 Poster", price: 0 },
            { label: "A1 Poster", price: 100 },
            { label: "A0 Poster", price: 200 },
            { label: "Pull-up Banner", price: 400 }
          ]},
          { name: "Material", type: "select", values: [
            { label: "Paper", price: 0 },
            { label: "Vinyl", price: 80 },
            { label: "Canvas", price: 150 }
          ]}
        ],
        isActive: true
      },
      {
        name: "T-Shirts & Apparel",
        description: "Custom branded clothing for teams, events, and promotions. High-quality prints that last.",
        category: "apparel",
        basePrice: "180.00",
        image: null,
        options: [
          { name: "Size", type: "select", values: [
            { label: "S", price: 0 },
            { label: "M", price: 0 },
            { label: "L", price: 0 },
            { label: "XL", price: 20 },
            { label: "XXL", price: 40 }
          ]},
          { name: "Quantity", type: "select", values: [
            { label: "1-10", price: 0 },
            { label: "11-25", price: -20 },
            { label: "26-50", price: -40 },
            { label: "50+", price: -60 }
          ]}
        ],
        isActive: true
      },
      {
        name: "Stickers & Labels",
        description: "Custom stickers and labels for products, packaging, and branding. Waterproof options available.",
        category: "printing",
        basePrice: "120.00",
        image: null,
        options: [
          { name: "Shape", type: "select", values: [
            { label: "Round", price: 0 },
            { label: "Square", price: 0 },
            { label: "Rectangle", price: 0 },
            { label: "Custom Die-Cut", price: 50 }
          ]},
          { name: "Quantity", type: "select", values: [
            { label: "100", price: 0 },
            { label: "250", price: 60 },
            { label: "500", price: 100 },
            { label: "1000", price: 160 }
          ]}
        ],
        isActive: true
      },
      {
        name: "Corporate Gift Items",
        description: "Branded corporate gifts including mugs, pens, notebooks, and more. Perfect for client appreciation.",
        category: "gifts",
        basePrice: "250.00",
        image: null,
        options: [
          { name: "Item Type", type: "select", values: [
            { label: "Branded Mug", price: 0 },
            { label: "Pen Set", price: -50 },
            { label: "Notebook", price: 30 },
            { label: "Gift Hamper", price: 200 }
          ]},
          { name: "Quantity", type: "select", values: [
            { label: "10", price: 0 },
            { label: "25", price: 150 },
            { label: "50", price: 280 },
            { label: "100", price: 500 }
          ]}
        ],
        isActive: true
      }
    ];

    productData.forEach(p => {
      const id = randomUUID();
      this.products.set(id, { ...p, id });
    });

    const serviceData: Array<{
      name: string;
      description: string;
      category: string;
      startingPrice: string;
      image: string | null;
      features: string[] | null;
      isActive: boolean | null;
    }> = [
      {
        name: "Event Photography",
        description: "Professional photography coverage for corporate events, conferences, and special occasions.",
        category: "photography",
        startingPrice: "2500.00",
        image: null,
        features: ["Full event coverage", "Edited high-res images", "Online gallery", "Quick turnaround"],
        isActive: true
      },
      {
        name: "Studio Photoshoots",
        description: "Professional studio sessions for portraits, products, and creative projects.",
        category: "photography",
        startingPrice: "1500.00",
        image: null,
        features: ["2-hour session", "Professional lighting", "Multiple backgrounds", "Retouched images"],
        isActive: true
      },
      {
        name: "Wedding Photography",
        description: "Capture your special day with our experienced wedding photography team.",
        category: "photography",
        startingPrice: "8000.00",
        image: null,
        features: ["Full day coverage", "Second photographer", "Engagement shoot", "Premium album"],
        isActive: true
      },
      {
        name: "Event Videography",
        description: "Professional video coverage for events, conferences, and special occasions.",
        category: "videography",
        startingPrice: "4000.00",
        image: null,
        features: ["Full HD recording", "Professional editing", "Highlight reel", "Raw footage"],
        isActive: true
      },
      {
        name: "Corporate Videos",
        description: "Company profiles, training videos, and promotional content for your business.",
        category: "videography",
        startingPrice: "6000.00",
        image: null,
        features: ["Script development", "Professional crew", "Voiceover", "Motion graphics"],
        isActive: true
      },
      {
        name: "Social Media Videos",
        description: "Short-form content optimized for social media platforms.",
        category: "videography",
        startingPrice: "2000.00",
        image: null,
        features: ["Platform-optimized", "Quick turnaround", "Trending formats", "Subtitles"],
        isActive: true
      },
      {
        name: "Social Media Management",
        description: "Complete social media management including content creation and scheduling.",
        category: "marketing",
        startingPrice: "3500.00",
        image: null,
        features: ["Content calendar", "Daily posting", "Engagement", "Monthly reports"],
        isActive: true
      },
      {
        name: "Paid Advertising",
        description: "Google Ads and Facebook/Instagram advertising campaigns.",
        category: "marketing",
        startingPrice: "2500.00",
        image: null,
        features: ["Campaign setup", "Ad creative", "Targeting", "Optimization"],
        isActive: true
      },
      {
        name: "Brand Identity Design",
        description: "Complete brand identity including logo, colors, and brand guidelines.",
        category: "marketing",
        startingPrice: "5000.00",
        image: null,
        features: ["Logo design", "Color palette", "Typography", "Brand guidelines"],
        isActive: true
      }
    ];

    serviceData.forEach(s => {
      const id = randomUUID();
      this.services.set(id, { ...s, id });
    });

    const testimonialData: Array<{
      name: string;
      company: string | null;
      content: string;
      rating: number;
      image: string | null;
      featured: boolean | null;
    }> = [
      {
        name: "Sarah Mokwena",
        company: "Tech Solutions SA",
        content: "STATS Companies delivered exceptional quality on our corporate branding project. Their attention to detail and creative approach exceeded our expectations.",
        rating: 5,
        image: null,
        featured: true
      },
      {
        name: "David Naidoo",
        company: "Urban Events",
        content: "The videography team captured our product launch perfectly. Professional, creative, and delivered on time. Highly recommend!",
        rating: 5,
        image: null,
        featured: true
      },
      {
        name: "Thandi Zulu",
        company: "Bloom Boutique",
        content: "Our wedding photos and video are absolutely stunning. The team made us feel comfortable and the results speak for themselves.",
        rating: 5,
        image: null,
        featured: true
      }
    ];

    testimonialData.forEach(t => {
      const id = randomUUID();
      this.testimonials.set(id, { ...t, id });
    });

    const teamData: Array<{
      name: string;
      role: string;
      bio: string | null;
      image: string | null;
      experience: string | null;
      order: number | null;
    }> = [
      {
        name: "Khumo Sepeng",
        role: "Creative Director & Print Specialist",
        bio: "With 10 years of graphic design experience and 8 years as a printing machine operator, Khumo leads our creative vision and ensures the highest print quality.",
        image: null,
        experience: "10 years in graphic design, 8 years in printing",
        order: 1
      },
      {
        name: "Justin Mwenge",
        role: "Head of Photography & Videography",
        bio: "Justin brings 7 years of photography and videography expertise, along with 6 years of graphic design skills, to capture stunning visuals for our clients.",
        image: null,
        experience: "7 years in photography and videography, 6 years in graphic design",
        order: 2
      },
      {
        name: "Nomathemba Sepeng",
        role: "Marketing & PR Director",
        bio: "With 8 years in public relations and 7 years in marketing management, Nomathemba drives our marketing strategies and client relationships.",
        image: null,
        experience: "8 years in public relations, 7 years in marketing management",
        order: 3
      }
    ];

    teamData.forEach(m => {
      const id = randomUUID();
      this.teamMembers.set(id, { ...m, id });
    });

    const promotionData: Array<{
      title: string;
      description: string;
      discount: string | null;
      validUntil: string | null;
      image: string | null;
      isActive: boolean | null;
    }> = [
      {
        title: "Wedding Season Special",
        description: "Book your wedding photography and videography package and get 15% off plus a free engagement shoot.",
        discount: "15% off + Free Engagement Shoot",
        validUntil: "2025-03-31",
        image: null,
        isActive: true
      },
      {
        title: "Business Starter Pack",
        description: "Get 500 business cards, letterhead design, and a logo refresh for one amazing price.",
        discount: "Save R500",
        validUntil: "2025-02-28",
        image: null,
        isActive: true
      }
    ];

    promotionData.forEach(p => {
      const id = randomUUID();
      this.promotions.set(id, { ...p, id });
    });

    const portfolioData: Array<{
      title: string;
      description: string | null;
      category: string;
      type: string;
      mediaUrl: string;
      thumbnailUrl: string | null;
      client: string | null;
      date: string | null;
      featured: boolean | null;
    }> = [
      { title: "Corporate Branding Project", description: "Full brand identity for tech company", category: "design", type: "image", mediaUrl: "/api/placeholder/600/400", thumbnailUrl: null, client: "Tech Solutions SA", date: "2024", featured: true },
      { title: "Wedding Highlight Film", description: "Beautiful wedding videography", category: "videography", type: "video", mediaUrl: "/api/placeholder/600/400", thumbnailUrl: null, client: "Private Client", date: "2024", featured: true },
      { title: "Product Photography", description: "E-commerce product shots", category: "photography", type: "image", mediaUrl: "/api/placeholder/600/400", thumbnailUrl: null, client: "Bloom Boutique", date: "2024", featured: true },
      { title: "Event Coverage", description: "Corporate event photography", category: "photography", type: "image", mediaUrl: "/api/placeholder/600/400", thumbnailUrl: null, client: "Urban Events", date: "2024", featured: false },
      { title: "Social Media Campaign", description: "Restaurant social media content", category: "marketing", type: "image", mediaUrl: "/api/placeholder/600/400", thumbnailUrl: null, client: "Local Restaurant", date: "2024", featured: false },
      { title: "Large Format Banner", description: "Exhibition banner design and print", category: "printing", type: "image", mediaUrl: "/api/placeholder/600/400", thumbnailUrl: null, client: "Corporate Client", date: "2024", featured: true }
    ];

    portfolioData.forEach(p => {
      const id = randomUUID();
      this.portfolioItems.set(id, { ...p, id });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      phone: insertUser.phone ?? null,
      role: insertUser.role ?? "customer",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category && p.isActive);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      category: insertProduct.category,
      basePrice: insertProduct.basePrice,
      image: insertProduct.image ?? null,
      options: (insertProduct.options as ProductOption[] | undefined) ?? null,
      isActive: insertProduct.isActive ?? true
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated: Product = { 
      ...product, 
      ...updates,
      options: updates.options !== undefined ? (updates.options as ProductOption[] | undefined) ?? null : product.options
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.isActive);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.category === category && s.isActive);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { 
      id,
      name: insertService.name,
      description: insertService.description,
      category: insertService.category,
      startingPrice: insertService.startingPrice,
      image: insertService.image ?? null,
      features: insertService.features ?? null,
      isActive: insertService.isActive ?? true
    };
    this.services.set(id, service);
    return service;
  }

  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values());
  }

  async getPortfolioItem(id: string): Promise<PortfolioItem | undefined> {
    return this.portfolioItems.get(id);
  }

  async getPortfolioItemsByCategory(category: string): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).filter(p => p.category === category);
  }

  async getFeaturedPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).filter(p => p.featured);
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = randomUUID();
    const portfolioItem: PortfolioItem = { 
      id,
      title: item.title,
      description: item.description ?? null,
      category: item.category,
      type: item.type,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl ?? null,
      client: item.client ?? null,
      date: item.date ?? null,
      featured: item.featured ?? false
    };
    this.portfolioItems.set(id, portfolioItem);
    return portfolioItem;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.userId === userId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      id,
      userId: insertBooking.userId ?? null,
      serviceId: insertBooking.serviceId ?? null,
      serviceName: insertBooking.serviceName,
      name: insertBooking.name,
      email: insertBooking.email,
      phone: insertBooking.phone,
      date: insertBooking.date,
      time: insertBooking.time,
      notes: insertBooking.notes ?? null,
      status: insertBooking.status ?? "pending",
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    const updated = { ...booking, status };
    this.bookings.set(id, updated);
    return updated;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      id,
      userId: insertOrder.userId ?? null,
      customerName: insertOrder.customerName,
      customerEmail: insertOrder.customerEmail,
      customerPhone: insertOrder.customerPhone ?? null,
      items: insertOrder.items as OrderItem[],
      subtotal: insertOrder.subtotal,
      deliveryFee: insertOrder.deliveryFee ?? "0",
      total: insertOrder.total,
      deliveryMethod: insertOrder.deliveryMethod,
      deliveryAddress: insertOrder.deliveryAddress ?? null,
      status: insertOrder.status ?? "pending",
      paymentStatus: insertOrder.paymentStatus ?? "pending",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values());
  }

  async createQuoteRequest(insertQuote: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = randomUUID();
    const quote: QuoteRequest = { 
      id,
      name: insertQuote.name,
      email: insertQuote.email,
      phone: insertQuote.phone,
      company: insertQuote.company ?? null,
      serviceType: insertQuote.serviceType,
      projectDescription: insertQuote.projectDescription,
      budget: insertQuote.budget ?? null,
      timeline: insertQuote.timeline ?? null,
      status: insertQuote.status ?? "new",
      createdAt: new Date()
    };
    this.quoteRequests.set(id, quote);
    return quote;
  }

  async updateQuoteRequestStatus(id: string, status: string): Promise<QuoteRequest | undefined> {
    const quote = this.quoteRequests.get(id);
    if (!quote) return undefined;
    const updated = { ...quote, status };
    this.quoteRequests.set(id, updated);
    return updated;
  }

  async getPromotions(): Promise<Promotion[]> {
    return Array.from(this.promotions.values());
  }

  async getActivePromotions(): Promise<Promotion[]> {
    return Array.from(this.promotions.values()).filter(p => p.isActive);
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const id = randomUUID();
    const promotion: Promotion = { 
      id,
      title: insertPromotion.title,
      description: insertPromotion.description,
      discount: insertPromotion.discount ?? null,
      validUntil: insertPromotion.validUntil ?? null,
      image: insertPromotion.image ?? null,
      isActive: insertPromotion.isActive ?? true
    };
    this.promotions.set(id, promotion);
    return promotion;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(t => t.featured);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = randomUUID();
    const testimonial: Testimonial = { 
      id,
      name: insertTestimonial.name,
      company: insertTestimonial.company ?? null,
      content: insertTestimonial.content,
      rating: insertTestimonial.rating ?? 5,
      image: insertTestimonial.image ?? null,
      featured: insertTestimonial.featured ?? false
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async createTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const member: TeamMember = { 
      id,
      name: insertMember.name,
      role: insertMember.role,
      bio: insertMember.bio ?? null,
      image: insertMember.image ?? null,
      experience: insertMember.experience ?? null,
      order: insertMember.order ?? 0
    };
    this.teamMembers.set(id, member);
    return member;
  }
}

export const storage = new MemStorage();
