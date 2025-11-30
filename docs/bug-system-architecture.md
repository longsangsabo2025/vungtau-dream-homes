# Bug Detection & Self-Healing System - Architecture Design

**Project:** Vungtau Dream Homes
**Date:** 2025-01-XX
**Approach:** STANDARD
**Architect:** AI DevOps Engineer

---

## EXECUTIVE SUMMARY

This document outlines the architecture for a production-grade bug detection and self-healing system for Vungtau Dream Homes. The system is designed using a **STANDARD** approach, balancing comprehensive features with maintainability.

**Key Principles:**
- ✅ Reuse existing infrastructure (Sentry, Supabase, Analytics)
- ✅ Zero breaking changes to existing code
- ✅ Graceful degradation if any component fails
- ✅ Minimal new dependencies
- ✅ Incremental implementation

---

## LAYER SELECTION MATRIX

### LAYER 1: ERROR MONITORING

**Decision:** ✅ **STANDARD**

**Justification:**
- Sentry already installed but not initialized
- Production application needs real-time error tracking
- Team project benefits from error visibility
- Staging + Production environments exist

**Implementation:**
- Initialize Sentry in `main.tsx`
- Add React Error Boundary component
- Create centralized error handler service
- Integrate with existing analytics system
- Store errors in Supabase for historical analysis

**Components:**
- `src/lib/errorHandler.ts` - Centralized error service
- `src/components/ErrorBoundary.tsx` - React error boundary
- `src/lib/sentry.ts` - Enhanced Sentry config
- Database table: `error_logs` (Supabase)

---

### LAYER 2: AI BUG DETECTION

**Decision:** ✅ **STANDARD**

**Justification:**
- Has Supabase for data storage
- Can leverage existing analytics_events table
- Pattern matching sufficient for most bugs
- No need for expensive LLM API calls for every error

**Implementation:**
- Pattern matching engine for common error patterns
- Error classification (network, validation, auth, database, etc.)
- Duplicate detection (same error within time window)
- Severity scoring (critical, high, medium, low)
- Optional: OpenAI API for complex error analysis (feature flag)

**Components:**
- `src/lib/bugDetector.ts` - Pattern matching engine
- `src/lib/errorClassifier.ts` - Error categorization
- Database table: `bug_reports` (Supabase)
- Database function: `classify_error()` (PostgreSQL)

**Patterns to Detect:**
- Network errors (timeout, connection refused)
- Authentication errors (401, 403)
- Validation errors (400, form validation)
- Database errors (foreign key, constraint violations)
- Rate limiting (429)
- Missing environment variables
- Supabase RLS policy violations

---

### LAYER 3: SELF-HEALING

**Decision:** ✅ **STANDARD**

**Justification:**
- Production app needs reliability
- Many errors are transient (network, rate limits)
- Auto-retry can resolve 30%+ of errors
- Circuit breakers prevent cascading failures

**Implementation:**
- Automatic retry with exponential backoff
- Circuit breaker pattern for failing services
- Graceful degradation (fallback UI, cached data)
- Auto-recovery for known error patterns
- Manual override capability

**Components:**
- `src/lib/retryHandler.ts` - Retry logic with backoff
- `src/lib/circuitBreaker.ts` - Circuit breaker implementation
- `src/lib/selfHealing.ts` - Self-healing orchestrator
- Database table: `healing_actions` (track what was auto-fixed)

**Recovery Strategies:**
1. **Network Errors:** Retry 3x with exponential backoff
2. **Rate Limiting:** Wait and retry after delay
3. **Auth Errors:** Refresh token and retry
4. **Validation Errors:** Show user-friendly message (no retry)
5. **Database Errors:** Log and notify admin (no auto-fix)

---

### LAYER 4: CI/CD TESTING

**Decision:** ✅ **STANDARD**

**Justification:**
- Currently no CI/CD pipeline
- Only 2 test files for entire app
- Need automated testing before deployment
- Security scanning important for production

**Implementation:**
- GitHub Actions workflow
- Pre-deployment test gates
- Code quality checks (ESLint)
- Security scanning (npm audit)
- Test coverage enforcement (50% threshold)
- Automated deployment to Vercel (on success)

**Components:**
- `.github/workflows/ci.yml` - Main CI pipeline
- `.github/workflows/cd.yml` - Deployment pipeline
- Test coverage reporting
- Security audit automation

