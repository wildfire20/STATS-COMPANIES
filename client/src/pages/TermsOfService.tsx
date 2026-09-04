import { FileText } from "lucide-react";
import { LegalPage, type LegalSection } from "@/components/LegalPage";

const contactEmail = "info@statscompanies.co.za";

const sections: LegalSection[] = [
  {
    title: "1. Acceptance of These Terms",
    paragraphs: [
      "These Terms of Service apply when you access the STATS Companies website, create an account, submit a request, or purchase or book our products and services. By doing so, you agree to these terms and any applicable quote, invoice, booking confirmation, rental agreement, or other written agreement.",
      "If you do not agree, please do not use the website or submit an order or booking.",
    ],
  },
  {
    title: "2. Website and Account Use",
    paragraphs: [
      "You must provide accurate information, keep your account and sign-in methods secure, and notify us if you believe your account has been used without permission. You are responsible for activity carried out through your account unless applicable law provides otherwise.",
    ],
  },
  {
    title: "3. Customer Responsibilities",
    items: [
      "Provide complete, accurate, and timely contact, project, delivery, booking, and billing information.",
      "Review specifications, proofs, artwork, dimensions, quantities, dates, and other requirements before approving work.",
      "Ensure that supplied content and instructions may lawfully be used by STATS Companies.",
      "Cooperate with reasonable requests needed to complete an order, service, booking, or rental.",
    ],
  },
  {
    title: "4. Quotes and Orders",
    paragraphs: [
      "Quotes are based on the information available when they are prepared and remain subject to their stated scope, validity period, assumptions, and conditions. A request submitted through the website is not accepted until STATS Companies confirms it.",
      "Orders are subject to availability, acceptance, agreed specifications, and any applicable payment requirements. Material changes requested after acceptance may affect the price, timeline, or ability to complete the work.",
    ],
  },
  {
    title: "5. Service Bookings",
    paragraphs: [
      "Photography, videography, digital-marketing, and other service bookings are subject to availability and confirmation. Dates requested through the website are not guaranteed until confirmed by STATS Companies.",
      "Customers must provide reasonable access, permissions, schedules, content, and cooperation needed to perform the booked service.",
    ],
  },
  {
    title: "6. Equipment Rentals",
    paragraphs: [
      "Equipment rentals are subject to availability, identity or eligibility checks where appropriate, collection or delivery arrangements, and any separate rental terms. Customers must use rented equipment responsibly, follow supplied instructions, and return it in the agreed condition and timeframe.",
    ],
  },
  {
    title: "7. Prices and Payments",
    paragraphs: [
      "Prices displayed online may be starting prices or estimates and may change when specifications, quantities, materials, delivery requirements, or project scope change. The final price and payment schedule will be set out in the applicable checkout, quote, invoice, or agreement.",
      "Customers must make payments using an accepted method and by the applicable due date. Work, delivery, access, or booking confirmation may depend on receipt of an agreed payment.",
    ],
  },
  {
    title: "8. Changes, Cancellations, and Refunds",
    paragraphs: [
      "Changes, cancellations, and refunds are handled according to the applicable quote, invoice, booking confirmation, rental terms, or other agreement, together with applicable South African law. Eligibility may depend on the type of work, its progress, customised materials already produced, third-party costs, and notice provided.",
      "Please contact us as soon as possible if you need to change or cancel a request.",
    ],
  },
  {
    title: "9. Customer-Supplied Information and Materials",
    paragraphs: [
      "STATS Companies may rely on information, dimensions, content, files, artwork, approvals, and instructions supplied by the customer. We are not responsible for errors or delays caused by inaccurate, incomplete, unlawful, low-quality, or late customer-supplied material, except where liability cannot lawfully be excluded.",
    ],
  },
  {
    title: "10. Intellectual Property",
    paragraphs: [
      "The STATS Companies website, branding, original content, and materials created by us remain protected by applicable intellectual-property laws. Customer-supplied materials remain the responsibility of the customer, who confirms that they have the rights and permissions needed for us to use them.",
      "Ownership and permitted use of custom creative work will be governed by the applicable quote, invoice, licence, or written agreement.",
    ],
  },
  {
    title: "11. Prohibited Use",
    items: [
      "Use the website or our services for unlawful, fraudulent, abusive, or harmful purposes.",
      "Submit content that infringes another person's rights or violates applicable law.",
      "Attempt to interfere with the website, bypass security, access another user's account, or introduce malicious code.",
      "Misrepresent your identity, authority, payment information, or project requirements.",
    ],
  },
  {
    title: "12. Website Availability",
    paragraphs: [
      "We aim to keep the website available and accurate, but access may occasionally be interrupted for maintenance, updates, technical failures, provider outages, or circumstances beyond our reasonable control. Online information may be corrected or updated without notice.",
    ],
  },
  {
    title: "13. Limitation of Liability",
    paragraphs: [
      "To the extent permitted by South African law, STATS Companies will not be liable for indirect or consequential loss arising from use of the website or our services. Any liability will be considered in light of the applicable transaction, agreement, and legal rights.",
      "Nothing in these terms excludes or limits liability that cannot lawfully be excluded, nor does it remove rights available to consumers under applicable law.",
    ],
  },
  {
    title: "14. Changes to These Terms",
    paragraphs: [
      "We may update these terms to reflect changes to our services, operations, or legal obligations. Updated terms will be posted on this page with a revised date. Terms applicable to an accepted order or booking may also be set out in its specific agreement.",
    ],
  },
  {
    title: "15. South African Law",
    paragraphs: [
      "These terms are governed by the laws of the Republic of South Africa. Any dispute will be handled by the courts or other competent forums having jurisdiction under South African law.",
    ],
  },
  {
    title: "16. Contact Us",
    paragraphs: [
      <>
        Questions about these terms may be sent to{" "}
        <a className="font-medium text-primary hover:underline" href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>
        .
      </>,
    ],
  },
];

export default function TermsOfService() {
  return (
    <LegalPage
      badge="Website Terms"
      title="Terms of Service"
      description="The terms that apply when you use the STATS Companies website or request our products, creative services, bookings, and equipment rentals."
      lastUpdated="4 September 2026"
      icon={FileText}
      sections={sections}
    />
  );
}