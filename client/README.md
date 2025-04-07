# MCP System Client Documentation

## Directory Structure

```
client/
├── node_modules/      # Dependencies
├── public/            # Static assets
├── src/               # Source code
│   ├── assets/        # Images, icons, and other assets
│   ├── components/    # Reusable UI components
│   ├── context/       # React context for state management
│   ├── layouts/       # Page layout components
│   ├── pages/         # Main application pages
│   ├── services/      # API integration and services
│   ├── App.css        # Global styles
│   ├── App.jsx        # Main application component
│   ├── index.css      # Global CSS
│   └── main.jsx       # Application entry point
├── .gitignore         # Git ignore file
├── eslint.config.js   # ESLint configuration
├── index.html         # HTML entry point
├── package-lock.json  # npm dependencies lock file
├── package.json       # Project configuration and dependencies
├── README.md          # Project documentation
├── tailwind.config.js # Tailwind CSS configuration
└── vite.config.js     # Vite build configuration
```

## Technology Stack

- **Framework**: React.js with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons (FI Icons)

## Frontend Flow

### Authentication Flow

1. **User Registration**:
   - New users register via `/register` route
   - Form validation is performed client-side
   - User data is sent to `/auth/register` API endpoint
   - Upon successful registration, user is logged in automatically
   - JWT token is stored in localStorage

2. **User Login**:
   - Existing users login via `/login` route
   - Credentials are sent to `/auth/login` API endpoint
   - Upon successful login, JWT token is stored in localStorage
   - User is redirected to home or previous page

3. **Authentication State**:
   - `AuthContext` maintains authentication state across the application
   - User session is preserved using localStorage
   - Automatic token refresh mechanism is implemented
   - Protected routes redirect unauthenticated users to login

### Application Structure

1. **Layout System**:
   - `MainLayout` component provides consistent navigation and footer
   - Responsive design with mobile and desktop navigation
   - Dynamic menu based on user role (MCP or PICKUP_PARTNER)

2. **Routing**:
   - React Router manages navigation
   - Protected routes require authentication
   - Role-based access control for certain pages

3. **API Integration**:
   - Centralized API service using Axios
   - Request/response interceptors for handling auth tokens and errors
   - Service modules organized by domain (auth, partners, wallet, pickups, orders)

### Key Features

1. **User Management**:
   - Registration and login
   - Profile management
   - Password change

2. **Partner Management** (MCP role):
   - View, add, edit, and delete partners
   - Partner status management

3. **Wallet Management**:
   - View wallet balance
   - View transaction history
   - Deposit and withdraw funds

4. **Pickup Management** (PICKUP_PARTNER role):
   - View assigned pickups
   - Update pickup status
   - Schedule and cancel pickups

5. **Order Management**:
   - Create new orders
   - View order history
   - Update order status
   - Cancel orders

## Data Flow

1. **API Communication**:
   - Services in `services/api.js` define API endpoints
   - Axios instance configured with base URL and interceptors
   - JWT token automatically included in requests
   - Error handling for unauthorized access and server errors

2. **State Management**:
   - React Context API used for global state
   - `AuthContext` manages user authentication state
   - Individual components use local state for UI-specific data

3. **Component Hierarchy**:
   - App → MainLayout → Pages → Components
   - Pages fetch data from API services
   - Reusable components like Button, LoadingSpinner, and EmptyState
   - Responsive design with mobile-first approach

## UI Components

1. **Common Components**:
   - `Button.jsx`: Reusable button with different variants
   - `LoadingSpinner.jsx`: Loading indicator
   - `EmptyState.jsx`: Empty state message for lists

2. **Layout Components**:
   - `MainLayout.jsx`: Main application layout with navigation

3. **Page Components**:
   - `Home.jsx`: Dashboard/landing page
   - `Login.jsx`: User login page
   - `Register.jsx`: User registration page
   - `Profile.jsx`: User profile management
   - `Wallet.jsx`: Wallet transactions and balance
   - `Partners.jsx`: Partner management for MCP
   - `Pickups.jsx`: Pickup management for PICKUP_PARTNER
   - `Orders.jsx`: Order management

## Error Handling

1. **API Errors**:
   - Interceptors catch and process API errors
   - HTTP status codes mapped to appropriate actions
   - 401 errors trigger automatic logout
   - User-friendly error messages via toast notifications

2. **Form Validation**:
   - Client-side validation before API calls
   - Validation error messages displayed inline

3. **Loading States**:
   - Loading indicators during async operations
   - Disabled buttons during form submission

## Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive navigation with collapsible menu on mobile
- Optimized layouts for different screen sizes

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory and add configuration:
   ```
   VITE_API_URL=http://localhost:4000/api
   ```

### Running the Application

```
npm run dev
```

This will start the development server on [http://localhost:5173](http://localhost:5173).

### Building for Production

```
npm run build
```

This will create a production-ready build in the `dist` directory.

## User Roles

### MCP (Material Collection Point)

MCPs can:
- Manage pickup partners
- Create orders
- Manage wallet
- Track pickups and orders

### Pickup Partner

Pickup Partners can:
- Accept/reject pickup requests
- Update pickup status
- Manage their profile
- Track their wallet and earnings


