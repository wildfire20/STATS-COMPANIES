import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import logoImage from "@assets/states company logo_1764435536382.jpg";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <img 
                src={logoImage} 
                alt="STATS Companies" 
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm opacity-90">
              "You dream it, We make it."
            </p>
            <p className="text-sm opacity-80">
              Digital Printing, Photography, Videography & Digital Marketing services in Pretoria.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="opacity-80 hover:opacity-100" data-testid="link-footer-about">About Us</Link></li>
              <li><Link href="/shop" className="opacity-80 hover:opacity-100" data-testid="link-footer-shop">Shop</Link></li>
              <li><Link href="/services" className="opacity-80 hover:opacity-100" data-testid="link-footer-services">Services</Link></li>
              <li><Link href="/portfolio" className="opacity-80 hover:opacity-100" data-testid="link-footer-portfolio">Portfolio</Link></li>
              <li><Link href="/bookings" className="opacity-80 hover:opacity-100" data-testid="link-footer-bookings">Book a Session</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="opacity-80 hover:opacity-100">Digital Printing</Link></li>
              <li><Link href="/services?category=photography" className="opacity-80 hover:opacity-100">Photography</Link></li>
              <li><Link href="/services?category=videography" className="opacity-80 hover:opacity-100">Videography</Link></li>
              <li><Link href="/services?category=marketing" className="opacity-80 hover:opacity-100">Digital Marketing</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="opacity-80">+27 67 675 3321</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="opacity-80">+27 81 439 4879</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="opacity-80">Info@statscompanies.co.za</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span className="opacity-80">23 Bureau Lane Street, CBD, Pretoria</span>
              </li>
            </ul>
            <div className="flex gap-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100" data-testid="link-social-facebook">
                <SiFacebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100" data-testid="link-social-instagram">
                <SiInstagram className="h-5 w-5" />
              </a>
              <a href="https://wa.me/27676753321" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100" data-testid="link-social-whatsapp">
                <SiWhatsapp className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
            <p>&copy; {new Date().getFullYear()} STATS Companies. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:opacity-100">Privacy Policy</Link>
              <Link href="/terms" className="hover:opacity-100">Terms & Conditions</Link>
              <Link href="/refunds" className="hover:opacity-100">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
