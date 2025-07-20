# Wellness Platform Admin System

A full-stack wellness clinic management system built with Next.js, PostgreSQL, and JWT authentication. This application allows clinic administrators to manage clients and appointments through a secure web interface.

## 🚀 Features

- **Admin Authentication**: Secure JWT-based authentication for admin access
- **Client Management**: View and search through client database
- **Appointment Scheduling**: Create, edit, and cancel appointments
- **Mock API Integration**: Integrates with external mock API for data synchronization
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Automatic refresh of appointment data
- **Search & Filter**: Search clients by name, email, or phone number

## 🛠 Tech Stack

- **Frontend**: React.js with Next.js App Router
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS with shadcn/ui components
- **Type Safety**: TypeScript throughout

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone  https://github.com/Hassan-ali-10/wellness-platform.git
cd wellness-platform
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Database Setup

First, make sure PostgreSQL is running on your system.

Create the database and tables:

\`\`\`bash
# Create database and run migrations
npm run db:setup
\`\`\`

Or manually run the SQL scripts:

\`\`\`bash
# Create database
psql -f scripts/01-create-database.sql

# Create migrations
node scripts/migrate.js --redo --reset
\`\`\`

### 4. Environment Configuration

Copy the sample environment file and configure your settings:

\`\`\`bash
cp sampleEnv .env
\`\`\`

Update the \`.env\` file with your actual values:


### 5. Mock API Setup (Postman)
pleas use the provided the export json config file
### 6. Run the Application

\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:3000\`

## 🔐 Default Login Credentials

- **Email**: admin@wellness.com
- **Password**: admin123

## 📁 Project Structure

\`\`\`
wellness-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── clients/       # Client management endpoints
│   │   └── appointments/  # Appointment management endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── client-list.tsx   # Client listing component
│   ├── appointment-list.tsx # Appointment listing component
│   ├── appointment-form.tsx # Appointment form component
│   ├── dashboard.tsx     # Main dashboard component
│   └── login-form.tsx    # Login form component
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   └── use-api.ts        # API client hook
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   └── mock-api.ts       # Mock API client
├── scripts/              # Database scripts
│   ├── 01-create-database.sql
│   ├── 02-create-tables.sql
│   └── 03-seed-data.sql
├── .env.sample           # Environment variables template
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
\`\`\`

## 🔄 API Endpoints

### Authentication
- \`POST /api/auth/login\` - Admin login

### Clients
- \`GET /api/clients\` - Get clients list with search and pagination
- Query parameters: \`search\`, \`page\`, \`limit\`

### Appointments
- \`GET /api/appointments\` - Get appointments list
- \`POST /api/appointments\` - Create new appointment
- \`PUT /api/appointments/[id]\` - Update appointment
- \`DELETE /api/appointments/[id]\` - Cancel appointment

Query parameters for GET: \`clientId\`, \`upcoming\`, \`page\`, \`limit\`

## 🗃️ Database Schema

### Tables

**admins**
- \`id\` (UUID, Primary Key)
- \`email\` (VARCHAR, Unique)
- \`password_hash\` (VARCHAR)
- \`name\` (VARCHAR)
- \`created_at\` (TIMESTAMP)

**clients**
- \`id\` (UUID, Primary Key)
- \`external_id\` (VARCHAR, Unique)
- \`name\` (VARCHAR)
- \`email\` (VARCHAR, Unique)
- \`phone\` (VARCHAR)
- \`created_at\` (TIMESTAMP)
- \`updated_at\` (TIMESTAMP)

**appointments**
- \`id\` (UUID, Primary Key)
- \`external_id\` (VARCHAR, Unique)
- \`client_id\` (UUID, Foreign Key)
- \`title\` (VARCHAR)
- \`description\` (TEXT)
- \`appointment_date\` (TIMESTAMP)
- \`duration_minutes\` (INTEGER)
- \`status\` (VARCHAR)
- \`created_at\` (TIMESTAMP)
- \`updated_at\` (TIMESTAMP)

## 🔒 Security Features

- JWT-based authentication with secure token storage
- Password hashing using bcrypt
- Protected API routes with authentication middleware
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## 🎯 Key Features Implementation

### Authentication Flow
1. Admin logs in with email/password
2. Server validates credentials and generates JWT token
3. Token stored in localStorage and sent with API requests
4. Protected routes verify token before processing requests

### Mock API Integration
- Error handling for network failures
- Configurable API endpoints via environment variables

### Real-time Updates
- Automatic refresh of appointment lists after CRUD operations
- Optimistic UI updates for better user experience
- Error handling with user-friendly messages

## 🚀 Deployment

### Environment Variables for Production

use existing or setup accordingly..
### Build Commands

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## 🧪 Testing

The application includes comprehensive error handling and validation:

- Form validation for all user inputs
- API error handling with user-friendly messages
- Database connection error handling
- Mock API fallback mechanisms

## 📝 Development Notes

### Assumptions Made
1. Single admin user system (can be extended for multiple admins)
2. Mock API follows REST conventions
3. Appointments are scheduled in clinic's local timezone
4. Client data is primarily managed through the external API

### Future Enhancements
- Multi-admin support with role-based permissions
- Email notifications for appointments
- Calendar integration
- Advanced reporting and analytics
- Bulk operations for appointments

## ⏱️ Time Tracking

**Total Development Time: 8 hours**

- Database design and setup: 1 hours
- Authentication system: 1 hours
- API development: 2 hours
- Frontend components: 3.5 hours
- Integration and testing: 0.5 hours

## 🐛 Known Issues & Limitations

1. No real-time notifications (could be added with WebSockets)
2. Limited to single timezone support
3. No audit logging for admin actions

## 📞 Support

For questions or issues, please contact the development team (hassanali703@gmail.com) or create an issue in the project repository.

## 📄 License

This project is developed as a take-home assignment for Ruh Care.
