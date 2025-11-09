# Phase 1 Step 3: Controller Migration Guide

## 📋 Overview

This guide explains how to apply Phase 1 improvements (validation and standardized responses) to the existing CuttingListController.

**Current State**: 
- 3,219 line controller with mixed response formats
- Inconsistent validation
- Manual error handling

**Target State**:
- Type-safe validation with Zod
- Standardized API responses
- Automatic request tracking
- Better error handling

---

## 🚀 Quick Start

### 1. Import New Utilities

```typescript
// At the top of cuttingListController.ts
import {
  sendSuccess,
  sendError,
  sendPaginated,
  CuttingListErrorCode,
  createPaginationMeta
} from '../types/apiResponse';

import {
  validateBody,
  validateQuery,
  validateParams,
  getValidatedData
} from '../middleware/validation/validationMiddleware';

import {
  createCuttingListSchema,
  updateCuttingListSchema,
  addItemSchema,
  // ... other schemas
} from '../middleware/validation/cuttingListSchemas';
```

### 2. Apply to Routes

In `cuttingListRoutes.ts`, add validation middleware:

```typescript
// Before
router.post('/cutting-list', controller.createCuttingList);

// After
router.post('/cutting-list',
  validateBody(createCuttingListSchema),
  controller.createCuttingList
);
```

### 3. Update Controller Methods

Transform controller methods to use standardized responses:

```typescript
// BEFORE (Old Format)
async createCuttingList(req: Request, res: Response) {
  try {
    const { name, weekNumber } = req.body;
    
    // Manual validation
    if (!name || !weekNumber) {
      return res.status(400).json({
        error: 'Name and week number are required'
      });
    }
    
    const list = await repository.create({ name, weekNumber });
    
    res.status(201).json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create cutting list'
    });
  }
}

// AFTER (New Format)
async createCuttingList(req: Request, res: Response) {
  try {
    // Validation already done by middleware
    const data = getValidatedData<CreateCuttingListInput>(req);
    
    const list = await repository.create(data);
    
    // Standardized success response with metadata
    sendSuccess(res, list, 201);
  } catch (error) {
    // Handle specific errors
    if (error.code === 'P2002') {
      return sendError(
        res,
        CuttingListErrorCode.DUPLICATE_WEEK_NUMBER,
        'A cutting list already exists for this week',
        { weekNumber: data.weekNumber },
        409
      );
    }
    
    // Generic error handling
    sendError(
      res,
      CuttingListErrorCode.INTERNAL_ERROR,
      'Failed to create cutting list',
      { error: error.message }
    );
  }
}
```

---

## 📝 Migration Patterns

### Pattern 1: Simple GET Endpoint

```typescript
// BEFORE
async getCuttingList(req: Request, res: Response) {
  try {
    const list = await repository.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

// AFTER
async getCuttingList(req: Request, res: Response) {
  try {
    const { id } = getValidatedData<{ id: string }>(req);
    
    const list = await repository.findById(id);
    
    if (!list) {
      return sendError(
        res,
        CuttingListErrorCode.NOT_FOUND,
        'Cutting list not found',
        { id },
        404
      );
    }
    
    sendSuccess(res, list);
  } catch (error) {
    sendError(
      res,
      CuttingListErrorCode.INTERNAL_ERROR,
      'Failed to fetch cutting list',
      { error: error.message }
    );
  }
}
```

### Pattern 2: Paginated List Endpoint

```typescript
// BEFORE
async listCuttingLists(req: Request, res: Response) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  
  const lists = await repository.findAll(page, pageSize);
  res.json({ success: true, data: lists });
}

// AFTER
async listCuttingLists(req: Request, res: Response) {
  try {
    const query = getValidatedData<PaginationParams>(req);
    
    const { data, total } = await repository.findPaginated(query);
    
    const pagination = createPaginationMeta(
      query.page,
      query.pageSize,
      total
    );
    
    sendPaginated(res, data, pagination);
  } catch (error) {
    sendError(
      res,
      CuttingListErrorCode.INTERNAL_ERROR,
      'Failed to fetch cutting lists',
      { error: error.message }
    );
  }
}
```

### Pattern 3: POST with Validation

```typescript
// BEFORE
async addItem(req: Request, res: Response) {
  const { workOrderId, profiles, ...rest } = req.body;
  
  if (!workOrderId || !profiles || profiles.length === 0) {
    return res.status(400).json({
      error: 'Work order ID and at least one profile required'
    });
  }
  
  const item = await repository.addItem({ workOrderId, profiles, ...rest });
  res.json({ success: true, data: item });
}

// AFTER
async addItem(req: Request, res: Response) {
  try {
    // All validation done by middleware
    const data = getValidatedData<AddItemInput>(req);
    
    const item = await repository.addItem(data);
    
    sendSuccess(res, item, 201);
  } catch (error) {
    sendError(
      res,
      CuttingListErrorCode.INTERNAL_ERROR,
      'Failed to add item',
      { error: error.message }
    );
  }
}
```

