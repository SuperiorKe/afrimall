import { logger } from '../api/logger'

// Email queue item interface
export interface EmailQueueItem {
  id: string
  type: 'order_confirmation' | 'order_update' | 'admin_notification'
  data: any
  priority: 'high' | 'normal' | 'low'
  attempts: number
  maxAttempts: number
  createdAt: string
  scheduledFor?: string
  lastAttempt?: string
  error?: string
}

// Email queue service class
export class EmailQueue {
  private queue: EmailQueueItem[] = []
  private processing = false
  private maxConcurrentEmails = 3
  private processingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startProcessing()
  }

  // Add email to queue
  async addToQueue(
    type: EmailQueueItem['type'],
    data: any,
    priority: EmailQueueItem['priority'] = 'normal',
    scheduledFor?: string,
  ): Promise<string> {
    const item: EmailQueueItem = {
      id: this.generateId(),
      type,
      data,
      priority,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      scheduledFor,
    }

    // Insert based on priority and schedule
    this.insertByPriority(item)

    logger.info(`Email queued: ${type} (${item.id})`, 'EmailQueue')
    return item.id
  }

  // Insert item by priority
  private insertByPriority(item: EmailQueueItem): void {
    const now = new Date().toISOString()

    // Find insertion point based on priority and schedule
    let insertIndex = this.queue.length

    for (let i = 0; i < this.queue.length; i++) {
      const queueItem = this.queue[i]

      // Skip items scheduled for future
      if (queueItem.scheduledFor && queueItem.scheduledFor > now) {
        continue
      }

      // Priority order: high > normal > low
      const priorityOrder = { high: 3, normal: 2, low: 1 }

      if (priorityOrder[item.priority] > priorityOrder[queueItem.priority]) {
        insertIndex = i
        break
      }
    }

    this.queue.splice(insertIndex, 0, item)
  }

  // Start processing queue
  private startProcessing(): void {
    if (this.processingInterval) {
      return // Already processing
    }

    this.processingInterval = setInterval(async () => {
      if (!this.processing && this.queue.length > 0) {
        await this.processQueue()
      }
    }, 5000) // Process every 5 seconds

    logger.info('Email queue processing started', 'EmailQueue')
  }

  // Stop processing queue
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    logger.info('Email queue processing stopped', 'EmailQueue')
  }

  // Process queue
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    const now = new Date().toISOString()

    try {
      // Get items ready to process
      const readyItems = this.queue.filter((item) => {
        if (item.scheduledFor && item.scheduledFor > now) {
          return false // Not yet scheduled
        }
        return item.attempts < item.maxAttempts
      })

      if (readyItems.length === 0) {
        return
      }

      // Process up to maxConcurrentEmails
      const itemsToProcess = readyItems.slice(0, this.maxConcurrentEmails)
      const promises = itemsToProcess.map((item) => this.processEmailItem(item))

      await Promise.allSettled(promises)
    } catch (error) {
      logger.error('Error processing email queue', 'EmailQueue', error as Error)
    } finally {
      this.processing = false
    }
  }

  // Process individual email item
  private async processEmailItem(item: EmailQueueItem): Promise<void> {
    try {
      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import('./email')

      let success = false

      switch (item.type) {
        case 'order_confirmation':
          success = await emailService.sendOrderConfirmation(item.data)
          break
        case 'order_update':
          success = await emailService.sendOrderUpdate(item.data)
          break
        case 'admin_notification':
          success = await emailService.sendAdminNotification(
            item.data.subject,
            item.data.message,
            item.data.adminEmail,
          )
          break
        default:
          throw new Error(`Unknown email type: ${item.type}`)
      }

      if (success) {
        // Remove from queue on success
        this.removeFromQueue(item.id)
        logger.info(`Email sent successfully: ${item.type} (${item.id})`, 'EmailQueue')
      } else {
        // Increment attempts and schedule retry
        this.handleEmailFailure(item)
      }
    } catch (error) {
      logger.error(`Error processing email item ${item.id}`, 'EmailQueue', error as Error)
      this.handleEmailFailure(item, (error as Error).message)
    }
  }

  // Handle email failure
  private handleEmailFailure(item: EmailQueueItem, error?: string): void {
    item.attempts++
    item.lastAttempt = new Date().toISOString()
    item.error = error

    if (item.attempts >= item.maxAttempts) {
      // Max attempts reached - remove from queue and log
      this.removeFromQueue(item.id)
      logger.error(
        `Email failed permanently after ${item.maxAttempts} attempts: ${item.type} (${item.id})`,
        'EmailQueue',
      )
    } else {
      // Schedule retry with exponential backoff
      const backoffMinutes = Math.pow(2, item.attempts) * 5 // 5, 10, 20 minutes
      const retryTime = new Date(Date.now() + backoffMinutes * 60 * 1000)
      item.scheduledFor = retryTime.toISOString()

      logger.warn(
        `Email failed, retrying in ${backoffMinutes} minutes: ${item.type} (${item.id}) - attempt ${item.attempts}`,
        'EmailQueue',
      )
    }
  }

  // Remove item from queue
  private removeFromQueue(id: string): void {
    const index = this.queue.findIndex((item) => item.id === id)
    if (index !== -1) {
      this.queue.splice(index, 1)
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get queue status
  getStatus(): {
    total: number
    pending: number
    processing: boolean
    items: Array<{
      id: string
      type: string
      priority: string
      attempts: number
      status: 'pending' | 'scheduled' | 'failed'
      createdAt: string
    }>
  } {
    const now = new Date().toISOString()

    return {
      total: this.queue.length,
      pending: this.queue.filter(
        (item) =>
          (!item.scheduledFor || item.scheduledFor <= now) && item.attempts < item.maxAttempts,
      ).length,
      processing: this.processing,
      items: this.queue.map((item) => ({
        id: item.id,
        type: item.type,
        priority: item.priority,
        attempts: item.attempts,
        status:
          item.attempts >= item.maxAttempts
            ? 'failed'
            : item.scheduledFor && item.scheduledFor > now
              ? 'scheduled'
              : 'pending',
        createdAt: item.createdAt,
      })),
    }
  }

  // Clear queue (for testing)
  clearQueue(): void {
    this.queue = []
    logger.info('Email queue cleared', 'EmailQueue')
  }

  // Retry failed emails
  async retryFailedEmails(): Promise<void> {
    const failedItems = this.queue.filter((item) => item.attempts >= item.maxAttempts)

    for (const item of failedItems) {
      item.attempts = 0
      item.scheduledFor = undefined
      item.error = undefined
      item.lastAttempt = undefined
    }

    logger.info(`Reset ${failedItems.length} failed email attempts`, 'EmailQueue')
  }
}

// Create singleton instance
export const emailQueue = new EmailQueue()

// Helper functions for common queue operations
export async function queueOrderConfirmationEmail(orderData: any): Promise<string> {
  return await emailQueue.addToQueue('order_confirmation', orderData, 'high')
}

export async function queueOrderUpdateEmail(orderData: any): Promise<string> {
  return await emailQueue.addToQueue('order_update', orderData, 'normal')
}

export async function queueAdminNotificationEmail(
  subject: string,
  message: string,
  adminEmail?: string,
): Promise<string> {
  return await emailQueue.addToQueue(
    'admin_notification',
    {
      subject,
      message,
      adminEmail,
    },
    'high',
  )
}

// Graceful shutdown
process.on('SIGINT', () => {
  emailQueue.stopProcessing()
})

process.on('SIGTERM', () => {
  emailQueue.stopProcessing()
})
