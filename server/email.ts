import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'STATS Companies <onboarding@resend.dev>';
const COMPANY_NAME = 'STATS Companies';

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailData): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('Email not sent - RESEND_API_KEY not configured');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function getEmailHeader(): string {
  return `
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 28px; font-weight: 700;">
        ${COMPANY_NAME}
      </h1>
      <p style="color: #e0e0e0; margin: 5px 0 0 0; font-size: 14px;">Digital Printing | Photography | Videography | Marketing</p>
    </div>
  `;
}

function getEmailFooter(): string {
  return `
    <div style="background: #f8f9fa; padding: 25px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
        Thank you for choosing ${COMPANY_NAME}
      </p>
      <p style="color: #999; margin: 0; font-size: 12px;">
        7 Acacia Street, Johannesburg, South Africa<br/>
        Email: waynemundirwa8@gmail.com | Phone: +27 11 222 3333
      </p>
      <div style="margin-top: 15px;">
        <a href="https://facebook.com/statscompanies" style="color: #1877f2; text-decoration: none; margin: 0 10px;">Facebook</a>
      </div>
      <p style="color: #bbb; margin: 15px 0 0 0; font-size: 11px;">
        © ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
      </p>
    </div>
  `;
}

function wrapEmailContent(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        ${getEmailHeader()}
        <div style="padding: 30px 25px;">
          ${content}
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}

