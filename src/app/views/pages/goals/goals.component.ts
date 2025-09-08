import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { GoalsService } from '../../../services/goals.service';
import { Goal, GoalsResponse, GoalsAnalytics } from '../../../interface/goals.interface';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  providers: [GoalsService],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  analytics: GoalsAnalytics = {
    total_goals: 0,
    completed_goals: 0,
    in_progress_goals: 0,
    average_progress: 0
  };

  loading: boolean = false;
  showGoalModal: boolean = false;
  selectedGoal: Goal | null = null;

  // Pagination
  totalDocs: number = 0;
  currentPage: number = 1;
  limit: number = 20;
  totalPages: number = 0;

  Math = Math;

  // Filters
  filters = {
    page: 1,
    limit: 20,
    status: '' as string,
    category: '' as string,
  };

  // Filter options
  statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
  categoryOptions = ['Sales', 'Marketing', 'Operations', 'Finance', 'Product', 'Customer Service', 'HR', 'Other'];
  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  paginationConfig = {
    id: 'goals-pagination',
  };

  private filterSubject = new Subject<void>();

  constructor(
    private goalsService: GoalsService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchGoals();
    });
  }

  ngOnInit(): void {
    this.filterSubject.next();
  }

  async fetchGoals(): Promise<void> {
    this.loading = true;
    try {
      const requestParams = {
        page: this.filters.page,
        limit: this.filters.limit,
        status: this.filters.status || undefined,
        category: this.filters.category || undefined,
      };

      const response: GoalsResponse = await this.goalsService.getAllUsersGoals(requestParams);
      
      this.goals = response.goals.docs;
      this.analytics = response.analytics;
      this.totalDocs = response.goals.totalDocs;
      this.currentPage = response.goals.page;
      this.totalPages = response.goals.totalPages;
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching goals:', error);
      swalHelper.showToast('Failed to fetch goals', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.filterSubject.next();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.filterSubject.next();
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 20,
      status: '',
      category: '',
    };
    this.filterSubject.next();
  }

  openGoalModal(goal: Goal): void {
    this.selectedGoal = goal;
    this.showGoalModal = true;
    this.cdr.detectChanges();
  }

  closeGoalModal(): void {
    this.showGoalModal = false;
    this.selectedGoal = null;
    this.cdr.detectChanges();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'In Progress': return 'bg-primary';
      case 'Not Started': return 'bg-secondary';
      case 'On Hold': return 'bg-warning';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'Critical': return 'bg-danger';
      case 'High': return 'bg-warning';
      case 'Medium': return 'bg-info';
      case 'Low': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Sales': return 'bi-graph-up-arrow';
      case 'Marketing': return 'bi-megaphone';
      case 'Operations': return 'bi-gear';
      case 'Finance': return 'bi-currency-dollar';
      case 'Product': return 'bi-box';
      case 'Customer Service': return 'bi-headset';
      case 'HR': return 'bi-people';
      default: return 'bi-flag';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getProgressBarClass(percentage: number): string {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-info';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  getCompletedMilestones(milestones: any[]): number {
    return milestones.filter(m => m.completed).length;
  }

  calculateDaysRemaining(targetDate: string): number {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDaysRemainingText(targetDate: string): string {
    const days = this.calculateDaysRemaining(targetDate);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  }

  getDaysRemainingClass(targetDate: string): string {
    const days = this.calculateDaysRemaining(targetDate);
    if (days < 0) return 'text-danger';
    if (days <= 7) return 'text-warning';
    return 'text-success';
  }
}