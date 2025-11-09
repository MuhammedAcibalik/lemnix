# Kesim Listesi - Teknik Spesifikasyon Dokümantasyonu

## 📋 Doküman Bilgisi
- **Başlık**: Kesim Listesi Teknik Spesifikasyonu
- **Versiyon**: 1.0.0
- **Tarih**: 2025-11-09
- **Durum**: ACTIVE
- **Yazar**: AI Development Assistant

---

## 🎯 Genel Bakış

### Tanım
Kesim Listesi (Cutting List), alüminyum profil kesim işlemlerini organize etmek için kullanılan merkezi veri yapısıdır. Her liste:
- Bir hafta numarası ile tanımlanır
- Birden fazla ürün bölümü (product section) içerir
- Her bölümde birden fazla iş emri (work order) bulunur
- Her iş emrinde birden fazla profil kesimi yer alır

### Temel İşlevler
1. **CRUD Operasyonları**: Create, Read, Update, Delete
2. **Section Management**: Ürün bölümlerinin yönetimi
3. **Item Management**: İş emirlerinin yönetimi
4. **Export Operations**: PDF ve Excel çıktıları
5. **Smart Suggestions**: AI destekli öneriler
6. **Optimization Integration**: Kesim optimizasyonu entegrasyonu

---

## 🗄️ Veritabanı Şeması

### Tablo: cutting_lists

```sql
CREATE TABLE cutting_lists (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  description           TEXT,
  status                TEXT DEFAULT 'draft' NOT NULL,
  created_at            TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metadata              JSONB,
  week_number           INTEGER,
  sections              JSONB,
  
  CONSTRAINT unique_user_week UNIQUE (user_id, week_number)
);

-- Indexes
CREATE INDEX idx_cutting_lists_user_status 
  ON cutting_lists (user_id, status);

CREATE INDEX idx_cutting_lists_week_status 
  ON cutting_lists (week_number, status);

CREATE INDEX idx_cutting_lists_created_desc 
  ON cutting_lists (created_at DESC);

CREATE INDEX idx_cutting_lists_sections_gin 
  ON cutting_lists USING GIN (sections jsonb_path_ops);

CREATE INDEX idx_cutting_lists_metadata_gin 
  ON cutting_lists USING GIN (metadata jsonb_path_ops);
```

### Tablo: cutting_list_items

```sql
CREATE TABLE cutting_list_items (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id           TEXT NOT NULL,
  date                    TEXT,
  color                   TEXT NOT NULL,
  version                 TEXT NOT NULL,
  size                    TEXT NOT NULL,
  profile_type            TEXT NOT NULL,
  length                  FLOAT NOT NULL,
  quantity                INTEGER NOT NULL,
  order_quantity          INTEGER,
  cutting_pattern         TEXT,
  notes                   TEXT,
  priority                TEXT DEFAULT 'medium' NOT NULL,
  status                  TEXT DEFAULT 'draft' NOT NULL,
  created_at              TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMP DEFAULT NOW() NOT NULL,
  cutting_list_id         TEXT NOT NULL REFERENCES cutting_lists(id) ON DELETE CASCADE,
  material_description    TEXT,
  material_number         TEXT,
  production_plan_item_id TEXT,
  
  CHECK (quantity > 0),
  CHECK (length > 0)
);

-- Indexes
CREATE INDEX idx_cutting_list_items_list_id 
  ON cutting_list_items (cutting_list_id);

CREATE INDEX idx_cutting_list_items_work_order 
  ON cutting_list_items (work_order_id);

CREATE INDEX idx_cutting_list_items_profile_color 
  ON cutting_list_items (profile_type, color);

CREATE INDEX idx_cutting_list_items_status_priority 
  ON cutting_list_items (status, priority);

CREATE INDEX idx_cutting_list_items_material_number 
  ON cutting_list_items (material_number);
```

### Veri İlişkileri