### Pattern 4: Multiple Validations

```typescript
// Route definition
router.put('/cutting-list/:id',
  ...composeValidations({
    params: idParamSchema,
    body: updateCuttingListSchema
  }),
  controller.updateCuttingList
);

// Controller
async updateCuttingList(req: Request, res: Response) {
  try {
    const { id } = req.params; // Already validated
    const updates = getValidatedData<UpdateCuttingListInput>(req);
    
    const list = await repository.update(id, updates);
    
    sendSuccess(res, list);
  } catch (error) {
    sendError(
      res,
      CuttingListErrorCode.INTERNAL_ERROR,
      'Failed to update cutting list',
      { error: error.message }
    );
  }
}
```

---

## 🎯 Error Handling Patterns

### Database Errors

```typescript
try {
  // Database operation
} catch (error) {
  // Prisma unique constraint violation
  if (error.code === 'P2002') {
    return sendError(
      res,
      CuttingListErrorCode.DUPLICATE_WEEK_NUMBER,
      'Duplicate week number',
      { field: error.meta?.target },
      409
    );
  }
  
  // Prisma record not found
  if (error.code === 'P2025') {
    return sendError(
      res,
      CuttingListErrorCode.NOT_FOUND,
      'Record not found',
      {},
      404
    );
  }
  
  // Generic database error
  sendError(
    res,
    CuttingListErrorCode.DATABASE_ERROR,
    'Database operation failed',
    { error: error.message }
  );
}
```

### Business Logic Errors

```typescript
if (!hasPermission(user, 'cutting-list:delete')) {
  return sendError(
    res,
    CuttingListErrorCode.INSUFFICIENT_PERMISSIONS,
    'You do not have permission to delete cutting lists',
    { required: 'cutting-list:delete' },
    403
  );
}

if (list.status === 'COMPLETED') {
  return sendError(
    res,
    CuttingListErrorCode.INVALID_INPUT,
    'Cannot modify completed cutting list',
    { status: list.status },
    400
  );
}
```

---

## 📦 Benefits After Migration

### Before
```typescript
// Inconsistent responses
res.json({ success: true, data: list });
res.json({ data: list });
res.status(400).json({ error: 'Invalid input' });
res.json({ message: 'Success' });
```

### After
```typescript
// All responses include metadata
sendSuccess(res, data);
// {
//   success: true,
//   data: {...},
//   metadata: {
//     timestamp: "2025-11-09T10:00:00Z",
//     requestId: "REQ-1699523456-abc123",
//     version: "v1",
//     processingTime: 45
//   }
// }

sendError(res, CuttingListErrorCode.NOT_FOUND, 'Not found', { id });
// {
//   success: false,
//   error: {
//     code: "CUTTING_LIST_NOT_FOUND",
//     message: "Not found",
//     details: { id: "123" }
//   },
//   metadata: { ... }
// }
```

### Benefits
- ✅ **Consistent format**: All responses follow same structure
- ✅ **Type safety**: Compile-time validation prevents errors
- ✅ **Better debugging**: Request IDs trace through logs
- ✅ **Automatic metrics**: Processing time tracked
- ✅ **Frontend friendly**: Predictable response structure
- ✅ **Less code**: Validation and error handling simplified

---

## 🔄 Migration Steps

### Step 1: Add Validation to Routes (Low Risk)
Start by adding validation middleware to routes without changing controller logic:

```typescript
router.post('/cutting-list',
  validateBody(createCuttingListSchema),
  controller.createCuttingList
);
```

Controller can still access `req.body` normally, but validation ensures data is correct.

### Step 2: Update Controllers to Use Helpers (Medium Risk)
Replace response methods one endpoint at a time:

```typescript
// Replace
res.json({ success: true, data: list });

// With
sendSuccess(res, list);
```

### Step 3: Use getValidatedData (Low Risk)
Replace direct `req.body` access with validated data:

```typescript
// Replace
const { name } = req.body;

// With
const data = getValidatedData<CreateCuttingListInput>(req);
const { name } = data;
```

### Step 4: Test Each Endpoint
After updating each endpoint:
1. Test successful case
2. Test validation errors
3. Test error cases
4. Verify response format

---

## 🧪 Testing Examples

### Test Validation

