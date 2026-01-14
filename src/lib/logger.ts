/**
 * Environment-aware logger utility
 * Only logs detailed errors in development mode to prevent information leakage in production
 */
export const logger = {
  error: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.error(message, data);
    }
    // In production, errors are silently handled
    // Consider integrating a server-side logging service for production error tracking
  },
  
  warn: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.warn(message, data);
    }
  },
  
  log: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      console.log(message, data);
    }
  }
};

/**
 * Validates comment text before submission
 * Returns null if valid, or an error message if invalid
 */
export const validateComment = (comment: string): string | null => {
  const trimmed = comment.trim();
  
  if (trimmed.length === 0) {
    return null; // Empty comments are allowed (optional)
  }
  
  if (trimmed.length > 1000) {
    return 'Comment must be 1000 characters or less';
  }
  
  return null;
};

/**
 * Validates that a comment is not empty when required
 */
export const validateRequiredComment = (comment: string): string | null => {
  const trimmed = comment.trim();
  
  if (trimmed.length === 0) {
    return 'Comment cannot be empty';
  }
  
  if (trimmed.length > 1000) {
    return 'Comment must be 1000 characters or less';
  }
  
  return null;
};
