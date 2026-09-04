import { ShieldCheck } from "lucide-react";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

const contactEmail = "info@statscompanies.co.za";

const sections: LegalSection[] = [
  {
    title: "1. Information You Provide",
    paragraphs: [
      "We collect information that you provide directly when you use the STATS Companies website, communicate with us, create an account, or request our products and services.",
    ],
    items: [
      "Account details, such as your name, email address, telephone number, profile picture, and account preferences.",
      "Order, booking, quote-request, and equipment-rental details, including your project requirements, selected products or services, artwork, fulfilment instructions, dates, and payment-related status.",
      "Contact and delivery information, including company details, billing or delivery addresses, and messages sent to us.",
      "Any other information you voluntarily provide through forms, uploads, email, telephone, or other communications.",
    ],
  },
  {
    title: "2. Google and Clerk Sign-In",
    paragraphs: [
      "Authentication and account management are provided through Clerk. If you choose Google sign-in, Google may provide the application with basic profile information required to authenticate you, such as your name, email address, and profile picture where available.",
      "We use this Google information only to authenticate you and operate your STATS Companies account. We do not request access to Google Drive, Gmail, Google Contacts, or other Google account content.",
      "STATS Companies does not sell Google user data or customer personal information.",
    ],
  },
  {
    title: "3. Cookies and Session Information",
    paragraphs: [
      "The website and its authentication providers may use cookies, tokens, and similar technologies to keep you signed in, protect your account, maintain shopping-cart or session information, remember preferences, and support essential website functionality.",
    ],
  },
  {
    title: "4. How We Use Information",
    items: [
      "Create, authenticate, secure, and administer customer accounts.",
      "Process orders, bookings, quotes, equipment rentals, deliveries, and customer enquiries.",
      "Provide customer support and send service-related communications.",
      "Maintain business, accounting, operational, and transaction records.",
      "Improve, secure, troubleshoot, and monitor the website and our services.",
      "Comply with legal obligations and enforce applicable agreements.",
      "Send marketing communications only where permitted and according to your preferences.",
    ],
  },
  {
    title: "5. Storage and Service Providers",
    paragraphs: [
      "We store and process information using systems appropriate to operating our website and business. We use service providers where reasonably necessary, including Clerk for authentication and account management, Google for optional Google authentication, and Railway for application, database, and related infrastructure.",
      "These providers may process information on our behalf according to their own terms and privacy commitments. We disclose only the information reasonably required for them to provide their services or where disclosure is required by law.",
    ],
  },
  {
    title: "6. Data Security",
    paragraphs: [
      "We use reasonable administrative, technical, and organisational safeguards designed to protect personal information against unauthorised access, alteration, disclosure, loss, or misuse. No internet transmission or storage system can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "7. Data Retention",
    paragraphs: [
      "We retain personal information for as long as reasonably necessary to provide services, maintain required business and transaction records, resolve disputes, enforce agreements, and meet legal or regulatory obligations. Retention periods depend on the type of information and the reason it was collected.",
    ],
  },
  {
    title: "8. Your Rights",
    paragraphs: [
      "Subject to applicable South African law, you may ask to access or correct personal information we hold about you, object to or restrict certain processing, withdraw consent where processing relies on consent, or request deletion where we are not required to retain the information.",
      "We may need to verify your identity before completing a request. Some information may need to be retained for legal, security, accounting, or legitimate business reasons.",
    ],
  },
  {
    title: "9. Updates to This Policy",
    paragraphs: [
      "We may update this Privacy Policy when our services, practices, or legal obligations change. The revised version will be posted on this page with an updated date.",
    ],
  },
  {
    title: "10. Contact Us",
    paragraphs: [
      <>
        For privacy questions or requests, contact STATS Companies at{" "}
        <a className="font-medium text-primary hover:underline" href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>
        .
      </>,
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPage
      badge="Your Privacy"
      title="Privacy Policy"
      description="How STATS Companies collects, uses, stores, and protects information when you use our website and services."
      lastUpdated="4 September 2026"
      icon={ShieldCheck}
      sections={sections}
    />
  );
}