import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../services/analytics.service';
import { 
  DashboardAnalytics, 
  ChartData, 
  RecentActivity 
} from '../../../interface/analytics.interface';
import { swalHelper } from '../../../core/constants/swal-helper';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AnalyticsService],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
})
export class AnalyticsComponent implements OnInit {
  analytics: DashboardAnalytics = {
    userMetrics: {
      total: 0,
      newToday: 0,
      newThisMonth: 0,
      verified: 0,
      unverified: 0,
      recentWeek: 0
    },
    webinarMetrics: {
      total: 0,
      scheduled: 0,
      live: 0,
      completed: 0,
      totalRegistrations: 0,
      free: 0,
      paid: 0,
      recentWeek: 0
    },
    eventMetrics: {
      total: 0,
      upcoming: 0,
      past: 0,
      byType: { event: 0, meeting: 0 },
      byMode: { online: 0, offline: 0 },
      recentWeek: 0
    },
    feedbackMetrics: {
      complaints: { total: 0, pending: 0, resolved: 0 },
      suggestions: { total: 0, pending: 0, implemented: 0 }
    },
    summary: {
      totalUsers: 0,
      totalWebinars: 0,
      totalEvents: 0,
      totalRegistrations: 0,
      activeWebinars: 0,
      upcomingEvents: 0
    }
  };

  chartData: { [key: string]: ChartData } = {
    users: { labels: [], data: [], total: 0 },
    webinars: { labels: [], data: [], total: 0 },
    events: { labels: [], data: [], total: 0 }
  };

  recentActivities: RecentActivity[] = [];
  
  loading: boolean = false;
  chartLoading: boolean = false;
  activitiesLoading: boolean = false;

  selectedDays: number = 30;
  selectedChartType: 'users' | 'webinars' | 'events' = 'users';

  Math = Math;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadChartData();
    this.loadRecentActivities();
  }

  async loadDashboardData(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.analyticsService.getDashboardAnalytics(this.selectedDays);
      this.analytics = response.data;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading dashboard analytics:', error);
      swalHelper.showToast('Failed to load dashboard analytics', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadChartData(): Promise<void> {
    this.chartLoading = true;
    try {
      // Load all chart types
      const [usersChart, webinarsChart, eventsChart] = await Promise.all([
        this.analyticsService.getChartData('users', this.selectedDays),
        this.analyticsService.getChartData('webinars', this.selectedDays),
        this.analyticsService.getChartData('events', this.selectedDays)
      ]);

      this.chartData = {
        users: usersChart.data,
        webinars: webinarsChart.data,
        events: eventsChart.data
      };

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading chart data:', error);
      swalHelper.showToast('Failed to load chart data', 'error');
    } finally {
      this.chartLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadRecentActivities(): Promise<void> {
    this.activitiesLoading = true;
    try {
      const response = await this.analyticsService.getRecentActivities(15);
      this.recentActivities = response.data;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading recent activities:', error);
      swalHelper.showToast('Failed to load recent activities', 'error');
    } finally {
      this.activitiesLoading = false;
      this.cdr.detectChanges();
    }
  }

  onDaysChange(): void {
    this.loadDashboardData();
    this.loadChartData();
  }

  onChartTypeChange(): void {
    this.cdr.detectChanges();
  }

  refreshData(): void {
    this.loadDashboardData();
    this.loadChartData();
    this.loadRecentActivities();
  }

  getProgressPercentage(current: number, total: number): number {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }

  getMetricIcon(type: string): string {
    switch (type) {
      case 'users': return 'bi-people';
      case 'webinars': return 'bi-camera-video';
      case 'events': return 'bi-calendar-event';
      case 'complaints': return 'bi-chat-dots';
      case 'suggestions': return 'bi-lightbulb';
      default: return 'bi-graph-up';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'live': 
      case 'resolved':
      case 'implemented': return 'bg-success';
      case 'scheduled':
      case 'pending': return 'bg-warning';
      case 'completed': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getCurrentChartData(): ChartData {
    return this.chartData[this.selectedChartType] || { labels: [], data: [], total: 0 };
  }

  getChartTitle(): string {
    switch (this.selectedChartType) {
      case 'users': return 'User Registrations';
      case 'webinars': return 'Webinar Creation';
      case 'events': return 'Event Creation';
      default: return 'Analytics';
    }
  }
}