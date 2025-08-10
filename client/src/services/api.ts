import axios from 'axios';
import { auth } from '@/firebase/firebaseConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle auth errors - could redirect to login
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  verifyToken: async (idToken: string) => {
    const response = await apiClient.post('/api/auth/verify', { idToken });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },
  
  updateProfile: async (data: { displayName?: string; photoURL?: string; preferences?: any }) => {
    const response = await apiClient.put('/api/user/profile', data);
    return response.data;
  },
  
  checkUserExists: async (uid: string) => {
    const response = await apiClient.get(`/api/user/exists/${uid}`);
    return response.data;
  },
};

// Calendar API
export const calendarAPI = {
  getEvents: async (accessToken: string, timeMin?: string, timeMax?: string) => {
    const response = await apiClient.post('/api/calendar/events', {
      accessToken,
      timeMin,
      timeMax,
    });
    return response.data;
  },
  
  getFreeSlots: async (
    events: any[],
    existingWorkoutDates: string[] = [],
    preferredTime: 'morning' | 'afternoon' | 'evening' = 'morning',
    targetDate?: string
  ) => {
    const response = await apiClient.post('/api/calendar/free-slots', {
      events,
      existingWorkoutDates,
      preferredTime,
      targetDate,
    });
    return response.data;
  },
};

// Smart Plan API
export const smartPlanAPI = {
  generatePlan: async (data: {
    trainingGoal: any;
    targetDate: string;
    weeklyGoal?: any;
    preferredWorkoutsPerWeek: number;
    diaryEntries: any[];
    freeSlots: any[];
  }) => {
    const response = await apiClient.post('/api/smart-plan/generate', data);
    return response.data;
  },
};

// Diary API
export const diaryAPI = {
  getEntries: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/api/diary/entries', {
      params: { startDate, endDate },
    });
    return response.data;
  },
  
  addEntry: async (data: {
    date: string;
    distance: number;
    runType?: string;
    duration?: number;
    notes?: string;
    mood?: string;
  }) => {
    const response = await apiClient.post('/api/diary/entry', data);
    return response.data;
  },
  
  updateEntry: async (id: string, data: {
    date?: string;
    distance?: number;
    runType?: string;
    duration?: number;
    notes?: string;
    mood?: string;
  }) => {
    const response = await apiClient.put(`/api/diary/entry/${id}`, data);
    return response.data;
  },
  
  deleteEntry: async (id: string) => {
    const response = await apiClient.delete(`/api/diary/entry/${id}`);
    return response.data;
  },
};

export default apiClient;