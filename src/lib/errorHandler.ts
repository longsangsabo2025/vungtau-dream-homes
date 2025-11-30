/**
 * Centralized Error Handler Service
 *
 * Captures, logs, and reports errors to Sentry and Supabase
 * Provides consistent error handling across the application
 */

import * as Sentry from '@sentry/react';
import { supabase } from './supabase';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ErrorContext {
  [key: string]: any;
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  pageUrl?: string;
  userAgent?: string;
}

export interface ErrorLog {
  id?: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: ErrorSeverity;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
  context?: Record<string, any>;
  sentry_event_id?: string;
  created_at?: string;
}

class ErrorHandler {
  private sessionId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Initialize error handler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      Sentry.setUser({ id: user.id, email: user.email || undefined });
    }

    this.isInitialized = true;
  }

  /**
   * Capture and handle an error
   */
  async capture(
    error: Error | unknown,
    context: ErrorContext = {}
  ): Promise<string | null> {
    try {
      // Ensure initialized
      await this.initialize();

      // Normalize error
      const normalizedError = this.normalizeError(error);
      const severity = this.determineSeverity(normalizedError, context);

      // Capture in Sentry
      const sentryEventId = await this.captureToSentry(normalizedError, context, severity);

      // Capture in Supabase
      const errorLogId = await this.captureToDatabase(
        normalizedError,
        context,
        severity,
        sentryEventId
      );

      return errorLogId;
    } catch (captureError) {
      // Fallback: at least log to console
      console.error('ErrorHandler.capture failed:', captureError);
      console.error('Original error:', error);
      return null;
    }
  }

  /**
   * Capture error to Sentry
   */
  private async captureToSentry(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity
  ): Promise<string | undefined> {
    try {
      const sentrySeverity: Sentry.SeverityLevel =
        severity === 'critical' ? 'fatal' :
        severity === 'high' ? 'error' :
        severity === 'medium' ? 'warning' :
        'info';

      const eventId = Sentry.captureException(error, {
        level: sentrySeverity,
        tags: {
          severity,
          component: context.component,
          action: context.action,
        },
        contexts: {
          custom: context,
        },
        extra: {
          sessionId: this.sessionId,
          pageUrl: context.pageUrl || window.location.href,
          userAgent: context.userAgent || navigator.userAgent,
        },
      });

      return eventId;
    } catch (sentryError) {
      console.warn('Failed to capture error to Sentry:', sentryError);
      return undefined;
    }
  }

  /**
   * Capture error to Supabase database
   */
  private async captureToDatabase(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity,
    sentryEventId?: string
  ): Promise<string | null> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const errorLog: Omit<ErrorLog, 'id' | 'created_at'> = {
        error_type: error.name || 'Error',
        error_message: error.message || String(error),
        error_stack: error.stack,
        severity,
        user_id: user?.id || context.userId,
        session_id: context.sessionId || this.sessionId,
        page_url: context.pageUrl || window.location.href,
        user_agent: context.userAgent || navigator.userAgent,
        context: this.sanitizeContext(context),
        sentry_event_id: sentryEventId,
      };

      const { data, error: dbError } = await supabase
        .from('error_logs')
        .insert(errorLog)
        .select('id')
        .single();

      if (dbError) {
        console.warn('Failed to save error to database:', dbError);
        return null;
      }

      // Trigger bug report creation (async, don't wait)
      this.createBugReport(data.id).catch(err =>
        console.warn('Failed to create bug report:', err)
      );

      return data.id;
    } catch (dbError) {
      console.warn('Failed to capture error to database:', dbError);
      return null;
    }
  }

  /**
   * Create or update bug report for error
   */
  private async createBugReport(errorLogId: string): Promise<void> {
    try {
      await supabase.rpc('create_or_update_bug_report', {
        p_error_log_id: errorLogId,
      });
    } catch (error) {
      // Silently fail - bug report creation is not critical
      console.debug('Bug report creation failed:', error);
    }
  }

  /**
   * Normalize error to Error object
   */
  private normalizeError(error: Error | unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error(String(error));
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, context: ErrorContext): ErrorSeverity {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Critical errors
    if (
      name.includes('chunk') ||
      name.includes('loading') ||
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      context.severity === 'critical'
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      name.includes('typeerror') ||
      name.includes('referenceerror') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      context.severity === 'high'
    ) {
      return 'high';
    }

    // Low severity errors
    if (
      name.includes('warning') ||
      message.includes('validation') ||
      context.severity === 'low'
    ) {
      return 'low';
    }

    // Default to medium
    return 'medium';
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context: ErrorContext): Record<string, any> {
    const sanitized: Record<string, any> = { ...context };

    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;

    // Remove nested sensitive data
    if (sanitized.data && typeof sanitized.data === 'object') {
      const data = { ...sanitized.data };
      delete data.password;
      delete data.token;
      delete data.apiKey;
      sanitized.data = data;
    }

    return sanitized;
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('error_handler_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error_handler_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Set user context for Sentry
   */
  async setUser(userId: string, email?: string): Promise<void> {
    Sentry.setUser({ id: userId, email });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    Sentry.setUser(null);
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience function
export const captureError = (
  error: Error | unknown,
  context?: ErrorContext
) => errorHandler.capture(error, context);

export default errorHandler;

