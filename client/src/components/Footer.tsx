import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, MapPin, ArrowUpRight, Sparkles } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp, SiLinkedin, SiYoutube, SiTiktok } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
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
};

interface ContactInfo {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
  businessHours: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  youtube: string | null;
  tiktok: string | null;
  googleMapsUrl: string | null;
}

const defaultContact: ContactInfo = {
  email: "Info@statscompanies.co.za",
  phone: "+27 67 675 3321",
  whatsapp: "+27676753321",
  address: "23 Bureau Lane Street",
  city: "CBD, Pretoria",
  province: null,
  postalCode: null,
  country: null,
  businessHours: null,
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  twitter: null,
  linkedin: null,
  youtube: null,
  tiktok: null,
  googleMapsUrl: null,
};

export function Footer() {
  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const contact = contactInfo || defaultContact;

  const getSocialLinks = () => {
    const links = [];
    if (contact.facebook) {
      links.push({ name: "Facebook", icon: SiFacebook, href: contact.facebook });
    }
    if (contact.instagram) {
      links.push({ name: "Instagram", icon: SiInstagram, href: contact.instagram });
    }
    if (contact.twitter) {
      links.push({ name: "X", icon: FaXTwitter, href: contact.twitter });
    }
    if (contact.linkedin) {
      links.push({ name: "LinkedIn", icon: SiLinkedin, href: contact.linkedin });
    }
    if (contact.youtube) {
      links.push({ name: "YouTube", icon: SiYoutube, href: contact.youtube });
    }
    if (contact.tiktok) {
      links.push({ name: "TikTok", icon: SiTiktok, href: contact.tiktok });
    }
    if (contact.whatsapp) {
      const whatsappNumber = contact.whatsapp.replace(/[^0-9]/g, '');
      links.push({ name: "WhatsApp", icon: SiWhatsapp, href: `https://wa.me/${whatsappNumber}` });
    }
    return links;
  };

  const socialLinks = getSocialLinks();

  const getFullAddress = () => {
    const parts = [];
    if (contact.address) parts.push(contact.address);
    if (contact.city) parts.push(contact.city);
    if (contact.province) parts.push(contact.province);
    if (contact.postalCode) parts.push(contact.postalCode);
    return parts;
  };

  const addressParts = getFullAddress();

  return (
    <footer className="relative bg-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 decorative-dots opacity-5" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
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
            
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {socialLinks.map((social) => (
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
            )}
          </div>

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

          <div className="space-y-6">
            <h3 className="font-display font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-4">
              {contact.phone && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <a 
                      href={`tel:${contact.phone.replace(/\s/g, '')}`}
                      className="text-white/90 hover:text-white transition-colors"
                      data-testid="link-phone"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </li>
              )}
              {contact.email && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-white/90 hover:text-white transition-colors"
                      data-testid="link-email"
                    >
                      {contact.email}
                    </a>
                  </div>
                </li>
              )}
              {addressParts.length > 0 && (
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    {contact.googleMapsUrl ? (
                      <a 
                        href={contact.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                        data-testid="link-address"
                      >
                        {addressParts.map((part, idx) => (
                          <p key={idx} className={idx === 0 ? "text-white/90" : "text-white/60"}>
                            {part}
                          </p>
                        ))}
                      </a>
                    ) : (
                      addressParts.map((part, idx) => (
                        <p key={idx} className={idx === 0 ? "text-white/90" : "text-white/60"}>
                          {part}
                        </p>
                      ))
                    )}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

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
