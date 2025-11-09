# API Validation Guide - Zod Best Practices

## Overview

All API endpoints MUST have proper input validation using Zod schemas. This prevents:
- SQL injection
- XSS attacks
- Type confusion bugs
- Invalid data in database
- Crashes from malformed input

---

## Setup

### 1. Validation Middleware

Use the centralized validation middleware:

```typescript
import { validate, validateAll } from '@/middleware/zodValidation';
```

### 2. Define Schemas

Create Zod schemas in `types/` or `validation/` folder:

```typescript
// types/userSchemas.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().positive().optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

### 3. Apply to Routes

```typescript
import { Router } from 'express';
import { validate } from '@/middleware/zodValidation';
import { createUserSchema } from '@/types/userSchemas';
import { userController } from '@/controllers/userController';

const router = Router();

router.post('/users',
  validate(createUserSchema, 'body'),
  userController.createUser
);

export default router;
```

---

## Validation Patterns

### Body Validation

```typescript
const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
});

router.post('/items',
  validate(createItemSchema, 'body'),
  controller.createItem
);
```

### Query Validation

```typescript
const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive().max(100)).default('20'),
});

router.get('/search',
  validate(searchQuerySchema, 'query'),
  controller.search
);
```

### Params Validation

```typescript
const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

router.get('/items/:id',
  validate(idParamSchema, 'params'),
  controller.getItem
);
```

### Multiple Target Validation

```typescript
router.put('/items/:id',
  validateAll({
    params: z.object({ id: z.string().uuid() }),
    body: updateItemSchema,
  }),
  controller.updateItem
);
```

---

## Schema Best Practices

### 1. String Validation

```typescript
const stringSchema = z.object({
  // Basic string
  name: z.string(),
  
  // Min/max length
  username: z.string().min(3).max(20),
  
  // Email
  email: z.string().email(),
  
  // URL
  website: z.string().url(),
  
  // Regex pattern
  phone: z.string().regex(/^\+\d{1,3}\d{9,}$/),
  
  // Enum
  status: z.enum(['active', 'inactive', 'pending']),
  
  // Trim whitespace
  description: z.string().trim(),
  
  // Transform
  slug: z.string().toLowerCase().transform(val => val.replace(/\s+/g, '-')),
});
```

### 2. Number Validation

```typescript
const numberSchema = z.object({
  // Integer
  age: z.number().int(),
  
  // Positive
  price: z.number().positive(),
  
  // Range
  rating: z.number().min(1).max(5),
  
  // Transform from string
  page: z.string().transform(Number).pipe(z.number().int().positive()),
});
```

### 3. Array Validation

```typescript
const arraySchema = z.object({
  // Array of strings
  tags: z.array(z.string()).min(1).max(10),
  
  // Array of objects
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
    })
  ).nonempty(),
  
  // Optional array
  categories: z.array(z.string()).optional(),
});
```

### 4. Object Validation

```typescript
const nestedSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    settings: z.object({
      theme: z.enum(['light', 'dark']),
      notifications: z.boolean(),
    }).optional(),
  }),
});
```

### 5. Date Validation

```typescript
const dateSchema = z.object({
  // ISO string
  createdAt: z.string().datetime(),
  
  // Date object
  updatedAt: z.date(),
  
  // Transform string to Date
  birthDate: z.string().transform(val => new Date(val)),
});
```

### 6. Custom Validation

```typescript
const customSchema = z.object({
  password: z.string().min(8).refine(
    (val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val),
    'Password must contain uppercase, lowercase, and number'
  ),
  
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);
```

---

## Error Handling

Validation errors return standardized format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for body",
    "details": [
      {
        "path": ["email"],
        "message": "Invalid email format",
        "code": "invalid_string"
      }
    ],
    "timestamp": "2025-10-07T17:30:00.000Z"
  }
}
```

---

## Migration Checklist

For each endpoint:

- [ ] Define Zod schema for request
- [ ] Add `validate()` middleware to route
- [ ] Update controller to use typed DTO
- [ ] Test with invalid data
- [ ] Document expected format

---

## Examples by Route Type

### POST /api/items

```typescript
// Schema
const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'food']),
  tags: z.array(z.string()).max(5).optional(),
});

// Route
router.post('/items',
  validate(createItemSchema, 'body'),
  controller.createItem
);

// Controller
async createItem(req: Request, res: Response) {
  const data: CreateItemDto = req.body; // Already validated & typed
  // ...
}
```

### GET /api/items/:id

```typescript
// Schema
const getItemSchema = z.object({
  id: z.string().uuid(),
});

// Route
router.get('/items/:id',
  validate(getItemSchema, 'params'),
  controller.getItem
);
```

### PUT /api/items/:id

```typescript
// Schemas
const paramsSchema = z.object({
  id: z.string().uuid(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
}).strict(); // Don't allow extra fields

// Route
router.put('/items/:id',
  validateAll({
    params: paramsSchema,
    body: updateSchema,
  }),
  controller.updateItem
);
```

---

## Security Considerations

1. **Always validate**: Never trust client input
2. **Sanitize strings**: Use `.trim()` on all string inputs
3. **Limit array sizes**: Use `.max()` to prevent DoS
4. **Validate types**: Ensure numbers are numbers, not strings
5. **Whitelist fields**: Use `.strict()` to reject extra fields
6. **Rate limit**: Combine with rate limiting middleware

---

## Performance Tips

1. **Schema caching**: Define schemas once at module level
2. **Lazy loading**: Import schemas only when needed
3. **Transform wisely**: Avoid heavy transformations in schemas
4. **Early validation**: Validate as early as possible in middleware chain

---

## Current Status

### ✅ Implemented

- `zodValidation` middleware created
- Validation error format standardized

### ⚠️ Needs Implementation

Audit all routes and add validation:

1. `/api/cutting-list/*`
2. `/api/enterprise/*`
3. `/api/statistics/*`
4. `/api/webgpu/*`

Use this guide to systematically add validation to all endpoints.

