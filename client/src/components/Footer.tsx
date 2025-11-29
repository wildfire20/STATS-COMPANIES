import { Link } from "wouter";
import { Phone, Mail, MapPin, ArrowUpRight, Sparkles } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { motion } from "framer-motion";
import logoImage from "@assets/states company logo_1764435536382.jpg";

const footerLinks = {
  quickLinks: [
    { name: "About Us", href: "/about" },
    { name: "Shop", href: "/shop" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Book a Session", href: "/bookings" },
  ],
  services: [
    { name: "Digital Printing", href: "/shop" },
    { name: "Photography", href: "/services?category=photography" },
    { name: "Videography", href: "/services?category=videography" },
    { name: "Digital Marketing", href: "/services?category=marketing" },
  ],
  socials: [
    { name: "Facebook", icon: SiFacebook, href: "https://facebook.com" },
    { name: "Instagram", icon: SiInstagram, href: "https://instagram.com" },
    { name: "WhatsApp", icon: SiWhatsapp, href: "https://wa.me/27676753321" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 decorative-dots opacity-5" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.img 
                src={logoImage} 
                alt="STATS Companies" 
                className="h-14 w-auto"
                whileHover={{ scale: 1.05 }}
              />
            </Link>
            <div className="flex items-center gap-2 text-lg font-display">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-white/90 italic">"You dream it, We make it."</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Digital Printing, Photography, Videography & Digital Marketing services in Pretoria, South Africa.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {footerLinks.socials.map((social) => (
                <a 
                  key={social.name}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  data-testid={`link-social-${social.name.toLowerCase()}`}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-white/60 hover:text-white flex items-center gap-1 group transition-colors"
                    data-testid={`link-footer-${link.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-lg">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-white/60 hover:text-white flex items-center gap-1 group transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="text-white/90">+27 67 675 3321</p>
                  <p className="text-white/60">+27 81 439 4879</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="text-white/90">Info@statscompanies.co.za</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="text-white/90">23 Bureau Lane Street</p>
                  <p className="text-white/60">CBD, Pretoria</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} STATS Companies. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-white/50 hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/refunds" className="text-white/50 hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
