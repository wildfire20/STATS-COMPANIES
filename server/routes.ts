import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { 
  insertBookingSchema, 
  insertQuoteRequestSchema, 
  insertOrderSchema,
  insertProductSchema,
  insertServiceSchema,
  insertPromotionSchema,
  insertPortfolioItemSchema,
  insertTestimonialSchema,
  insertTeamMemberSchema
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import multer from "multer";
import { randomUUID } from "crypto";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedAdminUser() {
  const existingAdmin = await storage.getUserByEmail("admin@statscompanies.co.za");
  if (!existingAdmin) {
    await storage.createLocalUser(
      "admin@statscompanies.co.za",
      hashPassword("Admin@123"),
      "Admin",
      "User",
      "admin"
    );
    console.log("Example admin account created: admin@statscompanies.co.za / Admin@123");
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<void> {
  await setupAuth(app);
  
  await seedAdminUser();

  app.post('/api/auth/local/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).localAuth = true;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/local/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = hashPassword(password);
      const user = await storage.createLocalUser(email, hashedPassword, firstName, lastName);
      
      (req.session as any).userId = user.id;
      (req.session as any).localAuth = true;

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/local/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post('/api/auth/check-email', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      res.json({ exists: !!user });
    } catch (error) {
      console.error("Email check error:", error);
      res.json({ exists: false });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if ((req.session as any)?.localAuth && (req.session as any)?.userId) {
        const user = await storage.getUser((req.session as any).userId);
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        }
      }
      
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Image upload endpoint
  app.post('/api/upload', isAdmin, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        return res.status(500).json({ error: 'Object storage not configured' });
      }

      const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
      const fileName = `${randomUUID()}.${fileExtension}`;
      const objectPath = `public/uploads/${fileName}`;

      const bucket = objectStorageClient.bucket(bucketId);
      const file = bucket.file(objectPath);

      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      await file.setMetadata({
        metadata: {
          'custom:aclPolicy': JSON.stringify({
            owner: 'admin',
            visibility: 'public',
          }),
        },
      });

      const imageUrl = `/api/images/${fileName}`;
      res.json({ url: imageUrl, fileName });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  // Serve uploaded images
  app.get('/api/images/:fileName', async (req, res) => {
    try {
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        return res.status(500).json({ error: 'Object storage not configured' });
      }

      const bucket = objectStorageClient.bucket(bucketId);
      const file = bucket.file(`public/uploads/${req.params.fileName}`);

      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ error: 'Image not found' });
      }

      const [metadata] = await file.getMetadata();
      res.set({
        'Content-Type': metadata.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      });

      file.createReadStream().pipe(res);
    } catch (error) {
      console.error('Image fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const products = category 
        ? await storage.getProductsByCategory(category)
        : await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/services", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const services = category 
        ? await storage.getServicesByCategory(category)
        : await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.get("/api/portfolio", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const featured = req.query.featured === "true";
      
      let items;
      if (featured) {
        items = await storage.getFeaturedPortfolioItems();
      } else if (category) {
        items = await storage.getPortfolioItemsByCategory(category);
      } else {
        items = await storage.getPortfolioItems();
      }
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio items" });
    }
  });

  app.get("/api/testimonials", async (req, res) => {
    try {
      const featured = req.query.featured === "true";
      const testimonials = featured 
        ? await storage.getFeaturedTestimonials()
        : await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/team", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/promotions", async (req, res) => {
    try {
      const active = req.query.active !== "false";
      const promotions = active 
        ? await storage.getActivePromotions()
        : await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const data = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const data = insertQuoteRequestSchema.parse(req.body);
      const quote = await storage.createQuoteRequest(data);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid quote data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create quote request" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [orders, bookings, quotes, products, services] = await Promise.all([
        storage.getOrders(),
        storage.getBookings(),
        storage.getQuoteRequests(),
        storage.getAllProducts(),
        storage.getAllServices(),
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const newQuotes = quotes.filter(q => q.status === 'new').length;

      res.json({
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
        totalBookings: bookings.length,
        pendingBookings,
        totalQuotes: quotes.length,
        newQuotes,
        totalProducts: products.length,
        totalServices: services.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/admin/services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertServiceSchema.parse(req.body);
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid service data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  app.get("/api/admin/promotions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.post("/api/admin/promotions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertPromotionSchema.parse(req.body);
      const promotion = await storage.createPromotion(data);
      res.status(201).json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid promotion data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create promotion" });
    }
  });

  app.put("/api/admin/promotions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const promotion = await storage.updatePromotion(req.params.id, req.body);
      if (!promotion) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json(promotion);
    } catch (error) {
      res.status(500).json({ error: "Failed to update promotion" });
    }
  });

  app.delete("/api/admin/promotions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePromotion(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promotion" });
    }
  });

  app.get("/api/admin/portfolio", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const items = await storage.getPortfolioItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio items" });
    }
  });

  app.post("/api/admin/portfolio", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertPortfolioItemSchema.parse(req.body);
      const item = await storage.createPortfolioItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid portfolio data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create portfolio item" });
    }
  });

  app.put("/api/admin/portfolio/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const item = await storage.updatePortfolioItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update portfolio item" });
    }
  });

  app.delete("/api/admin/portfolio/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePortfolioItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete portfolio item" });
    }
  });

  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.put("/api/admin/orders/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status, paymentStatus } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status, paymentStatus);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.delete("/api/admin/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteOrder(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  app.get("/api/admin/bookings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.put("/api/admin/bookings/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  app.delete("/api/admin/bookings/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteBooking(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  app.get("/api/admin/quotes", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quotes = await storage.getQuoteRequests();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.put("/api/admin/quotes/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const quote = await storage.updateQuoteRequestStatus(req.params.id, status);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quote status" });
    }
  });

  app.delete("/api/admin/quotes/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteQuoteRequest(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quote" });
    }
  });

  app.get("/api/admin/testimonials", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/admin/testimonials", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(data);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid testimonial data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  app.put("/api/admin/testimonials/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const testimonial = await storage.updateTestimonial(req.params.id, req.body);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTestimonial(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  app.get("/api/admin/team", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/admin/team", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(data);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid team member data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.put("/api/admin/team/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const member = await storage.updateTeamMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/admin/team/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteTeamMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Payment settings routes (admin)
  app.get("/api/admin/payment-settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment settings" });
    }
  });

  app.get("/api/admin/payment-settings/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const setting = await storage.getPaymentSetting(req.params.id);
      if (!setting) {
        return res.status(404).json({ error: "Payment setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment setting" });
    }
  });

  app.post("/api/admin/payment-settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const setting = await storage.createPaymentSetting(req.body);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Create payment setting error:", error);
      res.status(500).json({ error: "Failed to create payment setting" });
    }
  });

  app.put("/api/admin/payment-settings/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const setting = await storage.updatePaymentSetting(req.params.id, req.body);
      if (!setting) {
        return res.status(404).json({ error: "Payment setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment setting" });
    }
  });

  app.delete("/api/admin/payment-settings/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePaymentSetting(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete payment setting" });
    }
  });

  // Public endpoint for checkout to get active payment methods
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const settings = await storage.getActivePaymentSettings();
      // Only return safe fields for public consumption
      const publicMethods = settings.map(s => ({
        id: s.id,
        methodType: s.methodType,
        name: s.name,
        description: s.description,
        instructions: s.instructions,
        bankName: s.bankName,
        accountName: s.accountName,
        accountNumber: s.accountNumber,
        branchCode: s.branchCode,
        reference: s.reference,
        processingFeeType: s.processingFeeType,
        processingFeeValue: s.processingFeeValue,
        gatewayEnabled: s.gatewayEnabled,
      }));
      res.json(publicMethods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // Stripe checkout routes
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import("./stripeClient");
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Failed to get Stripe publishable key:", error);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  app.post("/api/stripe/create-checkout-session", isAuthenticated, async (req: any, res) => {
    try {
      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();
      
      const userId = (req.session as any)?.localAuth && (req.session as any)?.userId 
        ? (req.session as any).userId 
        : req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { orderId, amount, currency = "zar" } = req.body;
      
      if (!orderId || !amount) {
        return res.status(400).json({ error: "Order ID and amount are required" });
      }
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `STATS Companies Order #${orderId}`,
                description: "Order payment",
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: user.email,
        metadata: {
          orderId,
          userId,
        },
        success_url: `${req.protocol}://${req.get("host")}/dashboard/orders/${orderId}?payment=success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout?payment=cancelled`,
      });
      
      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Stripe checkout session error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, isAdmin, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/objects/update", isAuthenticated, isAdmin, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.user?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error setting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =====================================================
  // CLIENT DASHBOARD API ROUTES
  // =====================================================

  // Helper to get authenticated user ID
  const getAuthenticatedUserId = (req: any): string | null => {
    if ((req.session as any)?.localAuth && (req.session as any)?.userId) {
      return (req.session as any).userId;
    }
    if (req.user?.claims?.sub) {
      return req.user.claims.sub;
    }
    return null;
  };

  // Client Dashboard Stats
  app.get("/api/client/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const [orders, bookings, invoices, notifications] = await Promise.all([
        storage.getOrdersByUser(userId),
        storage.getBookingsByUser(userId),
        storage.getInvoicesByUser(userId),
        storage.getUnreadNotifications(userId),
      ]);

      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'completed').length;
      const upcomingBookings = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) > new Date()).length;

      res.json({
        totalOrders: orders.length,
        pendingOrders,
        totalSpent,
        totalBookings: bookings.length,
        upcomingBookings,
        totalInvoices: invoices.length,
        unreadNotifications: notifications.length,
      });
    } catch (error) {
      console.error("Error fetching client stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Client Profile
  app.get("/api/client/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/client/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { firstName, lastName, phone, profileImageUrl, marketingOptIn } = req.body;
      const user = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        phone,
        profileImageUrl,
        marketingOptIn,
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Client Addresses
  app.get("/api/client/addresses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const addresses = await storage.getAddressesByUser(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  app.post("/api/client/addresses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { label, street, city, province, postalCode, country, type, isDefault } = req.body;
      
      const address = await storage.createAddress({
        userId,
        label,
        street,
        city,
        province,
        postalCode,
        country: country || "South Africa",
        type: type || "delivery",
        isDefault: isDefault || false,
      });

      if (isDefault) {
        await storage.setDefaultAddress(userId, address.id);
      }

      res.status(201).json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ error: "Failed to create address" });
    }
  });

  app.put("/api/client/addresses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== userId) {
        return res.status(404).json({ error: "Address not found" });
      }

      const { label, street, city, province, postalCode, country, type, isDefault } = req.body;
      
      const updatedAddress = await storage.updateAddress(req.params.id, {
        label,
        street,
        city,
        province,
        postalCode,
        country,
        type,
      });

      if (isDefault && updatedAddress) {
        await storage.setDefaultAddress(userId, updatedAddress.id);
      }

      res.json(updatedAddress);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ error: "Failed to update address" });
    }
  });

  app.delete("/api/client/addresses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== userId) {
        return res.status(404).json({ error: "Address not found" });
      }

      await storage.deleteAddress(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  app.put("/api/client/addresses/:id/default", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const address = await storage.getAddress(req.params.id);
      if (!address || address.userId !== userId) {
        return res.status(404).json({ error: "Address not found" });
      }

      await storage.setDefaultAddress(userId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ error: "Failed to set default address" });
    }
  });

  // Client Orders
  app.get("/api/client/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/client/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order || order.userId !== userId) {
        return res.status(404).json({ error: "Order not found" });
      }

      const [statusHistory, invoices] = await Promise.all([
        storage.getOrderStatusHistory(order.id),
        storage.getInvoicesByOrder(order.id),
      ]);

      res.json({
        ...order,
        statusHistory,
        invoices,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Client Bookings
  app.get("/api/client/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Client Invoices
  app.get("/api/client/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const invoices = await storage.getInvoicesByUser(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/client/invoices/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice || invoice.userId !== userId) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Client Notifications
  app.get("/api/client/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.put("/api/client/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const notification = await storage.markNotificationRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  app.put("/api/client/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ error: "Failed to mark all notifications read" });
    }
  });

  // =====================================================
  // CART API ROUTES
  // =====================================================

  app.get("/api/cart", async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;
      
      const items = await storage.getCartItems(userId || undefined, !userId ? sessionId : undefined);
      const total = await storage.getCartTotal(userId || undefined, !userId ? sessionId : undefined);
      
      res.json({ items, ...total });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;
      
      const { productId, productName, productImage, quantity, options, unitPrice } = req.body;
      
      if (!productId || !productName || !unitPrice || !quantity) {
        return res.status(400).json({ error: "Product ID, name, unit price, and quantity are required" });
      }

      const totalPrice = (parseFloat(unitPrice) * parseInt(quantity)).toFixed(2);

      const cartItem = await storage.addCartItem({
        userId: userId || null,
        sessionId: !userId ? sessionId : null,
        productId,
        productName,
        productImage,
        quantity: parseInt(quantity),
        options: options || {},
        unitPrice,
        totalPrice,
      });

      const items = await storage.getCartItems(userId || undefined, !userId ? sessionId : undefined);
      const total = await storage.getCartTotal(userId || undefined, !userId ? sessionId : undefined);

      res.status(201).json({ item: cartItem, items, ...total });
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;
      
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Valid quantity is required" });
      }

      const cartItem = await storage.getCartItem(req.params.id);
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      if ((userId && cartItem.userId !== userId) || (!userId && cartItem.sessionId !== sessionId)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const totalPrice = (parseFloat(cartItem.unitPrice) * parseInt(quantity)).toFixed(2);
      
      const updatedItem = await storage.updateCartItem(req.params.id, {
        quantity: parseInt(quantity),
        totalPrice,
      });

      const items = await storage.getCartItems(userId || undefined, !userId ? sessionId : undefined);
      const total = await storage.getCartTotal(userId || undefined, !userId ? sessionId : undefined);

      res.json({ item: updatedItem, items, ...total });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;
      
      const cartItem = await storage.getCartItem(req.params.id);
      if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      if ((userId && cartItem.userId !== userId) || (!userId && cartItem.sessionId !== sessionId)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await storage.removeCartItem(req.params.id);

      const items = await storage.getCartItems(userId || undefined, !userId ? sessionId : undefined);
      const total = await storage.getCartTotal(userId || undefined, !userId ? sessionId : undefined);

      res.json({ success: true, items, ...total });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;
      
      await storage.clearCart(userId || undefined, !userId ? sessionId : undefined);
      
      res.json({ success: true, items: [], subtotal: 0, itemCount: 0 });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  app.post("/api/orders/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Authentication required for checkout" });
      }

      const { addressId, paymentMethod, notes } = req.body;

      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      const { subtotal } = await storage.getCartTotal(userId);
      const tax = subtotal * 0.15;
      const total = subtotal + tax;

      const user = await storage.getUser(userId);
      const address = addressId ? await storage.getAddress(addressId) : null;

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.unitPrice),
        options: item.options || {},
        artworkUrl: item.productImage || undefined,
      }));

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const customerName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer" : "Customer";
      const customerEmail = user?.email || "noemail@example.com";
      const deliveryAddress = address ? `${address.street}, ${address.city}, ${address.province}, ${address.postalCode}` : undefined;

      const order = await storage.createOrder({
        userId,
        orderNumber,
        items: orderItems,
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        status: "pending",
        paymentStatus: "pending",
        deliveryMethod: paymentMethod === "pay_on_delivery" ? "delivery" : (address ? "delivery" : "pickup"),
        deliveryAddress,
        customerName,
        customerEmail,
        customerPhone: user?.phone || undefined,
      });

      await storage.addOrderStatusHistory({
        orderId: order.id,
        status: "pending",
        note: "Order placed successfully",
        updatedBy: userId,
      });

      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      await storage.createInvoice({
        orderId: order.id,
        userId,
        invoiceNumber,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        status: "issued",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await storage.createNotification({
        userId,
        type: "order",
        title: "Order Placed Successfully",
        message: `Your order ${orderNumber} has been placed and is being processed.`,
        data: { orderId: order.id, orderNumber },
      });

      await storage.clearCart(userId);

      res.status(201).json({
        success: true,
        order,
        message: "Order placed successfully",
      });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Checkout failed" });
    }
  });
}