**Pipeline Stages:**
1. **Lint** - ESLint checks
2. **Test** - Run Vitest with coverage
3. **Security** - npm audit
4. **Build** - Verify build succeeds
5. **Deploy** - Deploy to Vercel (if all pass)

---

### LAYER 5: LEARNING LOOP

**Decision:** ✅ **STANDARD**

**Justification:**
- Production app will generate error patterns
- Can learn from fixes to prevent future bugs
- Pattern detection helps prioritize issues
- Historical data in Supabase enables analysis

**Implementation:**
- Track all errors and their resolutions
- Pattern detection for recurring issues
- Fix suggestion based on historical patterns
- Metrics dashboard for error trends
- Weekly summary reports

**Components:**
- Database table: `error_patterns` (Supabase)
- Database function: `detect_error_patterns()` (PostgreSQL)
- `src/lib/learningEngine.ts` - Pattern detection
- Admin dashboard page: `/admin/bug-reports`

**Learning Capabilities:**
- Detect recurring error patterns
- Suggest fixes based on past resolutions
- Track error frequency trends
- Identify problematic code paths
- Generate weekly error reports

---

## ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React App)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ ErrorBoundary│───▶│ ErrorHandler │───▶│  BugDetector │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         │                   ▼                    ▼          │
│         │            ┌──────────────┐    ┌──────────────┐  │
│         │            │   Sentry     │    │ SelfHealing  │  │
│         │            │  (Monitor)   │    │  (Recovery)   │  │
│         │            └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
└─────────┼───────────────────┼────────────────────┼──────────┘
          │                   │                    │
          ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ error_logs   │  │ bug_reports   │  │healing_actions│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │error_patterns│  │analytics_events│ (existing)            │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD (GitHub Actions)                   │
├─────────────────────────────────────────────────────────────┤
│  Lint → Test → Security → Build → Deploy                    │
└─────────────────────────────────────────────────────────────┘
```

---

## INTEGRATION POINTS

### 1. Error Boundary Integration

**Location:** `src/App.tsx`

```typescript
// Wrap entire app with ErrorBoundary
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Impact:** Catches all unhandled React errors

---

### 2. Error Handler Integration

**Location:** All existing try/catch blocks

**Pattern:**
```typescript
// Before:
catch (error) {
  console.error('Error:', error);
}

// After:
catch (error) {
  errorHandler.capture(error, { context: 'PropertyManagement' });
}
```

**Impact:** Centralized error logging and monitoring

---

### 3. Sentry Integration

**Location:** `src/main.tsx`

```typescript
import { initSentry } from './lib/sentry';
initSentry(); // Initialize before React render
```

**Impact:** Real-time error tracking in production

---

### 4. Self-Healing Integration

**Location:** API calls and data fetching

**Pattern:**
```typescript
// Wrap Supabase calls with retry logic
const data = await selfHealing.execute(() =>
  supabase.from('properties').select('*')
);
```

**Impact:** Automatic retry for transient failures

---

### 5. CI/CD Integration

**Location:** `.github/workflows/`

**Trigger:** On push to `main` branch
**Gates:** Tests must pass before deployment

**Impact:** Prevents broken code from reaching production

---

## DATABASE SCHEMA

### New Tables Required

#### 1. `error_logs`

```sql
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  severity VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  page_url TEXT,
  user_agent TEXT,
  context JSONB, -- Additional context data
  sentry_event_id VARCHAR(255), -- Link to Sentry
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);
```

#### 2. `bug_reports`

```sql
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_log_id UUID REFERENCES public.error_logs(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- network, auth, validation, database, etc.
  status VARCHAR(20) DEFAULT 'open', -- open, investigating, fixed, closed
  priority VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
  occurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  fixed_at TIMESTAMPTZ,
  fixed_by UUID REFERENCES auth.users(id),
  fix_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_category ON public.bug_reports(category);
CREATE INDEX idx_bug_reports_priority ON public.bug_reports(priority);
```

#### 3. `healing_actions`

```sql
CREATE TABLE public.healing_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_log_id UUID REFERENCES public.error_logs(id),
  action_type VARCHAR(50) NOT NULL, -- retry, circuit_breaker, fallback, etc.
  action_result VARCHAR(20), -- success, failed, skipped
  retry_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_healing_actions_error_log_id ON public.healing_actions(error_log_id);
CREATE INDEX idx_healing_actions_action_type ON public.healing_actions(action_type);
```

