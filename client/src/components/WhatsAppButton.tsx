import { useQuery } from "@tanstack/react-query";
import { FaWhatsapp } from "react-icons/fa";

interface ContactSettings {
  id: string;
  whatsappNumber: string | null;
}

export function WhatsAppButton() {
  const { data: settings } = useQuery<ContactSettings>({
    queryKey: ["/api/contact-settings"],
  });

  const whatsappNumber = settings?.whatsappNumber || "+27112223333";
  
  const cleanNumber = whatsappNumber.replace(/[^0-9+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber.replace("+", "")}?text=Hi, I would like to enquire about your services.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="button-whatsapp-contact"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="w-7 h-7" />
    </a>
  );
}