export async function sendEquipmentRentalStatusEmail(
  customerEmail: string,
  customerName: string,
  equipmentName: string,
  rentalNumber: string | null,
  status: string,
  startDate: Date,
  endDate: Date,
  total: string
): Promise<boolean> {
  const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
    pending: {
      subject: `Equipment Rental Request Received - ${rentalNumber || 'New Request'}`,
      message: 'Your equipment rental request has been received and is pending review. We will notify you once it has been processed.',
      color: '#ffc107'
    },
    approved: {
      subject: `Equipment Rental Approved - ${rentalNumber}`,
      message: 'Great news! Your equipment rental request has been approved. Please proceed with the deposit payment to confirm your booking.',
      color: '#28a745'
    },
    active: {
      subject: `Equipment Rental Active - ${rentalNumber}`,
      message: 'Your equipment rental is now active. Please ensure you return the equipment in good condition by the end date.',
      color: '#17a2b8'
    },
    returned: {
      subject: `Equipment Returned - ${rentalNumber}`,
      message: 'Thank you for returning the equipment. We hope you enjoyed using our services. Your deposit will be processed according to our policy.',
      color: '#6c757d'
    },
    cancelled: {
      subject: `Equipment Rental Cancelled - ${rentalNumber}`,
      message: 'Your equipment rental request has been cancelled. If you have any questions, please contact us.',
      color: '#dc3545'
    }
  };

  const statusInfo = statusMessages[status] || {
    subject: `Equipment Rental Update - ${rentalNumber}`,
    message: `Your rental status has been updated to: ${status}`,
    color: '#6c757d'
  };

  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Hello ${customerName},</h2>
    
    <div style="background: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="color: #333; margin: 0; font-size: 16px;">${statusInfo.message}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Rental Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">Rental Number:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 600;">${rentalNumber || 'Pending'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Equipment:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 600;">${equipmentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Start Date:</td>
          <td style="padding: 8px 0; color: #333;">${new Date(startDate).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">End Date:</td>
          <td style="padding: 8px 0; color: #333;">${new Date(endDate).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Total Amount:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 700; font-size: 18px;">R${total}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Status:</td>
          <td style="padding: 8px 0;">
            <span style="background: ${statusInfo.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${status}</span>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="color: #666; margin: 20px 0; line-height: 1.6;">
      If you have any questions about your rental, please don't hesitate to contact us via WhatsApp or email.
    </p>
  `;

  return sendEmail({
    to: customerEmail,
    subject: statusInfo.subject,
    html: wrapEmailContent(content)
  });
}

export async function sendOrderStatusEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  items: Array<{ name: string; quantity: number; price: string }>,
  total: string
): Promise<boolean> {
  const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
    pending: {
      subject: `Order Received - ${orderNumber}`,
      message: 'Your order has been received and is awaiting processing. We will notify you once we begin working on it.',
      color: '#ffc107'
    },
    processing: {
      subject: `Order Being Processed - ${orderNumber}`,
      message: 'Great news! We have started processing your order. Our team is working on it and will update you on progress.',
      color: '#17a2b8'
    },
    ready: {
      subject: `Order Ready for Collection/Delivery - ${orderNumber}`,
      message: 'Your order is ready! If you selected delivery, it will be dispatched shortly. For collection, please visit our store.',
      color: '#28a745'
    },
    shipped: {
      subject: `Order Shipped - ${orderNumber}`,
      message: 'Your order has been shipped and is on its way to you. You should receive it within 2-5 business days.',
      color: '#007bff'
    },
    delivered: {
      subject: `Order Delivered - ${orderNumber}`,
      message: 'Your order has been delivered. We hope you love your products! Please let us know if you have any feedback.',
      color: '#28a745'
    },
    cancelled: {
      subject: `Order Cancelled - ${orderNumber}`,
      message: 'Your order has been cancelled. If you have any questions or need a refund, please contact us.',
      color: '#dc3545'
    }
  };

  const statusInfo = statusMessages[status] || {
    subject: `Order Update - ${orderNumber}`,
    message: `Your order status has been updated to: ${status}`,
    color: '#6c757d'
  };

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${item.price}</td>
    </tr>
  `).join('');

  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Hello ${customerName},</h2>
    
    <div style="background: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="color: #333; margin: 0; font-size: 16px;">${statusInfo.message}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Order #${orderNumber}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #e9ecef;">
            <th style="padding: 10px; text-align: left; color: #666;">Item</th>
            <th style="padding: 10px; text-align: center; color: #666;">Qty</th>
            <th style="padding: 10px; text-align: right; color: #666;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: 600; color: #333;">Total:</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: 700; font-size: 18px; color: #333;">R${total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div style="text-align: center; margin: 25px 0;">
      <span style="background: ${statusInfo.color}; color: white; padding: 8px 20px; border-radius: 25px; font-size: 14px; font-weight: 600; text-transform: uppercase;">${status}</span>
    </div>
    
    <p style="color: #666; margin: 20px 0; line-height: 1.6;">
      Thank you for shopping with us! If you have any questions about your order, please contact us.
    </p>
  `;

  return sendEmail({
    to: customerEmail,
    subject: statusInfo.subject,
    html: wrapEmailContent(content)
  });
}

export async function sendBookingStatusEmail(
  customerEmail: string,
  customerName: string,
  serviceName: string,
  bookingDate: Date,
  status: string,
  notes?: string
): Promise<boolean> {
  const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
    pending: {
      subject: `Booking Request Received - ${serviceName}`,
      message: 'Your booking request has been received and is pending confirmation. We will contact you shortly to confirm the details.',
      color: '#ffc107'
    },
    confirmed: {
      subject: `Booking Confirmed - ${serviceName}`,
      message: 'Your booking has been confirmed! Please arrive 15 minutes before your scheduled time. We look forward to seeing you.',
      color: '#28a745'
    },
    completed: {
      subject: `Booking Completed - ${serviceName}`,
      message: 'Thank you for using our services! We hope you had a great experience. We would love to hear your feedback.',
      color: '#17a2b8'
    },
    cancelled: {
      subject: `Booking Cancelled - ${serviceName}`,
      message: 'Your booking has been cancelled. If this was a mistake or you need to reschedule, please contact us.',
      color: '#dc3545'
    }
  };

  const statusInfo = statusMessages[status] || {
    subject: `Booking Update - ${serviceName}`,
    message: `Your booking status has been updated to: ${status}`,
    color: '#6c757d'
  };

  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Hello ${customerName},</h2>
    
    <div style="background: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="color: #333; margin: 0; font-size: 16px;">${statusInfo.message}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">Service:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 600;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Date & Time:</td>
          <td style="padding: 8px 0; color: #333;">${new Date(bookingDate).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Status:</td>
          <td style="padding: 8px 0;">
            <span style="background: ${statusInfo.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${status}</span>
          </td>
        </tr>
        ${notes ? `
        <tr>
          <td style="padding: 8px 0; color: #666; vertical-align: top;">Notes:</td>
          <td style="padding: 8px 0; color: #333;">${notes}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <p style="color: #666; margin: 20px 0; line-height: 1.6;">
      If you need to make any changes to your booking, please contact us as soon as possible.
    </p>
  `;

  return sendEmail({
    to: customerEmail,
    subject: statusInfo.subject,
    html: wrapEmailContent(content)
  });
}

export async function sendQuoteStatusEmail(
  customerEmail: string,
  customerName: string,
  serviceName: string,
  quoteNumber: string,
  status: string,
  estimatedPrice?: string,
  notes?: string
): Promise<boolean> {
  const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
    pending: {
      subject: `Quote Request Received - ${quoteNumber}`,
      message: 'Your quote request has been received. Our team will review your requirements and get back to you with a detailed quote.',
      color: '#ffc107'
    },
    quoted: {
      subject: `Your Quote is Ready - ${quoteNumber}`,
      message: 'Great news! We have prepared your quote. Please review the details below and contact us if you would like to proceed.',
      color: '#28a745'
    },
    accepted: {
      subject: `Quote Accepted - ${quoteNumber}`,
      message: 'Thank you for accepting our quote! We will begin working on your project and keep you updated on progress.',
      color: '#17a2b8'
    },
    rejected: {
      subject: `Quote Update - ${quoteNumber}`,
      message: 'We understand this quote did not meet your needs. Please let us know if you would like a revised quote or have any questions.',
      color: '#6c757d'
    }
  };

  const statusInfo = statusMessages[status] || {
    subject: `Quote Update - ${quoteNumber}`,
    message: `Your quote status has been updated to: ${status}`,
    color: '#6c757d'
  };

  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Hello ${customerName},</h2>
    
    <div style="background: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="color: #333; margin: 0; font-size: 16px;">${statusInfo.message}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Quote Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">Quote Number:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 600;">${quoteNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Service:</td>
          <td style="padding: 8px 0; color: #333;">${serviceName}</td>
        </tr>
        ${estimatedPrice ? `
        <tr>
          <td style="padding: 8px 0; color: #666;">Estimated Price:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 700; font-size: 18px;">R${estimatedPrice}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #666;">Status:</td>
          <td style="padding: 8px 0;">
            <span style="background: ${statusInfo.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${status}</span>
          </td>
        </tr>
        ${notes ? `
        <tr>
          <td style="padding: 8px 0; color: #666; vertical-align: top;">Notes:</td>
          <td style="padding: 8px 0; color: #333;">${notes}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <p style="color: #666; margin: 20px 0; line-height: 1.6;">
      If you have any questions about your quote, please don't hesitate to reach out to us.
    </p>
  `;

  return sendEmail({
    to: customerEmail,
    subject: statusInfo.subject,
    html: wrapEmailContent(content)
  });
}

export async function sendWelcomeEmail(
  customerEmail: string,
  customerName: string
): Promise<boolean> {
  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Welcome to ${COMPANY_NAME}, ${customerName}!</h2>
    
    <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
      Thank you for creating an account with us. We're excited to have you as part of our community!
    </p>
    
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 20px;">What We Offer</h3>
      <div style="display: inline-block; text-align: left; color: #e0e0e0;">
        <p style="margin: 8px 0;">✓ Premium Digital Printing Services</p>
        <p style="margin: 8px 0;">✓ Professional Photography</p>
        <p style="margin: 8px 0;">✓ Cinematic Videography</p>
        <p style="margin: 8px 0;">✓ Digital Marketing Solutions</p>
        <p style="margin: 8px 0;">✓ Equipment Rental</p>
      </div>
    </div>
    
    <p style="color: #666; margin: 20px 0; line-height: 1.6;">
      Browse our services, check out our portfolio, and feel free to request a quote for your next project. 
      We're here to bring your vision to life!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: #1a1a2e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">Explore Our Services</a>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Welcome to ${COMPANY_NAME}!`,
    html: wrapEmailContent(content)
  });
}

export async function sendContactFormEmail(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
): Promise<boolean> {
  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">New Contact Form Submission</h2>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666; width: 30%; vertical-align: top;">Name:</td>
          <td style="padding: 10px 0; color: #333; font-weight: 600;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; vertical-align: top;">Email:</td>
          <td style="padding: 10px 0; color: #333;"><a href="mailto:${email}" style="color: #007bff;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; vertical-align: top;">Phone:</td>
          <td style="padding: 10px 0; color: #333;">${phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; vertical-align: top;">Subject:</td>
          <td style="padding: 10px 0; color: #333; font-weight: 600;">${subject}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; vertical-align: top;">Message:</td>
          <td style="padding: 10px 0; color: #333; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
    </div>
    
    <p style="color: #666; margin: 20px 0; line-height: 1.6;">
      Please respond to this inquiry as soon as possible.
    </p>
  `;

  return sendEmail({
    to: 'waynemundirwa8@gmail.com',
    subject: `Contact Form: ${subject}`,
    html: wrapEmailContent(content)
  });
}
