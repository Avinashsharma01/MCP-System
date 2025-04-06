# MCP System Frontend

This is the frontend application for the Material Collection Point (MCP) System, a platform for managing material collection and recycling partnerships.

## Features

- **User Authentication**: 
  - Login & Registration
  - Profile management
  - Role-based access control (MCP and Pickup Partners)

- **Dashboard**: 
  - Overview of key metrics and actions
  - Role-specific dashboards

- **Wallet Management**:
  - View wallet balance
  - Transaction history
  - Fund management (add/withdraw)

- **Partner Management** (MCP only):
  - Add and manage pickup partners
  - View partner details
  - Partner activity tracking

- **Pickup Coordination** (Pickup Partner):
  - View pickup requests
  - Accept/reject pickups
  - Track pickup status
  - Manage pickup schedule

- **Order Management**:
  - Create orders
  - Track order status
  - Order history

## Technology Stack

- **React**: UI Library (v19)
- **Vite**: Build tool
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Axios**: API communication
- **React Icons**: Icon library
- **React Hot Toast**: Notifications

## Project Structure

```
client/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page components
│   ├── services/       # API and other services
│   ├── App.jsx         # Main App component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
└── README.md           # Project documentation
```

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
   VITE_API_URL=http://localhost:5000/api
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

## API Integration

The application communicates with the backend API via the services defined in `src/services/api.js`. All API requests include authentication tokens that are managed by the AuthContext.

## Contributing

1. Follow the project structure and naming conventions
2. Write descriptive commit messages
3. Create feature branches for new functionality
4. Submit pull requests for review

## License

This project is proprietary and confidential.
