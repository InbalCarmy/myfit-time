# MyFit Time - UML Diagrams

## Use Case Diagram

```mermaid
graph LR
    User((User))
    GoogleAPI((Google Calendar API))
    OpenAI((OpenAI API))
    
    User --> UC1[Register/Login]
    User --> UC2[View Dashboard]
    User --> UC3[Log Workout]
    User --> UC4[Plan Workout]
    User --> UC5[Generate Smart Plan]
    User --> UC6[View Calendar]
    User --> UC7[Track Progress]
    User --> UC8[Manage Profile]
    
    UC5 --> GoogleAPI
    UC5 --> OpenAI
    UC4 --> GoogleAPI
    UC6 --> GoogleAPI
    
    UC1 --> Firebase[Firebase Auth]
    UC2 --> Firebase
    UC3 --> Firebase
    UC7 --> Firebase
    UC8 --> Firebase
```

## Class Diagram

```mermaid
classDiagram
    class User {
        +String uid
        +String email
        +String displayName
        +String photoURL
        +Date createdAt
        +WeeklyGoal weeklyGoal
        +String preferredTime
        +Boolean reminderEnabled
        +login()
        +logout()
        +updateProfile()
    }

    class WeeklyGoal {
        +String type
        +Number value
        +calculateProgress()
    }

    class Workout {
        +String id
        +String userId
        +Date date
        +String time
        +String type
        +Number distance
        +String duration
        +String pace
        +Number calories
        +String status
        +save()
        +update()
        +delete()
    }

    class SmartPlan {
        +String userId
        +String trainingGoal
        +Date targetDate
        +Number weeklyGoal
        +Workout[] workouts
        +generate()
        +save()
    }

    class CalendarEvent {
        +String id
        +Date start
        +Date end
        +String summary
        +String description
    }

    class TimeSlot {
        +Date start
        +Date end
        +String preference
        +Boolean available
    }

    class AuthService {
        +verifyToken(token)
        +createUser(userData)
        +getCurrentUser()
    }

    class WorkoutService {
        +getWorkouts(userId)
        +createWorkout(workoutData)
        +updateWorkout(id, updates)
        +deleteWorkout(id)
    }

    class CalendarService {
        +getEvents(token)
        +findFreeSlots(events, preferences)
        +scheduleWorkout(workout)
    }

    class SmartPlanService {
        +generatePlan(goals, history, slots)
        +optimizePlan(plan)
        +savePlan(plan)
    }

    User ||--o{ Workout : creates
    User ||--|| WeeklyGoal : has
    User ||--o{ SmartPlan : generates
    SmartPlan ||--o{ Workout : contains
    CalendarService ..> CalendarEvent : uses
    CalendarService ..> TimeSlot : generates
    SmartPlanService ..> SmartPlan : creates
    WorkoutService ..> Workout : manages
    AuthService ..> User : manages
```

## Activity Diagram - Smart Plan Generation

```mermaid
graph TD
    A[User requests Smart Plan] --> B[Authenticate User]
    B --> C[Get User Preferences]
    C --> D[Fetch Google Calendar Events]
    D --> E[Get Past Workout History]
    E --> F[Calculate Available Time Slots]
    F --> G[Send Data to OpenAI API]
    G --> H[Generate Training Plan]
    H --> I{Valid Plan Generated?}
    I -->|Yes| J[Parse AI Response]
    I -->|No| K[Return Error]
    J --> L[Validate Workouts]
    L --> M[Save Plan to Database]
    M --> N[Return Plan to User]
    K --> O[Show Error Message]
    N --> P[Display Plan on UI]
```

## Activity Diagram - User Authentication Flow

```mermaid
graph TD
    A[User clicks Login] --> B[Redirect to Google OAuth]
    B --> C[User authorizes Google]
    C --> D[Google returns ID token]
    D --> E[Send token to server]
    E --> F[Verify token with Firebase Admin]
    F --> G{Token valid?}
    G -->|Yes| H[Check if user exists in DB]
    G -->|No| I[Return authentication error]
    H --> J{User exists?}
    J -->|Yes| K[Return user data]
    J -->|No| L[Create new user record]
    L --> M[Save user to Firestore]
    M --> K
    K --> N[Generate JWT token]
    N --> O[Return token to client]
    O --> P[Store token and redirect to dashboard]
    I --> Q[Show error message]
```

## Activity Diagram - Workout Logging

```mermaid
graph TD
    A[User opens Diary page] --> B[Load existing workouts]
    B --> C[Display workout calendar]
    C --> D[User clicks Add Workout]
    D --> E[Show workout form]
    E --> F[User fills workout details]
    F --> G[User submits form]
    G --> H[Validate form data]
    H --> I{Data valid?}
    I -->|Yes| J[Send to server API]
    I -->|No| K[Show validation errors]
    J --> L[Server validates JWT token]
    L --> M[Save workout to Firestore]
    M --> N[Return success response]
    N --> O[Update UI with new workout]
    O --> P[Show success message]
    K --> E
```

