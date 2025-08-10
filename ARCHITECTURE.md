# MyFit Time - System Architecture Documentation

## System Architecture

### Overview
MyFit Time is a fitness application built using a **client-server architecture** with AI-powered workout planning and Google Calendar integration.

### Architecture Diagram
```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│                 │ ◄─────────────────► │                 │
│  Client (React) │     Port 3000       │  Server (Node)  │
│     Next.js     │                     │    Express.js   │
│                 │                     │   Port 3001     │
└─────────────────┘                     └─────────────────┘
          │                                       │
          │                                       │
          ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│   Firebase      │                     │   External APIs │
│   Authentication│                     │                 │
│   (Client SDK)  │                     │ • Firebase Admin│
└─────────────────┘                     │ • OpenAI API    │
                                        │ • Google APIs   │
                                        │ • Firestore DB  │
                                        └─────────────────┘
```

## Module Description

### Client Modules (`/client`)

#### 1. Application Pages
- **Dashboard** (`/app/dashboard`): Main user interface showing fitness overview
- **Calendar** (`/app/calendar`): Calendar view for workout planning
- **Smart Plan** (`/app/smart-plan`): AI-powered workout plan generation
- **Diary** (`/app/diary`): Workout tracking and logging
- **Profile** (`/app/profile`): User profile management
- **Home** (`/app/page.tsx`): Landing page and authentication

#### 2. Components
- **SideNav** (`/components/SideNav.tsx`): Navigation sidebar
- **Logo** (`/components/Logo.tsx`): Application branding
- **PlanWorkoutModal** (`/components/PlanWorkoutModal.tsx`): Modal for workout planning

#### 3. Services & Utilities
- **Firebase** (`/firebase/`): Client-side Firebase configuration and user management
- **API Services** (`/services/api.ts`): HTTP client for server communication
- **Google Calendar** (`/utils/googleCalendar.ts`): Calendar integration utilities
- **Progress Calculator** (`/utils/calculateWeeklyProgress.ts`): Fitness metrics calculation

### Server Modules (`/server`)

#### 1. Core Server
- **Main Server** (`/src/index.ts`): Express.js server initialization and configuration

#### 2. Configuration
- **Firebase Config** (`/src/config/firebase.ts`): Firebase Admin SDK setup

#### 3. Middleware
- **Authentication** (`/src/middleware/auth.ts`): JWT token validation
- **Error Handler** (`/src/middleware/errorHandler.ts`): Global error handling

#### 4. API Routes
- **Authentication** (`/src/routes/auth.ts`): User authentication and verification
- **User Management** (`/src/routes/user.ts`): User profile CRUD operations
- **Calendar Integration** (`/src/routes/calendar.ts`): Google Calendar API integration
- **Smart Plan** (`/src/routes/smartPlan.ts`): AI-powered workout generation
- **Diary** (`/src/routes/diary.ts`): Workout logging and tracking

## Technology Stack

### Frontend Technologies
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 13.5.6 | React-based full-stack framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **UI Library** | React | 18.2.0 | Component-based user interface |
| **Styling** | Tailwind CSS | 3.3.0 | Utility-first CSS framework |
| **Authentication** | NextAuth.js | 4.24.11 | Authentication library |
| **HTTP Client** | Axios | 1.10.0 | Promise-based HTTP client |
| **Notifications** | React Hot Toast | 2.5.2 | Toast notifications |
| **Date Handling** | date-fns | 4.1.0 | Date utility library |

### Backend Technologies
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | - | JavaScript runtime |
| **Framework** | Express.js | 4.18.2 | Web application framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Authentication** | Firebase Admin | 12.0.0 | Server-side authentication |
| **Database** | Firestore | - | NoSQL document database |
| **Security** | Helmet | 7.1.0 | Security middleware |
| **CORS** | cors | 2.8.5 | Cross-origin resource sharing |
| **Rate Limiting** | express-rate-limit | 7.1.5 | API rate limiting |
| **Logging** | Morgan | 1.10.0 | HTTP request logger |

### External Services
| Service | Purpose | Integration |
|---------|---------|-------------|
| **Firebase** | User authentication, Firestore database | Client & Server SDK |
| **OpenAI API** | AI-powered workout plan generation | Server-side integration |
| **Google Calendar API** | Calendar integration for workout scheduling | Server-side OAuth |
| **Google OAuth** | User authentication via Google | Client & Server |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and formatting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |
| **Nodemon** | Development server auto-restart |
| **Jest** | Testing framework |
| **ts-node** | TypeScript execution |

## Security Features

### Client-Side Security
- **Environment Variables**: Sensitive configuration stored in `.env.local`
- **Firebase Authentication**: Secure user authentication
- **HTTP-Only Communication**: All API calls over HTTPS
- **Input Validation**: Form validation and sanitization

### Server-Side Security
- **Firebase Admin SDK**: Secure server-side operations
- **JWT Token Validation**: Protected route authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin restrictions
- **Helmet Security Headers**: HTTP security headers
- **Environment Variables**: API keys and secrets in `.env`
- **Input Sanitization**: Request validation and sanitization

## Data Flow Architecture

### Authentication Flow
```
1. User → Client → Firebase Auth (Login)
2. Client → Firebase → ID Token
3. Client → Server (with ID Token)
4. Server → Firebase Admin (Verify Token)
5. Server → JWT Token (Create Session)
6. Server → Client (JWT + User Data)
```

### API Request Flow
```
1. Client → HTTP Request (with JWT)
2. Server → Auth Middleware (Validate JWT)
3. Server → Route Handler
4. Server → External APIs (Firebase, OpenAI, Google)
5. Server → Database Operations (Firestore)
6. Server → Response → Client
```

### Smart Plan Generation Flow
```
1. Client → Smart Plan Request
2. Server → Google Calendar API (Get Free Slots)
3. Server → User Profile Data (Firestore)
4. Server → OpenAI API (Generate Workout Plan)
5. Server → Firestore (Save Plan)
6. Server → Client (Return Generated Plan)
```

## Deployment Architecture

### Development Environment
- Client: `localhost:3000` (Next.js dev server)
- Server: `localhost:3001` (Express.js with nodemon)
- Database: Firebase Firestore (development project)

### Production Environment
- Client: Static deployment (Vercel/Netlify recommended)
- Server: Node.js hosting (Railway/Render/AWS recommended)
- Database: Firebase Firestore (production project)
- External APIs: Production API keys and endpoints

## Migration Notes

The application was migrated from a monolithic Next.js application to a client-server architecture:

### Benefits Achieved
1. **Enhanced Security**: API keys and sensitive operations moved server-side
2. **Better Scalability**: Independent client and server deployment
3. **Improved Performance**: Dedicated server for API operations
4. **Clear Separation**: Frontend and backend concerns separated
5. **Future Flexibility**: Foundation for mobile app development

### Preserved Features
- All existing UI/UX functionality
- User authentication flow
- Database schema and data
- Feature completeness