// lib/logger.ts

import winston from 'winston';

// Check if we're in Vercel (read-only filesystem)
const isVercel = process.env.VERCEL === '1';

// Create transports array conditionally
const transports: winston.transport[] = [
  // Always log to console
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Only add file transports if NOT in Vercel
if (!isVercel) {
  transports.push(
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Security events log
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'poldatik-app' },
  transports,
});

export const securityLogger = {
  logFailedLogin: (email: string, ip: string, reason: string) => {
    logger.warn('Failed login attempt', {
      type: 'FAILED_LOGIN',
      email,
      ip,
      reason,
      timestamp: new Date().toISOString(),
    });
  },
  
  logSuccessfulLogin: (userId: string, email: string, ip: string) => {
    logger.info('Successful login', {
      type: 'SUCCESSFUL_LOGIN',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },
  
  logAccountLockout: (email: string, ip: string, attempts: number) => {
    logger.warn('Account locked due to multiple failed attempts', {
      type: 'ACCOUNT_LOCKOUT',
      email,
      ip,
      attempts,
      timestamp: new Date().toISOString(),
    });
  },
  
  logSuspiciousActivity: (userId: string, activity: string, details: unknown) => {
    logger.warn('Suspicious activity detected', {
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      activity,
      details,
      timestamp: new Date().toISOString(),
    });
  },
  
  logRateLimitExceeded: (identifier: string, endpoint: string, ip: string) => {
    logger.warn('Rate limit exceeded', {
      type: 'RATE_LIMIT_EXCEEDED',
      identifier,
      endpoint,
      ip,
      timestamp: new Date().toISOString(),
    });
  },
  
  logFileUpload: (userId: string, filename: string, size: number, mimetype: string) => {
    logger.info('File uploaded', {
      type: 'FILE_UPLOAD',
      userId,
      filename,
      size,
      mimetype,
      timestamp: new Date().toISOString(),
    });
  },
  
  logUnauthorizedAccess: (endpoint: string, ip: string, details?: unknown) => {
    logger.warn('Unauthorized access attempt', {
      type: 'UNAUTHORIZED_ACCESS',
      endpoint,
      ip,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

export default logger;
