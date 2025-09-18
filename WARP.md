# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Development
```bash
# Start development server
yarn dev

# Alternative with npm
npm run dev
```

### Building and Linting
```bash
# Build for production
yarn build

# Lint the codebase
yarn lint

# Preview production build locally
yarn preview
```

### Testing Individual Components
```bash
# Test specific component by running dev and navigating to route
yarn dev
# Then visit: http://localhost:5173/models for Models page
# Or: http://localhost:5173/admin/dashboard for Admin dashboard
```

### Deployment
```bash
# Prepare and deploy to Firebase (runs custom scripts)
node deploy.mjs

# Fix build issues if needed
node fix-build.mjs

# Manual Firebase deployment
firebase deploy --only hosting
```

### Service-Specific Testing
```bash
# Test authentication flows
yarn dev
# Navigate to /login, /register, /forgot-password

# Test admin features (requires QUAN_TRI role)
yarn dev
# Navigate to /admin/dashboard, /admin/users, /admin/products
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **UI Components**: Ant Design v5
- **Authentication**: Firebase Auth + Custom JWT
- **Maps**: Leaflet + React Leaflet
- **Animation**: Framer Motion
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Hosting**: Firebase Hosting

### Application Structure

#### Core Architecture Patterns
- **Context-based State Management**: Uses React Context for authentication, notifications, and theme
- **Role-based Access Control**: Multi-tier user roles (QUAN_TRI/Admin, BAN_HANG/Sales, HO_TRO/Support, KHACH_HANG/Customer)
- **Hybrid Authentication**: Supports both Firebase social login and custom JWT authentication
- **Component-based Architecture**: Modular components organized by feature and shared functionality

#### Key Directories
- `src/context/` - React Context providers for global state
- `src/services/` - API service layer for backend communication
- `src/components/` - Reusable UI components organized by type
- `src/context/pages/` - Page components organized by feature area
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions and animations

#### Authentication Flow
The app uses a hybrid authentication system:
1. **Firebase Social Auth**: Google, Facebook, GitHub login via Firebase
2. **Custom JWT Auth**: Email/password login with backend-issued JWT tokens
3. **Token Validation**: Automatic token refresh and 401 handling
4. **Role-based Routing**: Different user roles redirect to appropriate dashboards

#### Backend Integration
- **Development**: Proxies to `localhost:8080` via Vite config
- **Production**: Uses `VITE_API_URL` environment variable pointing to backend
- **API Structure**: RESTful API with `/api/v1` prefix

#### Deployment Architecture
- **Build Process**: Vite bundler with TypeScript compilation
- **Asset Handling**: Supports GLB/GLTF 3D models, images, and static assets
- **Firebase Hosting**: SPA configuration with catch-all routing
- **Environment Handling**: Different API endpoints for dev/prod

### Important Configuration Files
- `vite.config.ts` - Development server proxy and build configuration
- `firebase.json` - Firebase hosting rewrites for SPA routing  
- `eslint.config.js` - ESLint configuration with React and TypeScript rules
- `tsconfig.json` - TypeScript project references configuration

### Development Patterns
- **Protected Routes**: Use `<ProtectedRoute>` wrapper for authenticated pages
- **Role-based Routes**: Use `<RoleBasedRoute>` with specific role requirements
- **Error Boundaries**: Wrap sensitive components with `<ErrorBoundary>`
- **Notifications**: Use `useNotification()` hook for user feedback
- **Theme Support**: Light/dark mode via `useTheme()` hook

### Key Features
- **Vehicle Configurator**: Interactive car customization with 3D models
- **Dealership Locator**: Leaflet maps with routing functionality
- **Admin Dashboard**: Comprehensive management interface
- **Multi-language Support**: Vietnamese primary with English fallbacks
- **Responsive Design**: Mobile-first approach with Ant Design components

### Backend API Integration Notes
- All API calls expect Vietnamese field names (e.g., `tenDangNhap`, `matKhau`)
- Response transformation happens in service layer
- Authentication tokens stored in localStorage and Axios headers
- Automatic logout on 401 responses for local accounts only

### Testing Approach
- **Manual Testing**: Use development server to test features
- **Role Testing**: Create users with different roles to test access control
- **API Testing**: Use browser dev tools to inspect network requests
- **Build Verification**: Use preview command to test production builds
