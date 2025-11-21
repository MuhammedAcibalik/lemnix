<div align="center">

# 🏭 LEMNIX

### Enterprise-Grade Aluminum Profile Cutting Optimization Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.19.0-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2B%20FSD-orange.svg)](docs/PROJE_YAPISI.md)

**Modern, scalable, and efficient solution for aluminum profile cutting optimization**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Performance](#-performance)
- [Security](#-security)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**LEMNIX** is an enterprise-grade web application designed to optimize aluminum profile cutting operations. By leveraging advanced mathematical algorithms and modern software architecture, LEMNIX minimizes material waste, maximizes cutting efficiency, and provides comprehensive analytics for manufacturing operations.

### Key Benefits

- **💰 Cost Reduction**: Minimize material waste through intelligent optimization algorithms
- **⚡ High Performance**: GPU-accelerated calculations for real-time optimization
- **📊 Data-Driven Insights**: Comprehensive analytics and reporting capabilities
- **🔒 Enterprise Security**: Role-based access control, encryption, and audit logging
- **📱 Responsive Design**: Zoom-aware UI that adapts to any resolution or zoom level
- **🏗️ Scalable Architecture**: Clean Architecture + Feature-Sliced Design (FSD)

---

## ✨ Features

### Core Functionality

- **🎯 Advanced Optimization Algorithms**
  - First Fit Decreasing (FFD) - Fast optimization for quick results
  - Best Fit Decreasing (BFD) - Waste minimization focused
  - Genetic Algorithm - Multi-objective optimization with GPU acceleration
  - Pooling Optimization - Group-based optimization strategies

- **📈 Real-Time Analytics**
  - Fire (waste) analysis and tracking
  - Color and size distribution analysis
  - Profile analysis and optimization metrics
  - Work order performance tracking

- **📋 Production Management**
  - Work order management and tracking
  - Production plan creation and optimization
  - Cutting list generation and visualization
  - Historical data analysis

- **📊 Reporting & Export**
  - Excel import/export with validation
  - PDF report generation
  - Visual cutting plans
  - Comprehensive analytics dashboards

- **🤖 Intelligent Suggestions**
  - ML-based product recommendations
  - Historical pattern analysis
  - Smart size suggestions
  - Adaptive learning system

### Enterprise Features

- **🔐 Security & Compliance**
  - JWT-based authentication
  - Role-based access control (RBAC)
  - Data encryption at rest and in transit
  - Comprehensive audit logging
  - Input validation and sanitization

- **⚡ Performance & Scalability**
  - GPU acceleration (NVIDIA > AMD > Intel auto-detection)
  - Database query optimization
  - Caching strategies
  - Rate limiting and circuit breakers
  - Progressive data loading

- **🎨 Modern UI/UX**
  - Material-UI v6 design system
  - Zoom-aware responsive design
  - Accessibility (WCAG 2.2 AA compliant)
  - Dark/light theme support
  - Smooth animations and transitions

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.19.0+ | Runtime environment |
| **TypeScript** | 5.9.2 | Type-safe development |
| **Express.js** | 4.18.2 | Web framework |
| **Prisma ORM** | 5.7.1+ | Database ORM |
| **PostgreSQL** | Latest | Primary database |
| **Zod** | 3.25.76 | Schema validation |
| **Winston** | 3.17.0 | Logging |
| **Vitest** | 3.2.4 | Testing framework |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0 | UI framework |
| **TypeScript** | 5.9.2 | Type-safe development |
| **Material-UI** | 6.2.0 | Component library |
| **TanStack Query** | 5.86.0 | Server state management |
| **Zustand** | 5.0.8 | UI state management |
| **React Hook Form** | 7.62.0 | Form management |
| **Vite** | 7.1.3 | Build tool |
| **Chart.js** | 4.5.0 | Data visualization |

### Architecture & Quality

- **Architecture**: Clean Architecture + Feature-Sliced Design (FSD)
- **Design Patterns**: SOLID principles, Factory, Strategy, Repository
- **Code Quality**: ESLint 9.34.0, Prettier, TypeScript Strict Mode
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **CI/CD**: Husky, lint-staged, pre-commit hooks

---

## 🏗️ Architecture

LEMNIX follows **Clean Architecture** principles combined with **Feature-Sliced Design (FSD)** methodology, ensuring maintainability, scalability, and testability.

### Project Structure

```
lemnix/
├── backend/                      # Backend application
│   ├── src/
│   │   ├── controllers/         # API controllers
│   │   ├── services/            # Business logic layer
│   │   │   ├── optimization/   # Optimization algorithms
│   │   │   ├── suggestions/     # ML-based suggestions
│   │   │   ├── analysis/        # Analytics services
│   │   │   ├── export/          # Export services
│   │   │   └── policies/        # Validation policies
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   ├── repositories/        # Data access layer
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utility functions
│   ├── prisma/                  # Database schema & migrations
│   └── tests/                   # Backend tests
│
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── app/                 # Application setup
│   │   ├── pages/               # Page components (FSD)
│   │   ├── widgets/             # Composite UI blocks (FSD)
│   │   ├── features/            # User actions (FSD)
│   │   ├── entities/            # Domain models (FSD)
│   │   └── shared/              # Shared utilities (FSD)
│   │       ├── ui/              # UI components
│   │       ├── api/             # API client
│   │       ├── hooks/           # Custom hooks
│   │       ├── lib/             # Libraries
│   │       └── config/          # Configuration
│   └── tests/                   # Frontend tests
│
└── docs/                         # Documentation
    ├── archive/                  # Historical documents
    ├── PROJE_YAPISI.md           # Project structure
    ├── DESIGN_SYSTEM_V3.md       # Design system docs
    └── PRODUCTION_READY_GUIDE.md # Production guide
```

### Architecture Principles

- **Clean Architecture**: Separation of concerns with clear layer boundaries
- **Feature-Sliced Design**: Scalable frontend architecture
- **SOLID Principles**: Maintainable and extensible codebase
- **Type Safety**: Strict TypeScript configuration
- **Testability**: Pure functions, dependency injection, mocking support

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.19.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 14.0 (for production)
- **Docker** (optional, for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/lemnix.git
   cd lemnix
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   cd backend
   npm run db:generate    # Generate Prisma client
   npm run db:migrate      # Run migrations
   npm run db:seed         # Seed initial data (optional)
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev              # Starts both backend and frontend
   
   # Or separately:
   npm run dev:backend      # Backend only (port 3001)
   npm run dev:frontend     # Frontend only (port 3000)
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

---

## 💻 Development

### Available Scripts

#### Root Level
```bash
npm run dev              # Start both backend and frontend
npm run build            # Build both applications
npm run lint             # Lint all code
npm run format           # Format all code
npm run type-check       # Type check all code
npm run install:all      # Install all dependencies
```

#### Backend
```bash
cd backend
npm run dev              # Development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
```

#### Frontend
```bash
cd frontend
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests
npm run test:e2e         # Run E2E tests
npm run lint             # Lint code
npm run format           # Format code
```

### Code Quality Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks
- **lint-staged**: Run linters on staged files

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint` and `npm run type-check`
4. Commit with conventional commit messages
5. Push and create a Pull Request

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Cutting Lists
```http
GET    /api/cutting-list              # List all cutting lists
POST   /api/cutting-list              # Create new cutting list
GET    /api/cutting-list/:id          # Get specific cutting list
PUT    /api/cutting-list/:id          # Update cutting list
DELETE /api/cutting-list/:id          # Delete cutting list
```

#### Optimization
```http
POST   /api/enterprise/optimize        # Run optimization
GET    /api/enterprise/optimize/:id    # Get optimization result
```

#### Statistics
```http
GET    /api/statistics/color-size-analysis    # Color/size analysis
GET    /api/statistics/profile-analysis        # Profile analysis
GET    /api/statistics/work-order-analysis     # Work order analysis
```

#### Production Plans
```http
GET    /api/production-plan            # List production plans
POST   /api/production-plan            # Create production plan
GET    /api/production-plan/:id        # Get specific plan
```

For detailed API documentation, see [docs/ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md](./docs/ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md).

---

## ⚡ Performance

### Benchmarks

- **Backend Response Time**: < 100ms (average)
- **Frontend Load Time**: < 2s (first load)
- **Optimization Time**: < 5s (1000 cuts)
- **Memory Usage**: < 500MB (normal operations)
- **Database Queries**: Optimized with indexes and connection pooling

### Optimization Features

- GPU acceleration for genetic algorithm
- Database query optimization
- Response caching
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization

---

## 🔒 Security

### Security Features

- **Authentication**: JWT token-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured cross-origin control
- **Encryption**: Data encryption at rest and in transit
- **Audit Logging**: Comprehensive activity tracking
- **Error Handling**: Secure error messages (no sensitive data exposure)

### Security Best Practices

- Environment variables for sensitive data
- SQL injection prevention (Prisma ORM)
- XSS protection (React default)
- CSRF protection
- Secure headers (Helmet.js)
- Regular dependency updates

---

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Core business logic and utilities
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React components with React Testing Library
- **E2E Tests**: Critical user flows with Playwright

### Running Tests

```bash
# Backend tests
cd backend
npm run test              # Run all tests
npm run test:coverage     # With coverage report

# Frontend tests
cd frontend
npm run test              # Unit and component tests
npm run test:e2e          # E2E tests
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[PROJE_YAPISI.md](./docs/PROJE_YAPISI.md)** - Project structure and architecture
- **[COMPREHENSIVE_PROJECT_ANALYSIS.md](./docs/COMPREHENSIVE_PROJECT_ANALYSIS.md)** - Detailed project analysis
- **[DESIGN_SYSTEM_V3.md](./docs/DESIGN_SYSTEM_V3.md)** - Design system documentation
- **[ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md](./docs/ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md)** - Optimization algorithms guide
- **[PRODUCTION_READY_GUIDE.md](./docs/PRODUCTION_READY_GUIDE.md)** - Production deployment guide
- **[UI_UX_MODERNIZATION_V3.md](./docs/UI_UX_MODERNIZATION_V3.md)** - UI/UX design documentation

For additional documentation, see [docs/README.md](./docs/README.md).

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Contribution Process

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Run tests** (`npm run test`)
5. **Run linters** (`npm run lint`)
6. **Commit your changes** (use conventional commits)
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Coding Standards

- Follow TypeScript strict mode
- Adhere to Clean Architecture principles
- Use Feature-Sliced Design for frontend
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages

### Code Review

All contributions require code review. Please ensure:
- Code follows project standards
- Tests are included and passing
- Documentation is updated
- No breaking changes (or properly documented)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**LEMNIX Development Team**

For questions, support, or collaboration inquiries, please open an issue on GitHub.

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Real-time collaboration
- [ ] Advanced ML models for optimization
- [ ] Mobile application
- [ ] Multi-language support
- [ ] Advanced reporting dashboard
- [ ] Integration with ERP systems

### Version History

- **v2.0.0** - Modern architecture refactor, performance improvements, UI/UX modernization
- **v1.0.0** - Initial release

---

<div align="center">

**Built with ❤️ by the LEMNIX Team**

[Report Bug](https://github.com/your-org/lemnix/issues) • [Request Feature](https://github.com/your-org/lemnix/issues) • [Documentation](./docs/README.md)

</div>
