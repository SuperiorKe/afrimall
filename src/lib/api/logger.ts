export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  error?: Error
  metadata?: Record<string, any>
}

class Logger {
  private logLevel: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp
    const level = LogLevel[entry.level]
    const context = entry.context ? `[${entry.context}]` : ''
    const message = entry.message

    return `${timestamp} ${level} ${context} ${message}`.trim()
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private log(
    level: LogLevel,
    message: string,
    context?: string,
    error?: Error,
    metadata?: Record<string, any>,
  ) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      metadata,
    }

    const formattedMessage = this.formatMessage(entry)

    if (this.isDevelopment) {
      // In development, use console with colors
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m', // Green
        [LogLevel.WARN]: '\x1b[33m', // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
      }
      const reset = '\x1b[0m'

      console.log(`${colors[level]}${formattedMessage}${reset}`)

      if (error && error.stack) {
        console.log(`${colors[level]}${error.stack}${reset}`)
      }

      if (metadata && Object.keys(metadata).length > 0) {
        console.log(`${colors[level]}Metadata:${reset}`, metadata)
      }
    } else {
      // In production, use structured logging
      // This could be sent to a logging service like Winston, Pino, or external service
      const logData = {
        ...entry,
        environment: process.env.NODE_ENV,
        service: 'afrimall',
      }

      // For now, we'll use console but in production you'd send this to a logging service
      if (level === LogLevel.ERROR) {
        console.error(JSON.stringify(logData))
      } else {
        console.log(JSON.stringify(logData))
      }
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context, undefined, metadata)
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context, undefined, metadata)
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context, undefined, metadata)
  }

  error(message: string, context?: string, error?: Error, metadata?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error, metadata)
  }

  // Convenience methods for common use cases
  apiError(message: string, endpoint: string, error?: Error, metadata?: Record<string, any>) {
    this.error(message, `API:${endpoint}`, error, metadata)
  }

  dbError(message: string, operation: string, error?: Error, metadata?: Record<string, any>) {
    this.error(message, `DB:${operation}`, error, metadata)
  }

  authError(message: string, userId?: string, error?: Error, metadata?: Record<string, any>) {
    this.error(message, `AUTH:${userId || 'unknown'}`, error, metadata)
  }
}

export const logger = new Logger()
