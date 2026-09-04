import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { useLocalUser } from "@/hooks/useLocalUser";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Calendar, 
  User, 
  MapPin,
  Bell,
  LogOut,
  ChevronLeft,
  Home,
  Menu,
  X
} from "lucide-react";

const clientNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

interface ClientLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function ClientLayout({ children, title }: ClientLayoutProps) {
  const { user, isAuthenticated, isLoading } = useLocalUser();
  const { signOut } = useClerk();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  const { data: unreadCount } = useQuery<number>({
    queryKey: ["/api/client/notifications/unread-count"],
    enabled: isAuthenticated,
    select: (data: any) => data?.length || 0,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      setLocation(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/30 overflow-x-hidden">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-label="Close account navigation"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-start justify-between gap-2">
            <Link href="/?view=site" onClick={closeSidebar}>
              <Button variant="ghost" size="sm" className="mb-2 hover-elevate">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={closeSidebar}
              aria-label="Close account menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="font-bold text-lg text-primary">My Account</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {user?.firstName || "Customer"}
          </p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {clientNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/dashboard" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href} onClick={closeSidebar}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link href="/" onClick={closeSidebar}>
            <Button variant="ghost" className="w-full justify-start hover-elevate">
              <Home className="h-4 w-4 mr-2" />
              Go Shopping
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => signOut({ redirectUrl: "/" })}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="min-w-0 w-full flex-1 overflow-auto">
        <header className="bg-card border-b p-4 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-10">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open account menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="truncate text-lg font-semibold sm:text-xl">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative hover-elevate">
                <Bell className="h-5 w-5" />
                {unreadCount && unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.firstName?.charAt(0) || "U"}
                </span>
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