```
User (1) ─────── (*) CuttingList
                       │
                       ├──── (*) CuttingListItem
                       ├──── (*) CuttingListStatistics
                       └──── (*) ProductionPlanItem
```

---

## 🔌 API Spesifikasyonu

### Base URL
```
Production:  https://api.lemnix.com/api
Development: http://localhost:3001/api
```

### Authentication
```http
Authorization: Bearer <JWT_TOKEN>
```

### Common Headers
```http
Content-Type: application/json
Accept: application/json
X-Request-ID: <unique-request-id>
```

---

## 📡 API Endpoints

### 1. List Cutting Lists

**Endpoint**: `GET /cutting-list`

**Query Parameters**:
```typescript
interface QueryParams {
  page?: number;          // Default: 1
  pageSize?: number;      // Default: 20, Max: 100
  sortBy?: string;        // Default: 'createdAt'
  order?: 'asc' | 'desc'; // Default: 'desc'
  status?: string[];      // Filter by status
  weekNumber?: number;    // Filter by week
  search?: string;        // Search in name/description
}
```

**Example Request**:
```bash
curl -X GET \
  'https://api.lemnix.com/api/cutting-list?page=1&pageSize=20&status=draft,ready' \
  -H 'Authorization: Bearer <token>'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "clxyz123",
      "title": "27. HAFTA KESİM LİSTESİ",
      "weekNumber": 27,
      "status": "draft",
      "sections": [
        {
          "id": "section-1",
          "productName": "KAPI",
          "items": [
            {
              "id": "item-1",
              "workOrderId": "WO-123",
              "date": "2024-01-15",
              "version": "1.0",
              "color": "RAL 9010",
              "size": "80x80",
              "orderQuantity": 100,
              "priority": "high",
              "status": "draft",
              "profiles": [
                {
                  "id": "profile-1",
                  "profile": "6063",
                  "measurement": "2500mm",
                  "quantity": 200
                }
              ]
            }
          ]
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "metadata": {
    "timestamp": "2024-01-15T14:30:00Z",
    "requestId": "REQ-123456",
    "version": "v1"
  }
}
```

---

### 2. Create Cutting List

**Endpoint**: `POST /cutting-list`

**Request Body**:
```json
{
  "name": "28. HAFTA KESİM LİSTESİ",
  "weekNumber": 28,
  "description": "Optional description"
}
```

**Validation Rules**:
- `name`: Required, 3-100 characters
- `weekNumber`: Required, integer between 1-52
- `description`: Optional, max 500 characters

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "clxyz456",
    "title": "28. HAFTA KESİM LİSTESİ",
    "weekNumber": 28,
    "status": "draft",
    "sections": [],
    "createdAt": "2024-01-15T15:00:00Z",
    "updatedAt": "2024-01-15T15:00:00Z"
  },
  "metadata": {
    "timestamp": "2024-01-15T15:00:00Z",
    "requestId": "REQ-123457"
  }
}
```

**Error Responses**:

```json
// 409 Conflict - Duplicate week number
{
  "success": false,
  "error": {
    "message": "28. Hafta için zaten bir kesim listesi mevcut",
    "code": "DUPLICATE_WEEK_NUMBER",
    "details": {
      "weekNumber": 28,
      "existingListId": "clxyz123"
    }
  }
}

// 400 Bad Request - Validation error
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "weekNumber": "Week number must be between 1 and 52"
    }
  }
}
```

---

### 3. Get Cutting List by ID

**Endpoint**: `GET /cutting-list/:id`

**Path Parameters**:
- `id`: Cutting list ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clxyz123",
    "title": "27. HAFTA KESİM LİSTESİ",
    "weekNumber": 27,
    "status": "draft",
    "sections": [...],
    "statistics": {
      "totalItems": 45,
      "totalProfiles": 120,
      "totalQuantity": 3500,
      "completionRate": 0.65
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "message": "Cutting list not found",
    "code": "NOT_FOUND"
  }
}
```

