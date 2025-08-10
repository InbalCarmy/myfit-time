# MyFit Time - Client-Server Architecture

A fitness application with AI-powered workout planning and Google Calendar integration.

## Architecture

This application uses a **client-server architecture**:

- **Client** (`/client`): Next.js frontend application
- **Server** (`/server`): Express.js backend API server
- **Database**: Firebase Firestore

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled
- Google OAuth credentials
- OpenAI API key

### 1. Server Setup

```bash
cd server
npm install
```

Copy environment file and configure:
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:
- Firebase Admin credentials
- OpenAI API key
- Google OAuth credentials
- JWT secret

Start the server:
```bash
npm run dev  # Development
npm run build && npm start  # Production
```

Server runs on `http://localhost:3001`

### 2. Client Setup

```bash
cd client
npm install
```

Copy environment file and configure:
```bash
cp .env.local
```

Fill in your environment variables in `.env.local`:
- Firebase client configuration
- Google OAuth client ID
- API server URL

Start the client:
```bash
npm run dev  # Development
npm run build && npm start  # Production
```

Client runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token and create user
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/exists/:uid` - Check if user exists

### Calendar Integration
- `POST /api/calendar/events` - Get Google Calendar events
- `POST /api/calendar/free-slots` - Calculate free time slots

### Smart Plan
- `POST /api/smart-plan/generate` - Generate AI workout plan

### Diary
- `GET /api/diary/entries` - Get workout entries
- `POST /api/diary/entry` - Add workout entry
- `PUT /api/diary/entry/:id` - Update workout entry
- `DELETE /api/diary/entry/:id` - Delete workout entry

## Security Features

- Firebase Admin SDK for secure server-side operations
- JWT token validation on all protected routes
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers

## Development

Both client and server support hot reloading in development mode.

Start both simultaneously:
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client  
cd client && npm run dev
```

## Environment Variables

### Server (`.env`)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:3000)

### Client (`.env.local`)
- `NEXT_PUBLIC_FIREBASE_*` - Firebase client configuration
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001)

## Migration from Monolithic Architecture

The application has been migrated from a monolithic Next.js application to a client-server architecture:

### What Changed
- **API Logic**: Moved from Next.js API routes to Express.js server
- **Authentication**: Now handled server-side with Firebase Admin SDK
- **Security**: API keys and sensitive operations moved to server
- **Database**: Firebase operations centralized on server
- **OpenAI Integration**: Moved to server for security

### What Stayed the Same
- **UI/UX**: Frontend remains identical
- **Features**: All functionality preserved
- **Database Schema**: Firestore structure unchanged
- **User Experience**: No changes to user workflows

## Benefits of New Architecture

1. **Security**: API keys and sensitive operations are server-side only
2. **Scalability**: Server can be deployed independently and scaled
3. **Performance**: Better caching and request handling
4. **Maintainability**: Clear separation of concerns
5. **Flexibility**: Can easily add new client applications (mobile, etc.)
