import nodemailer from 'nodemailer'
import { logger } from '../api/logger'

// Email configuration interface
export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

// Email template data interfaces
export interface OrderConfirmationData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: string
  items: Array<{
    title: string
    quantity: number
    unitPrice: number
    totalPrice: number
    sku: string
    image?: string
  }>
  subtotal: number
  shipping: {
    cost: number
    method: string
    address: {
      firstName: string
      lastName: string
      address1: string
      address2?: string
      city: string
      state?: string
      postalCode: string
      country: string
    }
  }
  total: number
  currency: string
  trackingNumber?: string
}

export interface OrderUpdateData {
  orderNumber: string
  customerName: string
  customerEmail: string
  status: string
  statusMessage: string
  trackingNumber?: string
  estimatedDelivery?: string
  updateDate: string
}

export interface PasswordResetData {
  email: string
  firstName: string
  resetToken: string
  resetUrl: string
}

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null
  private isConfigured = false

  constructor() {
    this.initializeConfig()
  }

  private initializeConfig(): void {
    try {
      // Check if email is configured
      const smtpHost = process.env.SMTP_HOST
      const smtpPort = process.env.SMTP_PORT
      const smtpUser = process.env.SMTP_USER
      const smtpPass = process.env.SMTP_PASS
      const smtpFrom = process.env.SMTP_FROM || smtpUser

      // Debug logging
      logger.info(
        `Email config debug - Host: ${smtpHost}, Port: ${smtpPort}, User: ${smtpUser}, Pass: ${smtpPass ? '[SET]' : '[NOT SET]'}, From: ${smtpFrom}`,
        'EmailService',
      )

      if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        logger.warn('Email configuration incomplete - email notifications disabled', 'EmailService')
        logger.warn(
          `Missing: ${!smtpHost ? 'SMTP_HOST ' : ''}${!smtpPort ? 'SMTP_PORT ' : ''}${!smtpUser ? 'SMTP_USER ' : ''}${!smtpPass ? 'SMTP_PASS' : ''}`,
          'EmailService',
        )
        return
      }

      this.config = {
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        from: smtpFrom || 'noreply@afrimall.com',
      }

      // Create transporter
      this.transporter = nodemailer.createTransport(this.config)
      this.isConfigured = true

      logger.info('Email service initialized successfully', 'EmailService')
    } catch (error) {
      logger.error('Failed to initialize email service', 'EmailService', error as Error)
      this.isConfigured = false
    }
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    if (!this.transporter || !this.isConfigured) {
      logger.warn('Email service not configured - cannot test connection', 'EmailService')
      return false
    }

    try {
      await this.transporter.verify()
      logger.info('Email service connection test successful', 'EmailService')
      return true
    } catch (error) {
      logger.error('Email service connection test failed', 'EmailService', error as Error)
      return false
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(data: any): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn(
        'Email service not configured - skipping order confirmation email',
        'EmailService',
      )
      return false
    }

    try {
      // Normalize order data - handle both flattened and nested structures
      const normalizedData = this.normalizeOrderData(data)

      const htmlContent = this.generateOrderConfirmationHTML(normalizedData)
      const textContent = this.generateOrderConfirmationText(normalizedData)

      const mailOptions = {
        from: this.config!.from,
        to: normalizedData.customerEmail,
        subject: `Order Confirmation - ${normalizedData.orderNumber}`,
        text: textContent,
        html: htmlContent,
      }

      await this.transporter!.sendMail(mailOptions)
      logger.info(
        `Order confirmation email sent successfully for order ${normalizedData.orderNumber}`,
        'EmailService',
      )
      return true
    } catch (error) {
      logger.error(
        `Failed to send order confirmation email for order ${data.orderNumber || 'unknown'}`,
        'EmailService',
        error as Error,
      )
      return false
    }
  }

  // Normalize order data to match OrderConfirmationData interface
  private normalizeOrderData(data: any): OrderConfirmationData {
    // Extract customer email from various possible structures
    let customerEmail = ''
    let customerName = ''

    if (data.customerEmail) {
      customerEmail = data.customerEmail
    } else if (data.customer?.email) {
      customerEmail = data.customer.email
    }

    if (data.customerName) {
      customerName = data.customerName
    } else if (data.customer?.firstName && data.customer?.lastName) {
      customerName = `${data.customer.firstName} ${data.customer.lastName}`
    } else if (data.customer?.firstName) {
      customerName = data.customer.firstName
    }

    // Extract items - handle various structures
    let items = []
    if (data.items && Array.isArray(data.items)) {
      items = data.items.map((item: any) => ({
        title: item.productSnapshot?.title || item.title || 'Unknown Product',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
        sku: item.productSnapshot?.sku || item.sku || '',
        image: item.productSnapshot?.image || item.image,
      }))
    }

    // Extract shipping info
    const shipping = {
      cost: data.shipping?.cost || 0,
      method: data.shipping?.method || 'standard',
      address: data.shipping?.address || data.shippingAddress || {},
    }

    return {
      orderNumber: data.orderNumber || 'UNKNOWN',
      customerName,
      customerEmail,
      orderDate: data.createdAt || data.orderDate || new Date().toISOString(),
      items,
      subtotal: data.subtotal || 0,
      shipping,
      total: data.total || 0,
      currency: data.currency || 'USD',
      trackingNumber: data.trackingNumber,
    }
  }

  // Send order status update email
  async sendOrderUpdate(data: OrderUpdateData): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping order update email', 'EmailService')
      return false
    }

    try {
      const htmlContent = this.generateOrderUpdateHTML(data)
      const textContent = this.generateOrderUpdateText(data)

      const mailOptions = {
        from: this.config!.from,
        to: data.customerEmail,
        subject: `Order Update - ${data.orderNumber}`,
        text: textContent,
        html: htmlContent,
      }

      await this.transporter!.sendMail(mailOptions)
      logger.info(
        `Order update email sent successfully for order ${data.orderNumber}`,
        'EmailService',
      )
      return true
    } catch (error) {
      logger.error(
        `Failed to send order update email for order ${data.orderNumber}`,
        'EmailService',
        error as Error,
      )
      return false
    }
  }

  // Send admin notification email
  async sendAdminNotification(
    subject: string,
    message: string,
    adminEmail?: string,
  ): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn(
        'Email service not configured - skipping admin notification email',
        'EmailService',
      )
      return false
    }

    const recipientEmail = adminEmail || process.env.ADMIN_EMAIL || this.config!.from

    try {
      const mailOptions = {
        from: this.config!.from,
        to: recipientEmail,
        subject: `AfriMall Admin: ${subject}`,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>AfriMall Admin Notification</h2>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>This is an automated message from AfriMall admin system.</em></p>
        </div>`,
      }

      await this.transporter!.sendMail(mailOptions)
      logger.info(`Admin notification email sent successfully: ${subject}`, 'EmailService')
      return true
    } catch (error) {
      logger.error(
        `Failed to send admin notification email: ${subject}`,
        'EmailService',
        error as Error,
      )
      return false
    }
  }

  // Generate HTML content for order confirmation
  private generateOrderConfirmationHTML(data: OrderConfirmationData): string {
    const itemsHTML = data.items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 15px; text-align: left;">
          <div style="display: flex; align-items: center;">
            ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 8px;">` : ''}
            <div>
              <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${item.title}</div>
              <div style="font-size: 14px; color: #666;">SKU: ${item.sku}</div>
            </div>
          </div>
        </td>
        <td style="padding: 15px; text-align: center; color: #666;">${item.quantity}</td>
        <td style="padding: 15px; text-align: right; color: #666;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 15px; text-align: right; font-weight: 600; color: #333;">$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `,
      )
      .join('')

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${data.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 30px; }
        .order-summary { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .order-details { background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { background-color: #f8f9fa; padding: 15px; text-align: left; font-weight: 600; color: #333; }
        .totals { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .total-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .total-final { font-size: 18px; font-weight: 600; color: #333; border-top: 2px solid #e0e0e0; padding-top: 10px; }
        .shipping-info { background-color: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .header, .content, .footer { padding: 20px; }
          .items-table { font-size: 14px; }
          .items-table th, .items-table td { padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for your purchase, ${data.customerName}!</p>
        </div>
        
        <div class="content">
          <div class="order-summary">
            <h2 style="margin-top: 0; color: #333;">Order Summary</h2>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
          </div>

          <h3>Order Items</h3>
          <div class="order-details">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Shipping (${data.shipping.method}):</span>
              <span>$${data.shipping.cost.toFixed(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>$${data.total.toFixed(2)} ${data.currency}</span>
            </div>
          </div>

          <div class="shipping-info">
            <h3 style="margin-top: 0; color: #28a745;">Shipping Information</h3>
            <p><strong>Method:</strong> ${data.shipping.method}</p>
            <p><strong>Address:</strong></p>
            <p>
              ${data.shipping.address.firstName} ${data.shipping.address.lastName}<br>
              ${data.shipping.address.address1}<br>
              ${data.shipping.address.address2 ? `${data.shipping.address.address2}<br>` : ''}
              ${data.shipping.address.city}${data.shipping.address.state ? `, ${data.shipping.address.state}` : ''} ${data.shipping.address.postalCode}<br>
              ${data.shipping.address.country}
            </p>
            ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/account" class="btn">View Order Details</a>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center;">
            If you have any questions about your order, please contact our support team or reply to this email.
          </p>
        </div>

        <div class="footer">
          <p>© 2024 AfriMall. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  // Generate text content for order confirmation
  private generateOrderConfirmationText(data: OrderConfirmationData): string {
    const itemsText = data.items
      .map(
        (item) =>
          `- ${item.title} (SKU: ${item.sku}) x${item.quantity} @ $${item.unitPrice.toFixed(2)} = $${item.totalPrice.toFixed(2)}`,
      )
      .join('\n')

    return `
ORDER CONFIRMATION - ${data.orderNumber}

Dear ${data.customerName},

Thank you for your purchase! Your order has been confirmed and is being processed.

ORDER DETAILS:
Order Number: ${data.orderNumber}
Order Date: ${new Date(data.orderDate).toLocaleDateString()}
Customer: ${data.customerName}
Email: ${data.customerEmail}

ORDER ITEMS:
${itemsText}

ORDER TOTALS:
Subtotal: $${data.subtotal.toFixed(2)}
Shipping (${data.shipping.method}): $${data.shipping.cost.toFixed(2)}
Total: $${data.total.toFixed(2)} ${data.currency}

SHIPPING INFORMATION:
Method: ${data.shipping.method}
Address:
${data.shipping.address.firstName} ${data.shipping.address.lastName}
${data.shipping.address.address1}
${data.shipping.address.address2 ? `${data.shipping.address.address2}\n` : ''}${data.shipping.address.city}${data.shipping.address.state ? `, ${data.shipping.address.state}` : ''} ${data.shipping.address.postalCode}
${data.shipping.address.country}

${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}\n` : ''}

You can view your order details at: ${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/account

If you have any questions about your order, please contact our support team.

Best regards,
The AfriMall Team

© 2025 AfriMall. All rights reserved.
This is an automated message. Please do not reply to this email.
    `.trim()
  }

  // Generate HTML content for order update
  private generateOrderUpdateHTML(data: OrderUpdateData): string {
    const statusColors: Record<string, string> = {
      processing: '#ffc107',
      shipped: '#17a2b8',
      delivered: '#28a745',
      cancelled: '#dc3545',
    }

    const statusColor = statusColors[data.status] || '#6c757d'

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - ${data.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 30px; }
        .status-update { background-color: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .order-info { background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .header, .content, .footer { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Order Update</h1>
          <p>Your order status has been updated</p>
        </div>
        
        <div class="content">
          <div class="status-update">
            <h2 style="margin-top: 0; color: ${statusColor};">Status: ${data.status.toUpperCase()}</h2>
            <p style="font-size: 16px; margin-bottom: 0;">${data.statusMessage}</p>
          </div>

          <div class="order-info">
            <h3 style="margin-top: 0; color: #333;">Order Information</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Update Date:</strong> ${new Date(data.updateDate).toLocaleDateString()}</p>
            ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
            ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(data.estimatedDelivery).toLocaleDateString()}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/account" class="btn">Track Your Order</a>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center;">
            If you have any questions about your order, please contact our support team.
          </p>
        </div>

        <div class="footer">
          <p>© 2024 AfriMall. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  // Generate text content for order update
  private generateOrderUpdateText(data: OrderUpdateData): string {
    return `
ORDER UPDATE - ${data.orderNumber}

Dear ${data.customerName},

Your order status has been updated:

STATUS: ${data.status.toUpperCase()}
Message: ${data.statusMessage}

ORDER INFORMATION:
Order Number: ${data.orderNumber}
Customer: ${data.customerName}
Update Date: ${new Date(data.updateDate).toLocaleDateString()}

${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}\n` : ''}${data.estimatedDelivery ? `Estimated Delivery: ${new Date(data.estimatedDelivery).toLocaleDateString()}\n` : ''}

You can track your order at: ${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/account

If you have any questions about your order, please contact our support team.

Best regards,
The AfriMall Team

© 2025 AfriMall. All rights reserved.
This is an automated message. Please do not reply to this email.
    `.trim()
  }

  // Send password reset email
  async sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping password reset email', 'EmailService')
      return false
    }

    try {
      const mailOptions = {
        from: this.config!.from,
        to: data.email,
        subject: 'Reset Your AfriMall Password',
        text: this.generatePasswordResetText(data),
        html: this.generatePasswordResetHTML(data),
        // Disable click tracking for security-sensitive password reset emails
        headers: {
          'X-No-Click-Tracking': 'true',
        },
        trackingSettings: {
          clickTracking: {
            enable: false,
            enableText: false,
          },
        },
      }

      const result = await this.transporter!.sendMail(mailOptions)
      logger.info('Password reset email sent successfully', 'EmailService', {
        to: data.email,
        messageId: result.messageId,
      })
      return true
    } catch (error) {
      logger.error('Failed to send password reset email', 'EmailService', error as Error)
      return false
    }
  }

  // Generate HTML content for password reset email
  private generatePasswordResetHTML(data: PasswordResetData): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - AfriMall</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 30px; }
        .reset-section { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
        .security-notice { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; color: #856404; }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .header, .content, .footer { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
          <p>Reset your AfriMall account password</p>
        </div>
        
        <div class="content">
          <p>Hello ${data.firstName},</p>
          
          <p>We received a request to reset your password for your AfriMall account. If you made this request, click the button below to reset your password:</p>

          <div class="reset-section">
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="btn">Reset My Password</a>
            </div>
            <p style="text-align: center; margin-top: 15px; color: #666; font-size: 14px;">
              This link will expire in 1 hour for security reasons
            </p>
          </div>

          <div class="security-notice">
            <h4 style="margin-top: 0; color: #856404;">🔒 Security Notice</h4>
            <ul style="margin-bottom: 0;">
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your password won't change until you click the link above</li>
            </ul>
          </div>

          <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
            ${data.resetUrl}
          </p>

          <p style="color: #666; font-size: 14px;">
            If you have any questions or need assistance, please contact our support team.
          </p>
        </div>

        <div class="footer">
          <p>© 2025 AfriMall. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  // Generate text content for password reset email
  private generatePasswordResetText(data: PasswordResetData): string {
    return `
PASSWORD RESET REQUEST - AfriMall

Hello ${data.firstName},

We received a request to reset your password for your AfriMall account. If you made this request, please use the link below to reset your password:

${data.resetUrl}

This link will expire in 1 hour for security reasons.

SECURITY NOTICE:
- If you didn't request this password reset, please ignore this email
- Your password won't change until you click the link above
- This link will expire in 1 hour for security reasons

If you're having trouble with the link above, copy and paste the URL below into your web browser:
${data.resetUrl}

If you have any questions or need assistance, please contact our support team.

Best regards,
The AfriMall Team

© 2025 AfriMall. All rights reserved.
This is an automated message. Please do not reply to this email.
    `.trim()
  }

  // Check if email service is configured and ready
  isReady(): boolean {
    return this.isConfigured && this.transporter !== null
  }

  // Get configuration status
  getConfigStatus(): { configured: boolean; host?: string; from?: string } {
    return {
      configured: this.isConfigured,
      host: this.config?.host,
      from: this.config?.from,
    }
  }

  // Reinitialize configuration (useful for testing)
  reinitializeConfig(): void {
    this.initializeConfig()
  }
}

// Create singleton instance
export const emailService = new EmailService()

// Helper function to send order confirmation email
export async function sendOrderConfirmationEmail(orderData: any): Promise<boolean> {
  try {
    const emailData: OrderConfirmationData = {
      orderNumber: orderData.orderNumber,
      customerName: `${orderData.shipping.address.firstName} ${orderData.shipping.address.lastName}`,
      customerEmail: orderData.customer?.email || orderData.customerEmail,
      orderDate: orderData.createdAt,
      items: orderData.items.map((item: any) => ({
        title: item.productSnapshot?.title || item.title || 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        sku: item.productSnapshot?.sku || item.sku || 'N/A',
        image: item.productSnapshot?.image || item.image,
      })),
      subtotal: orderData.subtotal,
      shipping: {
        cost: orderData.shipping.cost,
        method: orderData.shipping.method,
        address: orderData.shipping.address,
      },
      total: orderData.total,
      currency: orderData.currency,
      trackingNumber: orderData.shipping.trackingNumber,
    }

    return await emailService.sendOrderConfirmation(emailData)
  } catch (error) {
    logger.error('Error preparing order confirmation email', 'EmailService', error as Error)
    return false
  }
}

// Helper function to send order update email
export async function sendOrderUpdateEmail(
  orderData: any,
  newStatus: string,
  statusMessage: string,
): Promise<boolean> {
  try {
    const emailData: OrderUpdateData = {
      orderNumber: orderData.orderNumber,
      customerName: `${orderData.shipping.address.firstName} ${orderData.shipping.address.lastName}`,
      customerEmail: orderData.customer?.email || orderData.customerEmail,
      status: newStatus,
      statusMessage: statusMessage,
      trackingNumber: orderData.shipping.trackingNumber,
      estimatedDelivery: orderData.shipping.estimatedDelivery,
      updateDate: new Date().toISOString(),
    }

    return await emailService.sendOrderUpdate(emailData)
  } catch (error) {
    logger.error('Error preparing order update email', 'EmailService', error as Error)
    return false
  }
}