#### 4. `error_patterns`

```sql
CREATE TABLE public.error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name VARCHAR(255) NOT NULL,
  pattern_signature TEXT NOT NULL, -- Hash or signature of error pattern
  error_type VARCHAR(100),
  category VARCHAR(50),
  occurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  suggested_fix TEXT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_patterns_pattern_signature ON public.error_patterns(pattern_signature);
CREATE INDEX idx_error_patterns_is_resolved ON public.error_patterns(is_resolved);
```

### Database Functions

#### 1. `classify_error(error_message TEXT, error_stack TEXT)`

Classifies error into category (network, auth, validation, etc.)

#### 2. `detect_error_patterns()`

Analyzes error_logs to find recurring patterns

#### 3. `get_error_statistics(days INTEGER)`

Returns error statistics for dashboard

---

## NEW DEPENDENCIES REQUIRED

### Production Dependencies

**None** - All functionality uses existing dependencies:
- `@sentry/react` - Already installed
- `@supabase/supabase-js` - Already installed
- React 18 - Already installed

### Development Dependencies

**None** - CI/CD uses GitHub Actions (no additional packages)

### Optional Dependencies (Feature Flag)

- `openai` - For AI-powered error analysis (optional, feature-flagged)

---

## FILES TO CREATE/MODIFY

### New Files to Create

#### Core Services
1. `src/lib/errorHandler.ts` - Centralized error handling service
2. `src/lib/bugDetector.ts` - Bug detection and classification
3. `src/lib/errorClassifier.ts` - Error categorization logic
4. `src/lib/retryHandler.ts` - Retry logic with exponential backoff
5. `src/lib/circuitBreaker.ts` - Circuit breaker implementation
6. `src/lib/selfHealing.ts` - Self-healing orchestrator
7. `src/lib/learningEngine.ts` - Pattern detection and learning

#### Components
8. `src/components/ErrorBoundary.tsx` - React error boundary
9. `src/components/ErrorFallback.tsx` - Error UI component

#### Database
10. `supabase/migrations/YYYYMMDDHHMMSS_create_bug_system_tables.sql` - Database schema
11. `supabase/migrations/YYYYMMDDHHMMSS_create_bug_system_functions.sql` - Database functions

#### CI/CD
12. `.github/workflows/ci.yml` - Continuous Integration pipeline
13. `.github/workflows/cd.yml` - Continuous Deployment pipeline

#### Admin Pages
14. `src/pages/admin/BugReports.tsx` - Bug reports dashboard
15. `src/pages/admin/ErrorLogs.tsx` - Error logs viewer

#### Documentation
16. `docs/bug-system-usage.md` - Usage guide
17. `docs/bug-system-discovery.md` - ✅ Already created
18. `docs/bug-system-architecture.md` - ✅ This file

### Files to Modify

1. `src/main.tsx` - Initialize Sentry
2. `src/App.tsx` - Add ErrorBoundary wrapper
3. `src/lib/sentry.ts` - Enhance Sentry configuration
4. `package.json` - Add optional OpenAI dependency (if AI analysis enabled)

### Integration Points (Modify Existing Files)

**Pattern:** Replace `console.error` with `errorHandler.capture()`

**Files to update (priority order):**
1. `src/hooks/useSupabase.ts` - High priority (core data fetching)
2. `src/pages/admin/PropertiesManagement.tsx` - High priority
3. `src/pages/Profile.tsx` - Medium priority
4. `src/pages/CreateProperty.tsx` - Medium priority
5. All other pages with try/catch - Lower priority (can be done incrementally)

---

## IMPLEMENTATION ORDER

### Phase 1: Foundation (Week 1)
1. ✅ Database tables and functions
2. ✅ Initialize Sentry
3. ✅ Create ErrorBoundary component
4. ✅ Create errorHandler service
5. ✅ Integrate ErrorBoundary in App.tsx

### Phase 2: Detection (Week 1-2)
6. ✅ Create bugDetector service
7. ✅ Create errorClassifier service
8. ✅ Integrate errorHandler in core hooks (useSupabase)
9. ✅ Test error capture and classification

### Phase 3: Self-Healing (Week 2)
10. ✅ Create retryHandler service
11. ✅ Create circuitBreaker service
12. ✅ Create selfHealing orchestrator
13. ✅ Integrate in API calls
14. ✅ Test auto-recovery scenarios

