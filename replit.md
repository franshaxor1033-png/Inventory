# SCI-Ventory Pro

## Overview

SCI-Ventory Pro is a modern full-stack warehouse inventory management application designed specifically for cleaning service companies. The application serves admin users who need to track consumable goods (chemicals, equipment, machines) with comprehensive inventory control, asset management, and transaction logging capabilities. Built with a focus on performance, modern UI/UX design, and data visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side application is built with **React 18** using **Vite** as the build tool for optimal development experience and fast hot module replacement. The architecture follows a component-based design with:

- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** with **Shadcn/UI** component library for consistent, modern styling
- **Wouter** for lightweight client-side routing
- **React Hook Form** with **Zod** validation for robust form handling
- **TanStack React Query** for server state management, caching, and API synchronization

The UI follows a dashboard-centric design with dedicated sections for inventory management (items/assets), transaction processing, and reporting with interactive data visualizations using **Recharts**.

### Backend Architecture

The server-side uses **Node.js** with **Express.js** following a RESTful API design pattern. Key architectural decisions include:

- **JWT-based authentication** with bcrypt password hashing for security
- **Drizzle ORM** with **PostgreSQL** for type-safe database operations
- **Neon Database** as the serverless PostgreSQL provider
- **Middleware-based request/response logging** for debugging and monitoring
- **Error handling middleware** for consistent API error responses

The backend implements a layered architecture with separate concerns for routing, business logic (storage layer), and database access.

### Database Design

The PostgreSQL schema is designed around four core entities:

- **Users**: Authentication and role-based access control (ADMIN/USER roles)
- **Items**: Master catalog of inventory items with categories (KIMIA/PERALATAN/MESIN), stock levels, and minimum stock thresholds
- **Assets**: Individual trackable instances of items (particularly for machines) with status tracking (TERSEDIA/DIPINJAM/PERBAIKAN)
- **Transaction Logs**: Complete audit trail of all inventory movements with requester information and area assignment

The schema uses PostgreSQL enums for controlled vocabularies and UUID primary keys for better scalability and security.

### State Management

The application employs a hybrid state management approach:

- **Server state** managed by TanStack React Query with automatic caching, background refetching, and optimistic updates
- **Authentication state** managed by React Context API with localStorage persistence
- **Form state** handled by React Hook Form with Zod schema validation
- **UI state** managed locally within components using React hooks

### API Design

The REST API follows conventional HTTP methods and status codes with these endpoint patterns:

- Authentication: `/api/auth/*` (login, registration, token verification)
- Items: `/api/items/*` (CRUD operations, critical stock alerts, category filtering)
- Assets: `/api/assets/*` (CRUD operations, availability queries)
- Transactions: `/api/transactions/*` (creation, reporting, date range queries)
- Dashboard: `/api/dashboard/*` (statistics, usage trends, inventory composition)

All API endpoints require JWT authentication except for the login endpoint.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling and automatic scaling
- **Drizzle Kit**: Database migration and schema management tool

### Authentication & Security
- **bcrypt**: Password hashing for secure credential storage
- **jsonwebtoken**: JWT token generation and verification for stateless authentication

### UI/UX Libraries
- **Shadcn/UI**: Pre-built accessible React components built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system variables
- **Radix UI**: Headless UI components for accessibility and consistent behavior
- **Recharts**: React charting library for dashboard data visualization
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR for development and optimized production builds
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for server-side code compilation
- **Replit**: Development environment with live reload and error overlay plugins

### Runtime Dependencies
- **date-fns**: Date manipulation and formatting utilities
- **clsx** & **tailwind-merge**: Dynamic CSS class composition utilities
- **class-variance-authority**: Type-safe variant-based component styling