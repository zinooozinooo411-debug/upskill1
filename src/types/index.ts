export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  role: UserRole;
  subject?: string | null;
  is_active: number;
  created_at?: string;
  created_password?: string;
}

export type FeedbackCategory =
  | 'Understanding'
  | 'Participation'
  | 'Organization'
  | 'Homework'
  | 'Problem Solving'
  | 'Communication'
  | 'Teamwork'
  | 'Progress'
  | 'Study Habits'
  | 'Other';

export interface FeedbackItem {
  id: string;
  student_id?: string;
  student_first_name?: string;
  student_last_name?: string;
  teacher?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  subject: string;
  category?: FeedbackCategory | string;
  date?: string;
  created_at?: string;
  updated_at?: string | null;
  strengths: string[];
  areas_to_improve: string[];
  personal_comment?: string | null;
}

export interface GoalItem {
  id: string;
  student_id?: string;
  student_first_name?: string;
  student_last_name?: string;
  feedback_id?: string | null;
  title: string;
  description?: string | null;
  created_by?: string;
  deadline?: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string | null;
}

export interface GeneralObservation {
  id: string;
  category?: string;
  subject?: string | null;
  observation: string;
  teacher?: string;
  teacher_id?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  created_at: string;
}

export interface GeneralGoal {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  status?: 'active' | 'completed' | string;
  teacher?: string;
  teacher_id?: string;
  created_by?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  created_at: string;
}

export interface ThemeSuggestion {
  theme: string;
  category: string;
  suggestedObservation: string;
  suggestedGoalTitle: string;
  suggestedGoalDescription: string;
  frequencyCount: number;
}

export interface ActivityItem {
  id: string;
  type: 'feedback' | 'goal_created' | 'goal_completed' | 'general_goal' | 'general_observation' | 'recognition';
  title: string;
  description: string;
  date: string;
}

export interface StudentDashboardData {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
  counts: {
    totalFeedback: number;
    activeGoals: number;
    completedGoals: number;
    generalObservations: number;
    generalGoals: number;
    recognitionsCount?: number;
  };
  recentFeedback: FeedbackItem[];
  recentGoals: GoalItem[];
  generalObservations: GeneralObservation[];
  generalGoals: GeneralGoal[];
  recognitions?: RecognitionItem[];
  recentActivity: ActivityItem[];
}

export interface TeacherStudentItem {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  active_goals_count: number;
  feedback_count: number;
  created_at: string;
}

export interface TeacherStudentProfile {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    created_at: string;
  };
  feedback: FeedbackItem[];
  active_goals: GoalItem[];
  completed_goals: GoalItem[];
  recognitions: TeacherRecognition[];
}

export type SuggestionCategory =
  | 'Strengths'
  | 'Improvement'
  | 'Participation'
  | 'Study Habits'
  | 'Organization'
  | 'Teamwork'
  | 'Communication'
  | 'Other';

export interface TeacherSuggestion {
  id: string;
  category: SuggestionCategory | string;
  text: string;
  usage_count?: number;
  created_at: string;
}

export type RecognitionCategory =
  | 'Academic achievement'
  | 'Improvement'
  | 'Participation'
  | 'Effort'
  | 'Teamwork'
  | 'Project quality'
  | 'Helping classmates'
  | 'Consistency';

export interface RecognitionItem {
  id: string;
  teacher_id?: string;
  teacher?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_subject?: string;
  student_id: string;
  student_first_name?: string;
  student_last_name?: string;
  category: RecognitionCategory | string;
  badge_type?: string;
  reason: string;
  created_at: string;
}

export type TeacherRecognition = RecognitionItem;

export type NotificationType =
  | 'feedback'
  | 'feedback_updated'
  | 'goal_created'
  | 'goal_updated'
  | 'goal_deadline'
  | 'goal_completed'
  | 'recognition'
  | 'general_observation'
  | 'general_goal'
  | 'system';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

export interface TeacherDashboardData {
  teacher: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    subject: string;
  };
  counts: {
    totalStudents: number;
    feedbackGivenCount: number;
    activeGoalsCount: number;
    completedGoalsCount: number;
    generalObservationsCount: number;
    recognitionsCount: number;
  };
  recentFeedback: FeedbackItem[];
  recentGoals: GoalItem[];
  studentsPreview: Array<{ id: string; first_name: string; last_name: string; username: string }>;
}