### Phase 4: CI/CD (Week 2-3)
15. ✅ Create GitHub Actions workflows
16. ✅ Configure test gates
17. ✅ Setup deployment automation
18. ✅ Test CI/CD pipeline

### Phase 5: Learning & Admin (Week 3)
19. ✅ Create learningEngine service
20. ✅ Create admin dashboard pages
21. ✅ Setup pattern detection
22. ✅ Create usage documentation

---

## SECURITY CONSIDERATIONS

### Row Level Security (RLS)

All new tables must have RLS policies:

```sql
-- error_logs: Admins can view all, users can view their own
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own errors"
  ON public.error_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all errors"
  ON public.error_logs FOR SELECT
  USING (is_admin());

-- bug_reports: Admins only
CREATE POLICY "Admins can manage bug reports"
  ON public.bug_reports FOR ALL
  USING (is_admin());
```

### Data Privacy

- **Error logs:** May contain sensitive data (user info, API keys in stack traces)
- **Solution:** Sanitize error messages before storage
- **Retention:** Auto-delete logs older than 90 days (cron job)

### API Keys

- **Sentry DSN:** Already in environment variables ✅
- **OpenAI API Key:** Only if AI analysis enabled (feature flag)

---

## MONITORING & ALERTS

### Metrics to Track

1. **Error Rate:** Errors per hour/day
2. **Error Types:** Distribution by category
3. **Auto-Resolution Rate:** % of errors auto-fixed
4. **MTTR:** Mean time to resolve
5. **Test Coverage:** Maintain 50%+ threshold
6. **Deployment Frequency:** Track deploy success rate

### Alert Rules

1. **Critical Errors:** >10 in 5 minutes → Immediate notification
2. **High Severity:** >20 in 1 hour → Alert within 15 minutes
3. **Test Failures:** Any test failure → Block deployment
4. **Coverage Drop:** <50% → Warning in CI

### Notification Channels

- **Sentry:** Real-time error alerts (configured in Sentry dashboard)
- **Supabase:** Database triggers for critical errors (optional)
- **Admin Dashboard:** In-app notifications for admins

---

## COST ESTIMATION

### Sentry
- **Free Tier:** 5,000 events/month ✅ (sufficient for start)
- **Paid:** $26/month for 50K events (if needed later)

### Supabase
- **Free Tier:** 500MB database ✅ (sufficient for error logs)
- **Storage:** Error logs ~1KB each, 1000 errors = 1MB

### OpenAI (Optional)
- **Cost:** ~$0.01 per error analysis (if enabled)
- **Usage:** Only for complex errors (feature flag)

### GitHub Actions
- **Free Tier:** 2,000 minutes/month ✅ (sufficient)

**Total Monthly Cost:** $0 (using free tiers) or $26 (if Sentry upgrade needed)

---

## SUCCESS CRITERIA

### Phase 1 Success
- ✅ Sentry capturing errors in production
- ✅ ErrorBoundary preventing app crashes
- ✅ Errors logged to database

### Phase 2 Success
- ✅ Errors automatically classified
- ✅ Bug reports generated for recurring issues
- ✅ Admin dashboard showing error statistics

### Phase 3 Success
- ✅ 30%+ of errors auto-resolved
- ✅ Circuit breakers preventing cascading failures
- ✅ Retry logic handling transient errors

### Phase 4 Success
- ✅ CI/CD pipeline blocking broken deployments
- ✅ Test coverage maintained at 50%+
- ✅ Automated security scans running

### Phase 5 Success
- ✅ Pattern detection identifying recurring bugs
- ✅ Admin dashboard providing actionable insights
- ✅ System learning from past fixes

---

## RISK MITIGATION

### Risk 1: Sentry Initialization Fails
**Mitigation:** Graceful fallback to console logging + database

### Risk 2: Database Migration Fails
**Mitigation:** Rollback scripts, test in staging first

### Risk 3: Self-Healing Causes Issues
**Mitigation:** Feature flags, manual override, logging all actions

### Risk 4: CI/CD Blocks Valid Deployments
**Mitigation:** Manual override option, clear error messages

### Risk 5: Performance Impact
**Mitigation:** Async error logging, batch database writes, monitoring

---

**Architecture Design Complete**
**Next Phase:** Implementation