```typescript
describe('POST /api/cutting-list', () => {
  it('should reject invalid week number', async () => {
    const response = await request(app)
      .post('/api/cutting-list')
      .send({ name: 'Test', weekNumber: 100 })
      .expect(400);
    
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: 'CUTTING_LIST_VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          errors: [
            { field: 'weekNumber', message: 'Week number must be at most 53' }
          ]
        }
      },
      metadata: {
        timestamp: expect.any(String),
        requestId: expect.stringMatching(/^REQ-/),
        version: 'v1'
      }
    });
  });
});
```

### Test Success Response

```typescript
it('should create cutting list with metadata', async () => {
  const response = await request(app)
    .post('/api/cutting-list')
    .send({ name: 'Test List', weekNumber: 27 })
    .expect(201);
  
  expect(response.body).toMatchObject({
    success: true,
    data: {
      id: expect.any(String),
      name: 'Test List',
      weekNumber: 27
    },
    metadata: {
      timestamp: expect.any(String),
      requestId: expect.stringMatching(/^REQ-/),
      version: 'v1',
      processingTime: expect.any(Number)
    }
  });
});
```

---

## 📊 Migration Progress Tracking

### Endpoints to Update (12 total)

- [ ] GET /cutting-list (list)
- [ ] POST /cutting-list (create)
- [ ] GET /cutting-list/:id (get)
- [ ] PUT /cutting-list/:id (update)
- [ ] DELETE /cutting-list/:id (delete)
- [ ] POST /cutting-list/:id/sections (add section)
- [ ] DELETE /cutting-list/:id/sections/:sectionId (delete section)
- [ ] POST /cutting-list/:id/sections/:sectionId/items (add item)
- [ ] PUT /cutting-list/:id/sections/:sectionId/items/:itemId (update item)
- [ ] DELETE /cutting-list/:id/sections/:sectionId/items/:itemId (delete item)
- [ ] POST /cutting-list/export/pdf (export PDF)
- [ ] POST /cutting-list/export/excel (export Excel)

### Suggested Order
1. Start with GET endpoints (read-only, safest)
2. Then POST endpoints (creates)
3. Then PUT/PATCH endpoints (updates)
4. Finally DELETE endpoints (destructive)

---

## 🎓 Best Practices

### 1. Always Use Type-Safe Validation
```typescript
// ✅ Good
const data = getValidatedData<CreateCuttingListInput>(req);

// ❌ Bad
const data = req.body; // No type safety
```

### 2. Use Specific Error Codes
```typescript
// ✅ Good
sendError(res, CuttingListErrorCode.DUPLICATE_WEEK_NUMBER, ...);

// ❌ Bad
sendError(res, 'ERROR', 'Something went wrong');
```

### 3. Include Helpful Error Details
```typescript
// ✅ Good
sendError(res, code, message, { weekNumber: 27, userId: user.id });

// ❌ Bad
sendError(res, code, message);
```

### 4. Log Before Sending Errors
```typescript
try {
  // ...
} catch (error) {
  logger.error('Failed to create cutting list', {
    error: error.message,
    userId: req.user?.id,
    requestId: req.requestId
  });
  
  sendError(res, code, message);
}
```

---

## 🔧 Troubleshooting

### Issue: "Request does not have validated data"
**Solution**: Ensure validation middleware is applied to the route:
```typescript
router.post('/endpoint',
  validateBody(schema), // Add this
  controller.method
);
```

### Issue: Validation passes but data is wrong
**Solution**: Check if schema matches your expectations. Test the schema:
```typescript
const result = schema.safeParse(testData);
console.log(result);
```

### Issue: Old response format still appearing
**Solution**: Check if you're calling `res.json()` directly instead of using `sendSuccess()`.

---

## 📚 Reference Files

- **Validation Schemas**: `backend/src/middleware/validation/cuttingListSchemas.ts`
- **Validation Middleware**: `backend/src/middleware/validation/validationMiddleware.ts`
- **Response Types**: `backend/src/types/apiResponse.ts`
- **Request Tracking**: `backend/src/middleware/requestTracking.ts`
- **Example Routes**: `backend/src/routes/cuttingListRoutesExample.ts`

---

## ✅ Checklist for Each Endpoint

- [ ] Add validation middleware to route
- [ ] Update controller to use `getValidatedData()`
- [ ] Replace `res.json()` with `sendSuccess()` or `sendError()`
- [ ] Use specific error codes from `CuttingListErrorCode`
- [ ] Add appropriate error handling
- [ ] Test validation errors
- [ ] Test success cases
- [ ] Test error cases
- [ ] Update tests to check new response format
- [ ] Document any breaking changes

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-09  
**Status**: Ready for implementation
