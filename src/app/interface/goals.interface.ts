export interface User {
  _id: string;
  name: string;
  email: string;
  chapter_name?: string;
}

export interface Company {
  _id: string;
  company_name: string;
}

export interface LinkedActivity {
  activity_id: string;
  linked_at: string;
}

export interface Milestone {
  _id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  completion_date: string | null;
  linked_activities: LinkedActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface LinkedWebinar {
  webinar_id: string;
  assigned_by: string;
  assigned_at: string;
}

export interface TeamMember {
  user_id: string;
  role: 'Owner' | 'Contributor' | 'Viewer';
}

export interface Goal {
  _id: string;
  user_id: User;
  company_id: Company | null;
  title: string;
  description: string;
  category: 'Sales' | 'Marketing' | 'Operations' | 'Finance' | 'Product' | 'Customer Service' | 'HR' | 'Other';
  kpis: string;
  target_value: number;
  current_value: number;
  target_date: string;
  start_date: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress_percentage: number;
  milestones: Milestone[];
  linked_webinars: LinkedWebinar[];
  is_team_goal: boolean;
  team_members: TeamMember[];
  visibility: 'Private' | 'Team' | 'Public';
  completed_at: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GoalsData {
  docs: Goal[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface GoalsAnalytics {
  total_goals: number;
  completed_goals: number;
  in_progress_goals: number;
  average_progress: number;
}

export interface GoalsResponse {
  success: boolean;
  goals: GoalsData;
  analytics: GoalsAnalytics;
}