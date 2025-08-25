import nodemailer from 'nodemailer'
import { logger } from './logger'

// Email service configuration
export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email template interface
export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private isConfigured: boolean = false

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      // Check if SMTP is configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
        this.isConfigured = true
        logger.info('SMTP email service configured successfully', 'EmailService')
      } else if (process.env.SENDGRID_API_KEY) {
        // SendGrid configuration (if you want to add SendGrid support)
        logger.info('SendGrid API key found, but SendGrid implementation not yet added', 'EmailService')
      } else {
        logger.warn('No email service configured. Emails will not be sent.', 'EmailService')
      }
    } catch (error) {
      logger.error('Failed to initialize email transporter', 'EmailService', error as Error)
      this.isConfigured = false
    }
  }

  // Send email method
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured, skipping email send', 'EmailService', {
        to,
        subject: template.subject,
      })
      return false
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text || this.htmlToText(template.html),
      }

      const result = await this.transporter.sendMail(mailOptions)
      logger.info('Email sent successfully', 'EmailService', {
        to,
        subject: template.subject,
        messageId: result.messageId,
      })
      return true
    } catch (error) {
      logger.error('Failed to send email', 'EmailService', error as Error, {
        to,
        subject: template.subject,
      })
      return false
    }
  }

  // Convert HTML to plain text (simple implementation)
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  }

  // Order confirmation email template
  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderId: string
      customerName: string
      total: number
      currency: string
      items: Array<{ name: string; quantity: number; price: number }>
    }
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Order Confirmation - #${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Order Confirmation</h1>
          <p>Dear ${orderData.customerName},</p>
          <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
          
          <h2>Order Details</h2>
          <p><strong>Order ID:</strong> #${orderData.orderId}</p>
          <p><strong>Total Amount:</strong> ${orderData.currency} ${orderData.total.toFixed(2)}</p>
          
          <h3>Items Ordered:</h3>
          <ul>
            ${orderData.items
              .map(
                (item) =>
                  `<li>${item.name} x ${item.quantity} - ${orderData.currency} ${item.price.toFixed(2)}</li>`
              )
              .join('')}
          </ul>
          
          <p>We'll send you another email when your order ships.</p>
          
          <p>Best regards,<br>The AfriMall Team</p>
        </div>
      `,
    }

    return this.sendEmail(to, template)
  }

  // Password reset email template
  async sendPasswordReset(
    to: string,
    resetToken: string,
    resetUrl: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Password Reset Request - AfriMall',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset Request</h1>
          <p>You requested a password reset for your AfriMall account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}?token=${resetToken}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetUrl}?token=${resetToken}</p>
          
          <p><strong>This link will expire in 1 hour.</strong></p>
          
          <p>If you didn't request this password reset, please ignore this email.</p>
          
          <p>Best regards,<br>The AfriMall Team</p>
        </div>
      `,
    }

    return this.sendEmail(to, template)
  }

  // Test email method
  async sendTestEmail(to: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Test Email - AfriMall Email Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Test Email</h1>
          <p>This is a test email to verify that your email service is working correctly.</p>
          <p>If you received this email, your email configuration is working!</p>
          <p>Best regards,<br>The AfriMall Team</p>
        </div>
      `,
    }

    return this.sendEmail(to, template)
  }
}

// Export singleton instance
export const emailService = new EmailService()