---

### 4. Update Cutting List

**Endpoint**: `PUT /cutting-list/:id`

**Request Body**:
```json
{
  "name": "27. HAFTA KESİM LİSTESİ (Güncellenmiş)",
  "status": "ready",
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clxyz123",
    "title": "27. HAFTA KESİM LİSTESİ (Güncellenmiş)",
    "status": "ready",
    // ... full object
  }
}
```

---

### 5. Delete Cutting List

**Endpoint**: `DELETE /cutting-list/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Cutting list deleted successfully"
  }
}
```

---

### 6. Add Product Section

**Endpoint**: `POST /cutting-list/:cuttingListId/sections`

**Request Body**:
```json
{
  "productName": "PENCERE"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "section-2",
    "productName": "PENCERE",
    "items": [],
    "createdAt": "2024-01-15T15:30:00Z",
    "updatedAt": "2024-01-15T15:30:00Z"
  }
}
```

---

### 7. Add Item to Section

**Endpoint**: `POST /cutting-list/:cuttingListId/sections/:sectionId/items`

**Request Body**:
```json
{
  "workOrderId": "WO-456",
  "date": "2024-01-15",
  "version": "1.0",
  "color": "RAL 9010",
  "size": "60x60",
  "orderQuantity": 50,
  "priority": "medium",
  "status": "draft",
  "note": "Optional note",
  "profiles": [
    {
      "profile": "6063",
      "measurement": "2000mm",
      "quantity": 100
    },
    {
      "profile": "6060",
      "measurement": "1500mm",
      "quantity": 100
    }
  ]
}
```

**Validation Rules**:
- `workOrderId`: Required, non-empty string
- `date`: Required, format: YYYY-MM-DD
- `version`: Required, non-empty string
- `color`: Required, non-empty string
- `size`: Required, non-empty string
- `orderQuantity`: Required, positive integer
- `profiles`: Required, array with at least 1 item
  - `profile`: Required, non-empty string
  - `measurement`: Required, format: {number}mm
  - `quantity`: Required, positive integer
- `priority`: Optional, enum: low|medium|high|urgent
- `status`: Optional, enum: draft|ready|processing|completed

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "item-2",
    "workOrderId": "WO-456",
    "cuttingListId": "clxyz123",
    "sectionId": "section-1",
    // ... full object
  }
}
```

---

### 8. Update Item

**Endpoint**: `PUT /cutting-list/:cuttingListId/sections/:sectionId/items/:itemId`

**Request Body**: Same as add item

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "item-2",
    // ... updated object
  }
}
```

---

### 9. Delete Item

**Endpoint**: `DELETE /cutting-list/:cuttingListId/sections/:sectionId/items/:itemId`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Item deleted successfully"
  }
}
```

---

### 10. Export to PDF

**Endpoint**: `POST /cutting-list/export/pdf`

**Request Body**:
```json
{
  "cuttingList": {
    "id": "clxyz123",
    "title": "27. HAFTA KESİM LİSTESİ",
    "weekNumber": 27,
    "sections": [...]
  }
}
```

**Response Headers**:
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="27_HAFTA_KESIM_LISTESI.pdf"
Content-Length: 245678
```

**Response**: Binary PDF data

---

### 11. Export to Excel

**Endpoint**: `POST /cutting-list/export/excel`

**Request Body**: Same as PDF export

**Response Headers**:
```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="27_HAFTA_KESIM_LISTESI.xlsx"
Content-Length: 123456
```

**Response**: Binary Excel data

---

### 12. Get Smart Suggestions

**Endpoint**: `GET /cutting-list/suggestions/profiles`

**Query Parameters**:
```typescript
interface SuggestionQuery {
  productName: string;  // Required
  size: string;         // Required
  limit?: number;       // Default: 15, Max: 50
}
```

