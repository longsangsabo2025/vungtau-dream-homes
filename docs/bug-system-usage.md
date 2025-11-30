# Bug Detection & Self-Healing System - Usage Guide

**Project:** Vungtau Dream Homes
**Version:** 1.0.0
**Last Updated:** 2025-01-XX

---

## QUICK START

The bug detection and self-healing system is now integrated into your application. It automatically:

- ✅ Captures all errors to Sentry and Supabase
- ✅ Prevents app crashes with Error Boundaries
- ✅ Automatically retries failed network requests
- ✅ Classifies errors for better organization
- ✅ Creates bug reports for recurring issues

**No action required** - the system works automatically!

---

## FOR DEVELOPERS

### Using Error Handler

Replace `console.error` with the centralized error handler:

```typescript
import { errorHandler, captureError } from '@/lib/errorHandler';

// Option 1: Using the function
try {
  // your code
} catch (error) {
  captureError(error, {
    component: 'PropertyManagement',
    action: 'fetchProperties',
  });
}

// Option 2: Using the instance
try {
  // your code
} catch (error) {
  await errorHandler.capture(error, {
    component: 'PropertyManagement',
    action: 'fetchProperties',
  });
}
```

### Using Self-Healing

Wrap API calls with self-healing for automatic retry:

```typescript
import { selfHealing } from '@/lib/selfHealing';
import { supabase } from '@/lib/supabase';

// Automatic retry with exponential backoff
const { data, error } = await selfHealing.executeSupabaseQuery(
  () => supabase.from('properties').select('*')
);

// With custom options
const result = await selfHealing.execute(
  async () => {
    // your async operation
    return await someApiCall();
  },
  {
    enableRetry: true,
    enableCircuitBreaker: true,
    maxRetries: 3,
    circuitKey: 'api-calls',
  }
);
```

### Error Context

Always provide context when capturing errors:

```typescript
captureError(error, {
  component: 'ComponentName',
  action: 'actionName',
  userId: user?.id,
  additionalData: { /* any relevant data */ },
});
```

**Note:** Sensitive data (passwords, tokens) is automatically sanitized.

---

## FOR ADMINS

### Viewing Error Logs

1. Navigate to `/admin/bug-reports` (coming soon)
2. View error statistics and trends
3. Filter by severity, category, or date range

### Error Categories

Errors are automatically classified into:

- **Network** - Connection issues, timeouts
- **Auth** - Authentication/authorization failures
- **Validation** - Input validation errors
- **Database** - Database query failures
- **API** - External API errors
- **UI** - React component errors
- **Unknown** - Unclassified errors

### Bug Reports

The system automatically creates bug reports for recurring errors:

- **Open** - New bug, needs investigation
- **Investigating** - Being worked on
- **Fixed** - Resolved
- **Closed** - No longer occurring
- **Duplicate** - Duplicate of another bug

### Self-Healing Actions

View automatic recovery actions in the database:

```sql
SELECT * FROM healing_actions
ORDER BY created_at DESC
LIMIT 100;
```

---

## MONITORING

### Sentry Dashboard

1. Go to [Sentry Dashboard](https://sentry.io)
2. View real-time error tracking
3. Set up alerts for critical errors

### Supabase Database

Query error statistics:

```sql
-- Get error statistics for last 7 days
SELECT * FROM get_error_statistics(7);

-- Get healing statistics
SELECT * FROM get_healing_statistics(7);

-- Detect error patterns
SELECT * FROM detect_error_patterns(3, 30);
```

### Error Logs Table

```sql
-- View recent errors
SELECT
  error_type,
  severity,
  created_at,
  page_url
FROM error_logs
ORDER BY created_at DESC
LIMIT 50;

-- Errors by category
SELECT
  classify_error(error_message, error_stack) as category,
  COUNT(*) as count
FROM error_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY category;
```

---

## CONFIGURATION

### Environment Variables

Required environment variables:

```env
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Sentry Configuration

Edit `src/lib/sentry.ts` to customize:

- Sample rates
- Replay settings
- Environment tags
- User context

### Retry Configuration

Edit `src/lib/retryHandler.ts` to customize:

- Max retries (default: 3)
- Initial delay (default: 1000ms)
- Max delay (default: 10000ms)
- Backoff multiplier (default: 2)

### Circuit Breaker Configuration

Edit `src/lib/circuitBreaker.ts` to customize:

- Failure threshold (default: 5)
- Reset timeout (default: 60000ms)
- Monitoring window (default: 60000ms)

---

## TROUBLESHOOTING

### Errors Not Appearing in Sentry

1. Check `VITE_SENTRY_DSN` is set correctly
2. Verify Sentry is initialized in `main.tsx`
3. Check browser console for Sentry errors
4. Ensure you're in production mode (Sentry only enabled in PROD)

### Errors Not Saving to Database

1. Check Supabase connection
2. Verify RLS policies allow inserts
3. Check browser console for database errors
4. Verify `error_logs` table exists

### Self-Healing Not Working

1. Check error is retryable (network errors are retryable)
2. Verify circuit breaker isn't open
3. Check browser console for healing action logs
4. Review `healing_actions` table for action results

### High Error Volume

1. Check for recurring patterns:
   ```sql
   SELECT * FROM detect_error_patterns(5, 7);
   ```
2. Review bug reports for open issues
3. Check Sentry for error trends
4. Consider adjusting retry/circuit breaker settings

---

## BEST PRACTICES

### Error Handling

1. ✅ Always use `errorHandler.capture()` instead of `console.error`
2. ✅ Provide context (component, action) with every error
3. ✅ Don't log sensitive data (automatically sanitized)
4. ✅ Use appropriate severity levels

### Self-Healing

1. ✅ Use self-healing for network/API calls
2. ✅ Don't use for validation errors (not retryable)
3. ✅ Set appropriate circuit keys for different services
4. ✅ Monitor healing success rates

### Testing

1. ✅ Test error scenarios in development
2. ✅ Verify errors appear in Sentry (production)
3. ✅ Check database logs are being created
4. ✅ Test self-healing with network failures

---

## API REFERENCE

### errorHandler

```typescript
// Capture error
await errorHandler.capture(error, context);

// Set user context
await errorHandler.setUser(userId, email);

// Clear user context
errorHandler.clearUser();
```

### selfHealing

```typescript
// Execute with self-healing
await selfHealing.execute(fn, options);

// Execute Supabase query with self-healing
await selfHealing.executeSupabaseQuery(queryFn, options);
```

### errorClassifier

```typescript
// Classify error
const classified = errorClassifier.classify(error);
// Returns: { category, subcategory, isRetryable, suggestedAction }
```

### retryHandler

```typescript
// Execute with retry
await retryHandler.execute(fn, {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
});
```

### circuitBreaker

```typescript
// Execute with circuit breaker
await circuitBreaker.execute('circuit-key', fn);

// Get circuit state
const state = circuitBreaker.getState('circuit-key');

// Reset circuit
circuitBreaker.reset('circuit-key');
```

---

## SUPPORT

For issues or questions:

1. Check this documentation
2. Review error logs in Sentry
3. Check database for error patterns
4. Contact the development team

---

**System Status:** ✅ Active
**Last Updated:** 2025-01-XX

