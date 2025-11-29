import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, ShoppingCart, Search, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/states company logo_1764435536382.jpg";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Shop", href: "/shop" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Bookings", href: "/bookings" },
];

export function Header() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  const handleLogin = () => {
    setLocation("/login");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/local/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      window.location.href = "/api/logout";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-background border-b shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
          <img 
            src={logoImage} 
            alt="STATS Companies" 
            className="h-10 w-auto"
          />
          <span className="hidden font-bold text-lg text-primary dark:text-white md:block">STATS COMPANIES</span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                size="sm"
                data-testid={`link-nav-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-48 lg:w-64 pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
          </div>
          
          <ThemeToggle />
          
          <Link href="/shop">
            <Button variant="ghost" size="icon" data-testid="button-cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer" data-testid="link-admin-dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive" data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLogin} data-testid="button-login">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
          
          <Link href="/quote" className="hidden sm:block">
            <Button data-testid="button-get-quote">Get a Quote</Button>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-4 mt-8">
                <div className="relative mb-4">
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-mobile-search"
                  />
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      data-testid={`link-mobile-nav-${item.name.toLowerCase()}`}
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}
                <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full mt-4" data-testid="button-mobile-get-quote">
                    Get a Quote
                  </Button>
                </Link>
                
                <div className="border-t pt-4 mt-4">
                  {isAuthenticated && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full" data-testid="button-mobile-admin">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={handleLogout}
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleLogin}
                      data-testid="button-mobile-login"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