## Sequence Diagram - Smart Plan Generation

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant GoogleAPI
    participant OpenAI
    participant Firestore

    User->>Client: Request Smart Plan
    Client->>Server: POST /api/smart-plan/generate
    Server->>Server: Authenticate JWT token
    Server->>GoogleAPI: Get calendar events
    GoogleAPI-->>Server: Return events
    Server->>Firestore: Get user workout history
    Firestore-->>Server: Return workout data
    Server->>Server: Calculate free time slots
    Server->>OpenAI: Generate training plan
    OpenAI-->>Server: Return AI-generated plan
    Server->>Server: Parse and validate plan
    Server->>Firestore: Save generated plan
    Server-->>Client: Return workout plan
    Client-->>User: Display smart plan
```

## Sequence Diagram - Dashboard Data Loading

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Firebase
    participant GoogleAPI

    User->>Client: Load Dashboard
    Client->>Firebase: Check authentication
    Firebase-->>Client: User authenticated
    
    par Load Weekly Stats
        Client->>Firebase: Query workouts for this week
        Firebase-->>Client: Return workout data
    and Load User Profile
        Client->>Firebase: Get user profile
        Firebase-->>Client: Return profile data
    and Load Next Workout
        Client->>Firebase: Query planned workouts
        Firebase-->>Client: Return planned workouts
    end
    
    Client->>Client: Calculate weekly progress
    Client->>Client: Find next scheduled workout
    Client-->>User: Display dashboard with stats
    
    opt Find Free Time
        User->>Client: Click "Find time for workout"
        Client->>GoogleAPI: Get calendar events
        GoogleAPI-->>Client: Return calendar data
        Client->>Client: Calculate free slots
        Client-->>User: Show suggested time slots
    end
```

## Component Diagram

```mermaid
graph TB
    subgraph "Client Application"
        subgraph "Pages"
            Dashboard[Dashboard Page]
            Calendar[Calendar Page]
            SmartPlan[Smart Plan Page]
            Diary[Diary Page]
            Profile[Profile Page]
        end
        
        subgraph "Components"
            SideNav[Side Navigation]
            WorkoutModal[Workout Modal]
            Logo[Logo Component]
        end
        
        subgraph "Services"
            ApiService[API Service]
            FirebaseService[Firebase Service]
            CalendarUtils[Calendar Utils]
        end
    end
    
    subgraph "Server Application"
        subgraph "Routes"
            AuthRoutes[Auth Routes]
            UserRoutes[User Routes]
            WorkoutRoutes[Workout Routes]
            SmartPlanRoutes[Smart Plan Routes]
            CalendarRoutes[Calendar Routes]
        end
        
        subgraph "Middleware"
            AuthMiddleware[Auth Middleware]
            ErrorHandler[Error Handler]
        end
        
        subgraph "Config"
            FirebaseConfig[Firebase Config]
        end
    end
    
    subgraph "External Services"
        FirestoreDB[(Firestore Database)]
        GoogleCalendar[Google Calendar API]
        OpenAIAPI[OpenAI API]
        FirebaseAuth[Firebase Auth]
    end
    
    Dashboard --> ApiService
    SmartPlan --> ApiService
    Calendar --> ApiService
    Diary --> ApiService
    Profile --> ApiService
    
    ApiService --> AuthRoutes
    ApiService --> UserRoutes
    ApiService --> WorkoutRoutes
    ApiService --> SmartPlanRoutes
    ApiService --> CalendarRoutes
    
    AuthRoutes --> FirebaseAuth
    SmartPlanRoutes --> OpenAIAPI
    CalendarRoutes --> GoogleCalendar
    UserRoutes --> FirestoreDB
    WorkoutRoutes --> FirestoreDB
    
    AuthMiddleware --> FirebaseAuth
    FirebaseConfig --> FirestoreDB
```

## Deployment Diagram

```mermaid
graph TB
    subgraph "Client Environment"
        ClientApp[Next.js Application<br/>Port: 3000]
        ClientEnv[Environment Variables<br/>.env.local]
    end
    
    subgraph "Server Environment"
        ServerApp[Express.js Server<br/>Port: 3001]
        ServerEnv[Environment Variables<br/>.env]
    end
    
    subgraph "Firebase Cloud"
        FirebaseAuth[Firebase Authentication]
        Firestore[Firestore Database]
        FirebaseAdmin[Firebase Admin SDK]
    end
    
    subgraph "External APIs"
        GoogleAPIs[Google Calendar API<br/>Google OAuth]
        OpenAI[OpenAI API<br/>GPT-3.5-turbo]
    end
    
    subgraph "Development Tools"
        ESLint[ESLint Linting]
        TypeScript[TypeScript Compiler]
        Tailwind[Tailwind CSS]
        Jest[Jest Testing]
    end
    
    ClientApp --> ServerApp
    ClientApp --> FirebaseAuth
    ServerApp --> FirebaseAdmin
    ServerApp --> Firestore
    ServerApp --> GoogleAPIs
    ServerApp --> OpenAI
    
    ClientEnv --> ClientApp
    ServerEnv --> ServerApp
    
    ESLint --> ClientApp
    ESLint --> ServerApp
    TypeScript --> ClientApp
    TypeScript --> ServerApp
    Tailwind --> ClientApp
    Jest --> ServerApp
```