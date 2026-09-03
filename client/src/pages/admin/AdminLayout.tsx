import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import { useLocalUser } from "@/hooks/useLocalUser";
import { useDemo } from "@/hooks/useDemo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CreditCard,
  Mail,
  Camera,
  FileStack,
  Eye,
  Menu,
  X
} from "lucide-react";

interface AdminStats {
  pendingOrders: number;
  pendingBookings: number;
  newQuotes: number;
  pendingRentals: number;
}

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Settings },
  { href: "/admin/plans", label: "Marketing Plans", icon: FileStack },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/equipment", label: "Equipment", icon: Camera },
  { href: "/admin/promotions", label: "Promotions", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/portfolio", label: "Portfolio", icon: Image },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/contact", label: "Contact", icon: Mail },
  { href: "/admin/demo-accounts", label: "Demo Access", icon: Eye },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading, isAdmin } = useLocalUser();
  const { signOut } = useClerk();
  const { isDemo, demoName, demoExpiresAt, isLoading: demoLoading } = useDemo();
  const { toast } = useToast();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && isAdmin,
    refetchInterval: 30000,
  });

  const getBadgeCount = (label: string): number => {
    if (!stats) return 0;
    switch (label) {
      case "Orders": return stats.pendingOrders;
      case "Bookings": return stats.pendingBookings;
      case "Quotes": return stats.newQuotes;
      case "Equipment": return stats.pendingRentals;
      default: return 0;
    }
  };

  const hasAccess = (isAuthenticated && isAdmin) || isDemo;

  useEffect(() => {
    if (!isLoading && !demoLoading && !hasAccess) {
      if (!isAuthenticated) {
        toast({
          title: "Unauthorized",
          description: "Please log in to access the admin panel.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/sign-in";
        }, 500);
      } else if (isAuthenticated && !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, isDemo, demoLoading, hasAccess, toast]);

  if (isLoading || demoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-muted">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          data-testid="sidebar-overlay"
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-card border-r flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Site
              </Button>
            </Link>
            <h1 className="font-bold text-lg text-primary">STATS Admin</h1>
            <p className="text-sm text-muted-foreground">
              {isDemo ? demoName : `${user?.firstName} ${user?.lastName}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={closeSidebar}
            data-testid="button-close-sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/admin" && location.startsWith(item.href));
            const badgeCount = getBadgeCount(item.label);
            
            return (
              <Link key={item.href} href={item.href} onClick={closeSidebar}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badgeCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 min-w-5 px-1.5 text-xs"
                      data-testid={`badge-${item.label.toLowerCase()}`}
                    >
                      {badgeCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          {isDemo ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                await apiRequest("POST", "/api/demo/logout");
                window.location.href = "/";
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Demo
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => signOut({ redirectUrl: "/" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
            </Button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto w-full">
        {isDemo && (
          <div className="bg-yellow-500/20 border-b border-yellow-500/50 px-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Demo Mode
                </span>
              </div>
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                Expires: {demoExpiresAt ? formatDistanceToNow(demoExpiresAt, { addSuffix: true }) : "Unknown"}
              </span>
            </div>
          </div>
        )}
        <header className="bg-card border-b p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-open-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">{title}</h2>
        </header>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
