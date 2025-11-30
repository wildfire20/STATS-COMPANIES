import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  ShoppingCart, 
  Calendar, 
  FileText, 
  Tag, 
  Image, 
  Star, 
  Users,
  LogOut,
  ChevronLeft,
  CreditCard
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Settings },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/portfolio", label: "Portfolio", icon: Image },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted">
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Site
            </Button>
          </Link>
          <h1 className="font-bold text-lg text-primary">STATS Admin</h1>
          <p className="text-sm text-muted-foreground">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/admin" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <a href="/api/logout">
            <Button variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b p-4">
          <h2 className="text-xl font-semibold">{title}</h2>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
