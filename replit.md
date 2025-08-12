# Overview

This is a full-stack web application that provides a REST API backend with a React frontend for managing Shopify customer account data. The application serves as a customer account backend system with comprehensive API endpoints, real-time monitoring, webhook management, and interactive documentation. It features a modern dashboard interface for exploring APIs, managing webhooks, viewing system logs, and configuring application settings.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark mode enabled)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Hookform resolvers for validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured endpoint organization
- **Error Handling**: Centralized error middleware with status code management
- **Logging**: Custom request/response logging middleware with timing metrics
- **Development**: Hot module replacement via Vite integration

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Provider**: Neon Database for PostgreSQL hosting
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Serverless database connection with connection pooling
- **Fallback Storage**: In-memory storage implementation for development/testing

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: Built-in CORS handling and request validation
- **API Security**: Request rate limiting and structured error responses

## External Service Integrations
- **Primary Integration**: Shopify Admin API for customer and order data synchronization
- **Webhook System**: Configurable webhook endpoints for real-time event processing
- **API Monitoring**: Built-in API call logging and performance metrics tracking
- **Configuration Management**: Environment-based configuration with encrypted sensitive data support

## Development and Deployment
- **Build System**: Separate build processes for client (Vite) and server (esbuild)
- **Development Environment**: Integrated development setup with Replit-specific tooling
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Code Quality**: Consistent code formatting and type checking across the stack