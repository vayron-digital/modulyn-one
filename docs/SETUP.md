# Fortune4 CRM Setup Guide

## Environment Variables Setup

### Backend (.env)
Create a file named `.env` in the `backend` directory with the following content:

```
PORT=3000
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
NODE_ENV=development
```

Replace `your-supabase-project-url` and `your-supabase-service-key` with your actual Supabase project credentials.

### Frontend (.env)
Create a file named `.env` in the `frontend` directory with the following content:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3000
```

Replace `your-supabase-project-url` and `your-supabase-anon-key` with your actual Supabase project credentials.

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Get your project URL and API keys from the project settings
3. Run the database migrations in order:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the migrations in numerical order (001_initial_schema.sql, 002_*, etc.)
   - Make sure to run all migrations up to the latest one

## Project Structure

```
fortune-crm/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/   # React contexts (Auth, etc.)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions and configurations
│   │   ├── pages/      # Page components
│   │   └── types/      # TypeScript type definitions
├── backend/           # Node.js + Express backend
└── db-migrations/     # Supabase SQL migrations
```

## Running the Application

1. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

3. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

4. Access the application at http://localhost:5173

## Features

- **Authentication & Authorization**
  - Email/Password login
  - Role-based access control (Admin/User)
  - Session management

- **Leads Management**
  - Create, view, update, and delete leads
  - Lead status tracking
  - Lead assignment
  - Lead filtering and search
  - Pagination support

- **User Management**
  - User profiles
  - Role management
  - User preferences

- **Dashboard**
  - Key performance indicators
  - Lead statistics
  - Activity tracking

## Troubleshooting

1. **Database Connection Issues**
   - Verify your Supabase credentials in the .env files
   - Check if all migrations have been run successfully
   - Ensure your IP is allowed in Supabase dashboard

2. **Authentication Issues**
   - Clear browser cache and cookies
   - Verify email/password
   - Check browser console for errors

3. **Development Server Issues**
   - Ensure all dependencies are installed
   - Check if ports 3000 (backend) and 5173 (frontend) are available
   - Verify Node.js version (v18 or higher)

## Support

For any issues or questions, please contact the development team. 