import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionRequestService, SessionRequest, SessionRequestResponse, SessionService, Session } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { debounceTime, Subject } from 'rxjs';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-get-session-request',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [SessionRequestService, SessionService],
  templateUrl: './getSessionRequest.component.html',
  styleUrls: ['./getSessionRequest.component.css']
})
export class GetSessionRequestComponent implements OnInit, AfterViewInit {
  sessionRequests: SessionRequestResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  };
  
  loading: boolean = false;
  searchQuery: string = '';
  selectedStatus: string = '';
  selectedSession: string = '';
  selectedUser: string = '';
  
  // Filter options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];
  
  sessions: Session[] = [];
  users: any[] = [];
  
  private searchSubject = new Subject<string>();
  
  payload = {
    page: 1,
    limit: 10,
    status: '',
    sessionId: '',
    userId: ''
  };

  // Math reference for template
  Math = Math;
  Number = Number;

  constructor(
    private sessionRequestService: SessionRequestService,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchSessionRequests();
    });
  }

  ngOnInit(): void {
    this.fetchSessionRequests();
    this.fetchSessions();
  }


  async fetchSessionRequests(): Promise<void> {
    this.loading = true;
    try {
      const params = {
        page: this.payload.page,
        limit: this.payload.limit,
        status: this.payload.status || undefined,
        sessionId: this.payload.sessionId || undefined,
        userId: this.payload.userId || undefined
      };
      
      const response = await this.sessionRequestService.getSessionRequests(params);
      this.sessionRequests = response;
    } catch (error) {
      console.error('Error fetching session requests:', error);
      swalHelper.showToast('Failed to fetch session requests', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchSessions(): Promise<void> {
    try {
      const response = await this.sessionService.getSessions({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.sessions = response.docs;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      swalHelper.showToast('Failed to fetch sessions', 'error');
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.searchSubject.next(this.searchQuery);
  }

  onStatusChange(): void {
    this.payload.status = this.selectedStatus;
    this.payload.page = 1;
    this.fetchSessionRequests();
  }

  onSessionChange(): void {
    this.payload.sessionId = this.selectedSession;
    this.payload.page = 1;
    this.fetchSessionRequests();
  }

  onUserChange(): void {
    this.payload.userId = this.selectedUser;
    this.payload.page = 1;
    this.fetchSessionRequests();
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchSessionRequests();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchSessionRequests();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedSession = '';
    this.selectedUser = '';
    this.payload = {
      page: 1,
      limit: 10,
      status: '',
      sessionId: '',
      userId: ''
    };
    this.fetchSessionRequests();
  }

  exportSessionRequests(): void {
    // TODO: Implement export functionality
    swalHelper.showToast('Export functionality coming soon', 'info');
  }

  selectedRequest: SessionRequest | null = null;
  requestDetailsModal: any;

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('requestDetailsModal');
      if (modalElement) {
        this.requestDetailsModal = new bootstrap.Modal(modalElement);
      }
    }, 300);
  }

  viewRequestDetails(request: SessionRequest): void {
    this.selectedRequest = request;
    if (this.requestDetailsModal) {
      this.requestDetailsModal.show();
    }
  }

  async approveRequest(request: SessionRequest): Promise<void> {
    try {
      const response = await this.sessionRequestService.manageSessionRequest(request._id, 'approved');
      
      if (response && response.success) {
        swalHelper.showToast('Session request approved successfully', 'success');
        // Refresh the session requests list
        this.fetchSessionRequests();
        // Close modal if open
        if (this.requestDetailsModal) {
          this.requestDetailsModal.hide();
        }
      } else {
        // Show the specific error message from the API response
        const errorMessage = response?.error || response?.message || 'Failed to approve session request';
        swalHelper.showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Error approving session request:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to approve session request';
      
      if (error?.error?.error) {
        errorMessage = error.error.error;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      swalHelper.showToast(errorMessage, 'error');
    }
  }

  async rejectRequest(request: SessionRequest): Promise<void> {
    try {
      const response = await this.sessionRequestService.manageSessionRequest(request._id, 'rejected');
      
      if (response && response.success) {
        swalHelper.showToast('Session request rejected successfully', 'success');
        // Refresh the session requests list
        this.fetchSessionRequests();
        // Close modal if open
        if (this.requestDetailsModal) {
          this.requestDetailsModal.hide();
        }
      } else {
        // Show the specific error message from the API response
        const errorMessage = response?.error || response?.message || 'Failed to reject session request';
        swalHelper.showToast(errorMessage, 'error');
      }
    } catch (error: any) {
      console.error('Error rejecting session request:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to reject session request';
      
      if (error?.error?.error) {
        errorMessage = error.error.error;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      swalHelper.showToast(errorMessage, 'error');
    }
  }
}
