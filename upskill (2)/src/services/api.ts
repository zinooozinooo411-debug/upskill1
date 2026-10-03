import {
  User,
  FeedbackItem,
  GoalItem,
  GeneralObservation,
  GeneralGoal,
  ActivityItem,
  StudentDashboardData,
  TeacherDashboardData,
  TeacherStudentItem,
  TeacherStudentProfile,
  TeacherSuggestion,
  TeacherRecognition,
  ThemeSuggestion,
  RecognitionItem,
  NotificationItem,
  NotificationsResponse
} from '../types';

const TOKEN_KEY = 'student_growth_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Authentication
  login: (username: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  getCurrentUser: () =>
    request<User>('/api/auth/me'),

  getSetupStatus: () =>
    request<{ needsSetup: boolean }>('/api/auth/setup-status'),

  setupInitialAdmin: (payload: {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
  }) =>
    request<{ token: string; user: User }>('/api/auth/setup-initial-admin', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getRegistrationStatus: () =>
    request<{ allowed: boolean }>('/api/auth/registration-status'),

  registerStudent: (payload: {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
  }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin Account Management
  getAdminUsers: (params?: { role?: string; search?: string }) => {
    const p = new URLSearchParams();
    if (params?.role) p.append('role', params.role);
    if (params?.search) p.append('search', params.search);
    const query = p.toString() ? `?${p.toString()}` : '';
    return request<User[]>(`/api/admin/users${query}`);
  },

  createAdminUser: (payload: {
    first_name: string;
    last_name: string;
    username: string;
    password: string;
    role: 'admin' | 'teacher' | 'student';
    subject?: string;
  }) =>
    request<{ success: boolean; user: User }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  toggleUserStatus: (id: string, is_active: boolean) =>
    request<{ success: boolean; is_active: number }>(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active })
    }),

  changeUserPassword: (id: string, new_password: string) =>
    request<{ success: boolean; username: string }>(`/api/admin/users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password })
    }),

  deleteUser: (id: string) =>
    request<{ success: boolean; message?: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE'
    }),

  getSettings: () =>
    request<{ allow_registration: boolean }>('/api/admin/settings'),

  updateSettings: (payload: { allow_registration: boolean }) =>
    request<{ success: boolean; allow_registration: boolean }>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  // Student Experience
  getStudentDashboard: () =>
    request<StudentDashboardData>('/api/student/dashboard'),

  getStudentFeedback: () =>
    request<FeedbackItem[]>('/api/student/feedback'),

  getStudentGoals: () =>
    request<GoalItem[]>('/api/student/goals'),

  updateStudentGoalStatus: (id: string, status: 'not_started' | 'in_progress' | 'completed') =>
    request<{ success: boolean; id: string; status: string; completed_at?: string | null }>(`/api/student/goals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getStudentObservations: () =>
    request<GeneralObservation[]>('/api/student/general-observations'),

  getStudentGeneralGoals: () =>
    request<GeneralGoal[]>('/api/student/general-goals'),

  getStudentActivity: () =>
    request<ActivityItem[]>('/api/student/activity'),

  // Teacher Experience
  getTeacherDashboard: () =>
    request<TeacherDashboardData>('/api/teacher/dashboard'),

  getTeacherStudents: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<TeacherStudentItem[]>(`/api/teacher/students${query}`);
  },

  getTeacherStudentProfile: (studentId: string) =>
    request<TeacherStudentProfile>(`/api/teacher/students/${studentId}`),

  giveTeacherFeedback: (payload: {
    student_id: string;
    subject: string;
    category?: string;
    strengths: string[];
    areas_to_improve: string[];
    personal_comment?: string;
    create_goal?: {
      title: string;
      description?: string;
      deadline?: string;
    };
    used_suggestion_ids?: string[];
    save_to_suggestions?: Array<{ text: string; category: string }>;
  }) =>
    request<{ success: boolean; feedback_id: string; student_name: string; created_goal?: any }>('/api/teacher/feedback', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateTeacherFeedback: (id: string, payload: {
    subject?: string;
    category?: string;
    strengths?: string[];
    areas_to_improve?: string[];
    personal_comment?: string;
  }) =>
    request<{ success: boolean; id: string; updated_at: string }>(`/api/teacher/feedback/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteTeacherFeedback: (id: string) =>
    request<{ success: boolean }>(`/api/teacher/feedback/${id}`, {
      method: 'DELETE'
    }),

  getTeacherSuggestions: (params?: { category?: string; search?: string }) => {
    const p = new URLSearchParams();
    if (params?.category) p.append('category', params.category);
    if (params?.search) p.append('search', params.search);
    const query = p.toString() ? `?${p.toString()}` : '';
    return request<TeacherSuggestion[]>(`/api/teacher/suggestions${query}`);
  },

  addTeacherSuggestion: (category: string, text: string) =>
    request<{ success: boolean; id: string; category: string; text: string; usage_count: number }>('/api/teacher/suggestions', {
      method: 'POST',
      body: JSON.stringify({ category, text })
    }),

  updateTeacherSuggestion: (id: string, payload: { category?: string; text?: string }) =>
    request<{ success: boolean; id: string }>(`/api/teacher/suggestions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  useTeacherSuggestion: (id: string) =>
    request<{ success: boolean; id: string; usage_count: number }>(`/api/teacher/suggestions/${id}/use`, {
      method: 'POST'
    }),

  deleteTeacherSuggestion: (id: string) =>
    request<{ success: boolean }>(`/api/teacher/suggestions/${id}`, {
      method: 'DELETE'
    }),

  getTeacherGeneralObservations: () =>
    request<GeneralObservation[]>('/api/teacher/general-observations'),

  getThemeSuggestions: () =>
    request<ThemeSuggestion[]>('/api/teacher/general-observations/theme-suggestions'),

  addTeacherGeneralObservation: (payload: { category?: string; subject?: string; observation: string }) =>
    request<{ success: boolean; id: string }>('/api/teacher/general-observations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateTeacherGeneralObservation: (id: string, payload: { category?: string; subject?: string; observation: string }) =>
    request<{ success: boolean; id: string }>(`/api/teacher/general-observations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteTeacherGeneralObservation: (id: string) =>
    request<{ success: boolean }>(`/api/teacher/general-observations/${id}`, {
      method: 'DELETE'
    }),

  getTeacherGeneralGoals: () =>
    request<GeneralGoal[]>('/api/teacher/general-goals'),

  createTeacherGeneralGoal: (payload: { title: string; description?: string; deadline?: string; status?: string }) =>
    request<{ success: boolean; id: string }>('/api/teacher/general-goals', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateTeacherGeneralGoal: (id: string, payload: { title?: string; description?: string; deadline?: string; status?: string }) =>
    request<{ success: boolean; id: string }>(`/api/teacher/general-goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteTeacherGeneralGoal: (id: string) =>
    request<{ success: boolean }>(`/api/teacher/general-goals/${id}`, {
      method: 'DELETE'
    }),

  getTeacherGoals: () =>
    request<GoalItem[]>('/api/teacher/goals'),

  createTeacherGoal: (payload: {
    student_id: string;
    title: string;
    description?: string;
    deadline?: string;
  }) =>
    request<{ success: boolean; id: string }>('/api/teacher/goals', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateTeacherGoal: (id: string, payload: {
    title?: string;
    description?: string;
    deadline?: string;
    status?: 'not_started' | 'in_progress' | 'completed';
  }) =>
    request<{ success: boolean; id: string }>(`/api/teacher/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteTeacherGoal: (id: string) =>
    request<{ success: boolean }>(`/api/teacher/goals/${id}`, {
      method: 'DELETE'
    }),

  getTeacherRecognitions: () =>
    request<TeacherRecognition[]>('/api/teacher/recognitions'),

  awardTeacherRecognition: (payload: {
    student_id?: string;
    student_ids?: string[];
    category?: string;
    badge_type?: string;
    reason: string;
  }) =>
    request<{ success: boolean; count?: number; id?: string; ids?: string[] }>('/api/teacher/recognitions', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  deleteTeacherRecognition: (id: string) =>
    request<{ success: boolean }>(`/api/teacher/recognitions/${id}`, {
      method: 'DELETE'
    }),

  getStudentRecognitions: () =>
    request<RecognitionItem[]>('/api/student/recognitions'),

  getRecognitionShowcase: () =>
    request<RecognitionItem[]>('/api/student/recognitions/showcase'),

  // Notification methods
  getNotifications: () =>
    request<NotificationsResponse>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean; id: string }>(`/api/notifications/${id}/read`, {
      method: 'PATCH'
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/mark-all-read', {
      method: 'POST'
    }),

  deleteNotification: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}`, {
      method: 'DELETE'
    }),

  // Foundation verification routes
  getTeacherFoundation: () =>
    request<{ role: string; first_name: string; last_name: string; username: string; subject?: string; message: string }>('/api/teacher/dashboard-foundation'),

  getStudentFoundation: () =>
    request<{ role: string; first_name: string; last_name: string; username: string; message: string }>('/api/student/dashboard-foundation')
};
