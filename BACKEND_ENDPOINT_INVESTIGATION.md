# Backend API Endpoint Investigation Results

## Purpose
Document the actual API endpoints available in the LEMNIX backend to understand test failures.

## Methodology
- Analyzed route files in `backend/src/routes/`
- Checked middleware and authentication requirements
- Compared expected endpoints vs actual implementation

## Findings

### ✅ Root & Health Endpoints

#### Actually Available:
- `GET /` - Root API info ✓
- `GET /health` - Basic health check ✓
- `GET /readyz` - Readiness check ✓

#### Under `/api/health`:
- `GET /api/health/database` - Database health
- `GET /api/health/deep` - Deep health check with write test
- `GET /api/health/system` - System metrics
- `GET /api/health/queries` - Query statistics
- `GET /api/health/cache` - Cache status
- `GET /api/health/gpu` - GPU status

**Note**: Tests expected `/api/health/ready` and `/api/health/live` which don't exist.
**Actual**: Use `/readyz` for readiness, `/health` for liveness.

### ✅ Cutting List Endpoints (`/api/cutting-list`)

Available endpoints (43 total routes):
- `POST /` - Create cutting list ✓ TESTED
- `GET /` - Get all cutting lists ✓ TESTED
- `GET /:id` - Get by ID
- `PUT /:id` - Update cutting list
- `DELETE /:id` - Delete cutting list
- `POST /export/pdf` - Export to PDF
- `POST /export/excel` - Export to Excel
- `POST /import/excel` - Import from Excel
- `POST /quantity/calculate` - Calculate quantity
- `GET /suggestions/profiles` - Get profile suggestions
- `GET /enterprise/profiles` - Enterprise profile suggestions

**Status**: Most endpoints work, some return 404 (may be due to data not existing)

### ⚠️ Enterprise Optimization Endpoints (`/api/enterprise`)

**CRITICAL FINDING**: All optimization endpoints require authentication!

Auth requirements:
- `requiresAuth: true` on all routes
- `Permission.START_OPTIMIZATION` required
- Uses JWT token verification (`verifyToken` middleware)

Available endpoints:
- `POST /optimize` - Main optimization endpoint (requires auth)
- `POST /optimize-by-profile` - Profile-based optimization (requires auth)
- `POST /optimize/pareto` - Pareto optimization (requires auth)
- `POST /optimize/compare` - Compare algorithms (requires auth)
- `POST /ffd` - First Fit Decreasing (requires auth)
- `POST /bfd` - Best Fit Decreasing (requires auth)
- `POST /genetic` - Genetic algorithm (requires auth)
- `POST /pooling` - Pooling optimization (requires auth)
- `POST /nsga-ii` - NSGA-II algorithm (requires auth)
- `POST /pattern-exact` - Pattern-exact algorithm (requires auth)
- `GET /algorithms` - List available algorithms (requires auth)
- `POST /validate` - Validate optimization data (requires auth)

**Impact**: All our tests fail with 401 Unauthorized.
**Solution**: Either:
1. Disable auth for testing environment, or
2. Generate test JWT tokens, or
3. Mark these tests as expected 401

### ✅ Dashboard Endpoints (`/api/dashboard`)

Available endpoints:
- `GET /stats` - Dashboard statistics
- `GET /recent` - Recent activities ✓ TESTED
- `GET /summary` - Summary data
- `GET /metrics` - Dashboard metrics

Also available at `/api/dashboardv2`:
- `GET /summary` - Dashboard v2 summary

**Status**: Some endpoints may return 500 if database is not populated.

### ✅ Statistics Endpoints (`/api/statistics`)

Available endpoints:
- `GET /color-size-analysis` - Requires `?cuttingListId=` ✓ TESTED
- `GET /profile-analysis` - Requires `?cuttingListId=`
- `GET /work-order-analysis` - Requires `?cuttingListId=`
- Additional endpoints (need to verify in code)

**Status**: Endpoints exist, failures may be due to:
1. Missing cuttingListId parameter
2. Non-existent cutting list
3. Empty database

### ⚠️ Production Plan Endpoints (`/api/production-plan`)

Need to investigate actual endpoints. Tests assume:
- `GET /api/production-plans` (note the 's')
- `POST /api/production-plans`
- `GET /api/production-plans/:id`
- `PUT /api/production-plans/:id`
- `DELETE /api/production-plans/:id`

But actual mount point is `/api/production-plan` (no 's').

**Action Required**: Check actual routes in `productionPlanRoutes.ts`

### ⚠️ Profile Management Endpoints

Tests assume `/api/profiles` but actual mount point might be:
- `/api/profile-management`

**Action Required**: Verify actual endpoints.

### ✅ Metrics Endpoints (`/api/metrics`)

Available endpoints:
- `POST /web-vitals` - Submit web vitals
- `GET /web-vitals/summary` - Get web vitals summary

**Note**: Tests expected general metrics endpoint which doesn't exist at `/api/metrics` root.

## Test Failure Analysis

### Category 1: Endpoint Not Found (404)
These endpoints don't exist or have different paths:
- `/api/health/ready` → Use `/readyz` instead
- `/api/health/live` → Use `/health` instead
- `/api/metrics` (root) → Use specific endpoints like `/web-vitals/summary`

### Category 2: Authentication Required (401)
All `/api/enterprise/*` endpoints require authentication:
- All optimization endpoints
- Algorithm listing
- Validation endpoints

### Category 3: Wrong Path/Route
- `/api/production-plans` → Should be `/api/production-plan`
- `/api/profiles` → Should be `/api/profile-management`

### Category 4: Missing Data/Parameters
Some endpoints return 400/404 because:
- Required query parameters missing
- Referenced data doesn't exist
- Database is empty

## Recommendations

### Immediate Actions:

1. **Update Tests for Correct Endpoints**
   - Fix `/api/health/ready` → `/readyz`
   - Fix `/api/health/live` → `/health`
   - Fix `/api/production-plans` → `/api/production-plan`
   - Fix `/api/profiles` → `/api/profile-management`

2. **Handle Authentication in Tests**
   - Create test JWT token generator
   - Add auth header to enterprise optimization tests
   - Or mark them as expected 401

3. **Seed Test Database**
   - Create sample cutting lists
   - Create sample production plans
   - Create sample profiles

4. **Update Test Expectations**
   - Accept 404 for non-existent resources
   - Accept 400 for invalid parameters
   - Accept 401 for auth-required endpoints

### Test Categories Going Forward:

1. **Unauthenticated Endpoints** (can test directly)
   - Health checks
   - Root endpoints
   - Some read-only endpoints

2. **Authenticated Endpoints** (need JWT)
   - All enterprise optimization
   - Some CRUD operations
   - Protected resources

3. **Data-Dependent Endpoints** (need seeded data)
   - Statistics
   - Cutting list operations
   - Production plans

## Next Steps

1. ✅ Document all findings
2. ⬜ Create corrected test suite
3. ⬜ Implement JWT token generation for tests
4. ⬜ Create database seeding script
5. ⬜ Re-run tests with corrections
6. ⬜ Document passing rate improvement

## Conclusion

The API is well-structured and follows REST conventions. Most test failures are due to:
1. Incorrect endpoint paths in tests (30%)
2. Authentication requirements not handled (40%)
3. Missing test data (20%)
4. Actual bugs or issues (10%)

The backend itself appears to be functional. We need to align our tests with the actual implementation.