**Example Request**:
```bash
curl -X GET \
  'https://api.lemnix.com/api/cutting-list/suggestions/profiles?productName=KAPI&size=80x80&limit=10' \
  -H 'Authorization: Bearer <token>'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "profile": "6063",
        "measurement": "2500mm",
        "quantity": 200,
        "confidence": 0.95,
        "frequency": 45,
        "lastUsed": "2024-01-14T10:00:00Z",
        "reasoning": "This profile is commonly used for KAPI 80x80. Used 45 times in last 3 months."
      },
      {
        "profile": "6060",
        "measurement": "2000mm",
        "quantity": 200,
        "confidence": 0.87,
        "frequency": 32,
        "lastUsed": "2024-01-13T15:30:00Z",
        "reasoning": "Alternative profile option with high compatibility."
      }
    ],
    "contextualInsights": [
      "Based on historical data from 45 similar work orders",
      "Average order quantity for this size is 150-250 units",
      "Most common profile combination: 6063 + 6060"
    ]
  }
}
```

---

## 📊 Veri Modelleri

### TypeScript Interfaces

```typescript
// Core types
export interface CuttingList {
  id: string;
  title: string;
  weekNumber: number;
  status: CuttingListStatus;
  description?: string;
  sections: ProductSection[];
  statistics?: CuttingListStatistics;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

export enum CuttingListStatus {
  DRAFT = 'draft',
  READY = 'ready',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export interface ProductSection {
  id: string;
  productName: string;
  items: WorkOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  size: string;
  orderQuantity: number;
  priority: ItemPriority;
  status: CuttingListStatus;
  note?: string;
  profiles: ProfileItem[];
  createdAt: string;
  updatedAt: string;
}

export enum ItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ProfileItem {
  id: string;
  profile: string;
  measurement: string;  // Format: "2500mm"
  quantity: number;
}

export interface CuttingListStatistics {
  totalItems: number;
  totalProfiles: number;
  totalQuantity: number;
  averageWastePercent: number;
  optimizationCount: number;
  completionRate: number;
  efficiencyScore: number;
}
```

---

## 🔐 Güvenlik

### Authentication
- JWT token-based authentication
- Token expiry: 24 hours
- Refresh token: 7 days

### Authorization
```typescript
// Permission levels
enum Permission {
  READ = 'cutting-list:read',
  CREATE = 'cutting-list:create',
  UPDATE = 'cutting-list:update',
  DELETE = 'cutting-list:delete',
  EXPORT = 'cutting-list:export'
}

// Role mappings
const ROLE_PERMISSIONS = {
  admin: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.DELETE, Permission.EXPORT],
  planner: [Permission.READ, Permission.CREATE, Permission.UPDATE, Permission.EXPORT],
  viewer: [Permission.READ]
};
```

### Rate Limiting
```typescript
// API rate limits
const RATE_LIMITS = {
  // Standard endpoints
  standard: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100                    // 100 requests
  },
  
  // Export endpoints (more restrictive)
  export: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 10                     // 10 exports
  },
  
  // Suggestion endpoints
  suggestions: {
    windowMs: 1 * 60 * 1000,   // 1 minute
    max: 30                     // 30 requests
  }
};
```

### Input Validation
- All inputs validated with Zod schemas
- SQL injection prevention (Prisma ORM)
- XSS prevention (sanitized outputs)
- CSRF protection

---

## 🧪 Testing

### Unit Tests
```typescript
describe('CuttingListService', () => {
  describe('create', () => {
    it('should create a cutting list with valid data', async () => {
      const input = {
        name: 'Test List',
        weekNumber: 27,
        userId: 'user-123'
      };
      
      const result = await service.create(input);
      
      expect(result).toMatchObject({
        name: 'Test List',
        weekNumber: 27,
        status: CuttingListStatus.DRAFT
      });
    });
    
    it('should reject duplicate week number', async () => {
      // Given: existing list for week 27
      await service.create({
        name: 'Existing',
        weekNumber: 27,
        userId: 'user-123'
      });
      
      // When: trying to create another for same week
      const promise = service.create({
        name: 'Duplicate',
        weekNumber: 27,
        userId: 'user-123'
      });
      
      // Then: should reject
      await expect(promise).rejects.toThrow('Duplicate week number');
    });
  });
});
```

