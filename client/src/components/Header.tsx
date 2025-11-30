import { useState, useEffect } from "react";
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
import { CartButton } from "@/components/CartDrawer";
import { Menu, Search, User, LogOut, Settings, X, LayoutDashboard, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <motion.header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? "bg-white/95 dark:bg-background/95 backdrop-blur-xl shadow-lg border-b border-border/50" 
          : "bg-white dark:bg-background border-b"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="container mx-auto flex h-16 md:h-18 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-3 group" data-testid="link-logo">
          <img 
            src={logoImage} 
            alt="STATS Companies" 
            className="h-10 md:h-11 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <span className="hidden font-display font-bold text-lg text-primary dark:text-white md:block tracking-tight">
            STATS COMPANIES
          </span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              size="sm"
              asChild
              className={`font-medium transition-all relative group ${
                location === item.href 
                  ? "text-primary dark:text-accent" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`link-nav-${item.name.toLowerCase()}`}
            >
              <Link href={item.href}>
                {item.name}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary dark:bg-accent rounded-full transition-all duration-300 ${
                  location === item.href ? "w-4/5" : "w-0 group-hover:w-4/5"
                }`} />
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center relative group">
            <Input
              type="search"
              placeholder="Search..."
              className="w-44 lg:w-56 pl-10 h-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
            <Search className="h-4 w-4 absolute left-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          
          <ThemeToggle />
          
          <CartButton />

          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-semibold">
                      {getInitials(user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 shadow-xl border-border/50">
                <div className="px-3 py-2.5 bg-muted/50 rounded-t-lg">
                  <p className="text-sm font-semibold font-display">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer" data-testid="link-admin-dashboard">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer" data-testid="link-my-account">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders" className="cursor-pointer" data-testid="link-my-orders">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive" data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogin} 
              className="hidden sm:flex"
              data-testid="button-login"
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
          
          <Button 
            asChild
            className="hidden sm:flex btn-premium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full px-6 font-semibold"
            data-testid="button-get-quote"
          >
            <Link href="/quote">
              Get a Quote
            </Link>
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-l-0">
              <motion.div 
                className="flex flex-col h-full bg-gradient-to-b from-background to-muted/30"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <img src={logoImage} alt="STATS" className="h-8 w-auto" data-testid="img-mobile-logo" />
                    <span className="font-display font-bold text-sm">STATS COMPANIES</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-full"
                    data-testid="button-close-mobile-menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="px-4 pt-4">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-10 bg-muted/50 border-0 rounded-full h-12"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-mobile-search"
                    />
                    <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6">
                  <div className="space-y-1">
                    {navigation.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant="ghost"
                          asChild
                          className={`w-full justify-start text-lg font-display h-12 ${
                            location === item.href 
                              ? "bg-primary/10 text-primary" 
                              : "text-foreground"
                          }`}
                          data-testid={`link-mobile-nav-${item.name.toLowerCase()}`}
                        >
                          <Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
                            {item.name}
                          </Link>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t bg-background/80 backdrop-blur-sm space-y-3">
                  <Button 
                    asChild 
                    className="w-full h-12 btn-premium bg-primary hover:bg-primary/90 shadow-lg rounded-full font-semibold" 
                    data-testid="button-mobile-get-quote"
                  >
                    <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
                      Get a Quote
                    </Link>
                  </Button>
                  
                  {isAuthenticated && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl" data-testid="mobile-user-info">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                            {getInitials(user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      {isAdmin ? (
                        <Button 
                          variant="outline" 
                          asChild 
                          className="w-full h-11 rounded-full" 
                          data-testid="button-mobile-admin"
                        >
                          <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          asChild 
                          className="w-full h-11 rounded-full" 
                          data-testid="button-mobile-my-account"
                        >
                          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            My Account
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        className="w-full h-11 rounded-full" 
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
                      className="w-full h-11 rounded-full" 
                      onClick={handleLogin}
                      data-testid="button-mobile-login"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </div>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
