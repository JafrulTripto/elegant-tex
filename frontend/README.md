# TechMinds Frontend

This is the frontend application for TechMinds, built with React, TypeScript, and Material UI v6.

## Features

- User authentication (login, register, logout)
- Protected routes based on authentication status
- User profile management
- Responsive design with Material UI v6
- Role-based access control

## Tech Stack

- **React**: A JavaScript library for building user interfaces
- **TypeScript**: A strongly typed programming language that builds on JavaScript
- **Material UI v6**: A popular React UI framework
- **React Router**: For navigation and routing
- **Axios**: For API requests
- **Vite**: For fast development and building

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
frontend/
├── public/              # Public assets
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── layouts/         # Layout components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── theme/           # Theme configuration
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Backend Integration

This frontend application is designed to work with the TechMinds backend API. The API base URL can be configured in the `vite.config.ts` file.

## License

This project is licensed under the MIT License.