### Integration Tests
```typescript
describe('POST /api/cutting-list', () => {
  it('should create cutting list and return 201', async () => {
    const response = await request(app)
      .post('/api/cutting-list')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        name: 'Test List',
        weekNumber: 27
      })
      .expect(201);
    
    expect(response.body).toMatchObject({
      success: true,
      data: {
        title: 'Test List',
        weekNumber: 27,
        status: 'draft'
      }
    });
  });
});
```

---

## 📈 Performance

### Benchmarks
```typescript
// Target performance metrics
const PERFORMANCE_TARGETS = {
  // API response times (p95)
  listCuttingLists: 200,      // ms
  getCuttingListById: 150,    // ms
  createCuttingList: 300,     // ms
  addItemToSection: 250,      // ms
  exportToPDF: 5000,          // ms
  exportToExcel: 3000,        // ms
  
  // Database query times (p95)
  findAll: 50,                // ms
  findById: 30,               // ms
  create: 100,                // ms
  update: 80,                 // ms
  
  // Frontend load times
  pageLoad: 2000,             // ms
  timeToInteractive: 3000     // ms
};
```

### Caching Strategy
```typescript
// Redis cache configuration
const CACHE_CONFIG = {
  // Cutting list cache
  cuttingList: {
    ttl: 300,                 // 5 minutes
    prefix: 'cutting-list:',
    invalidateOn: ['create', 'update', 'delete']
  },
  
  // Suggestions cache
  suggestions: {
    ttl: 3600,                // 1 hour
    prefix: 'suggestions:',
    invalidateOn: ['item:create']
  }
};
```

---

## 🐛 Error Handling

### Error Codes
```typescript
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Not found errors (404)
  NOT_FOUND = 'NOT_FOUND',
  CUTTING_LIST_NOT_FOUND = 'CUTTING_LIST_NOT_FOUND',
  SECTION_NOT_FOUND = 'SECTION_NOT_FOUND',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_WEEK_NUMBER = 'DUPLICATE_WEEK_NUMBER',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXPORT_ERROR = 'EXPORT_ERROR'
}
```

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    details?: Record<string, unknown>;
    stack?: string;  // Only in development
  };
  metadata: {
    timestamp: string;
    requestId: string;
  };
}
```

---

## 📝 Change Log

### Version 1.0.0 (Current)
- ✅ PostgreSQL migration completed
- ✅ CRUD operations implemented
- ✅ Section and item management
- ✅ PDF and Excel export
- ✅ Smart suggestions
- ✅ Repository pattern
- ✅ Redis caching

### Planned (v1.1.0)
- [ ] Enum types for status/priority
- [ ] Pagination support
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] Soft delete

### Future (v2.0.0)
- [ ] Normalized data structure
- [ ] Version control
- [ ] Real-time collaboration
- [ ] GraphQL API

---

## 📚 Referanslar

### İlgili Dokümanlar
1. [KESIM_LISTESI_COMPREHENSIVE_ANALYSIS.md](./KESIM_LISTESI_COMPREHENSIVE_ANALYSIS.md)
2. [KESIM_LISTESI_IMPROVEMENT_ROADMAP.md](./KESIM_LISTESI_IMPROVEMENT_ROADMAP.md)
3. [COMPREHENSIVE_PROJECT_ANALYSIS.md](./COMPREHENSIVE_PROJECT_ANALYSIS.md)

### Dış Kaynaklar
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Son Güncelleme**: 2025-11-09  
**Versiyon**: 1.0.0  
**Durum**: ACTIVE
