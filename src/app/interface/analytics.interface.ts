export interface UserMetrics {
  total: number;
  newToday: number;
  newThisMonth: number;
  verified: number;
  unverified: number;
  recentWeek: number;
}

export interface WebinarMetrics {
  total: number;
  scheduled: number;
  live: number;
  completed: number;
  totalRegistrations: number;
  free: number;
  paid: number;
  recentWeek: number;
}

export interface EventMetrics {
  total: number;
  upcoming: number;
  past: number;
  byType: {
    event: number;
    meeting: number;
  };
  byMode: {
    online: number;
    offline: number;
  };
  recentWeek: number;
}

export interface FeedbackMetrics {
  complaints: {
    total: number;
    pending: number;
    resolved: number;
  };
  suggestions: {
    total: number;
    pending: number;
    implemented: number;
  };
}

export interface SummaryMetrics {
  totalUsers: number;
  totalWebinars: number;
  totalEvents: number;
  totalRegistrations: number;
  activeWebinars: number;
  upcomingEvents: number;
}

export interface DashboardAnalytics {
  userMetrics: UserMetrics;
  webinarMetrics: WebinarMetrics;
  eventMetrics: EventMetrics;
  feedbackMetrics: FeedbackMetrics;
  summary: SummaryMetrics;
}

export interface DashboardAnalyticsResponse {
  success: boolean;
  message: string;
  data: DashboardAnalytics;
}

export interface ChartData {
  labels: string[];
  data: number[];
  total: number;
}

export interface ChartDataResponse {
  success: boolean;
  message: string;
  data: ChartData;
}

export interface RecentActivity {
  type: 'user' | 'webinar' | 'event';
  action: string;
  details: string;
  timestamp: string;
  icon: string;
}

export interface RecentActivitiesResponse {
  success: boolean;
  message: string;
  data: RecentActivity[];
}