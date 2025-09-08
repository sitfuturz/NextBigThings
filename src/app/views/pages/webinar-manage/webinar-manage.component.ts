import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { WebinarService } from '../../../services/webinar.service';
import { Webinar, WebinarResponse } from '../../../interface/webinar.interface';
import { AppStorage } from '../../../core/utilities/app-storage';
import { common } from '../../../core/constants/common';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-webinar-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  providers: [WebinarService, AppStorage],
  templateUrl: './webinar-manage.component.html',
  styleUrls: ['./webinar-manage.component.scss'],
})
export class WebinarManageComponent implements OnInit {
  webinars: WebinarResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
    pagingCounter: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };

  loading: boolean = false;
  
  // Modal states
  showStreamingModal: boolean = false;
  showRecordingModal: boolean = false;
  showRecordingRequestsModal: boolean = false;
  modalLoading: boolean = false;

  // Selected webinar for operations
  selectedWebinar: Webinar | null = null;
  
  // Forms
  streamingForm: FormGroup;
  recordingForm: FormGroup;

  // Recording requests
  recordingRequests: any[] = [];

  Math = Math;

  filters = {
    page: 1,
    limit: 10,
    status: null as string | null,
    accessType: null as string | null,
    search: '',
    category: '',
    startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))),
    endDate: this.formatDateForInput(new Date()),
  };

  paginationConfig = {
    id: 'webinar-manage-pagination',
  };

  private filterSubject = new Subject<void>();

  constructor(
    private webinarService: WebinarService,
    private storage: AppStorage,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.streamingForm = this.fb.group({
      streamingUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/[^\s$.?#].[^\s]*)$/)]]
    });

    this.recordingForm = this.fb.group({
      recordingUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/[^\s$.?#].[^\s]*)$/)]],
    });

    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchWebinars();
    });
  }

  ngOnInit(): void {
    this.filterSubject.next();
  }

  async fetchWebinars(): Promise<void> {
    this.loading = true;
    try {
      const requestParams = {
        page: this.filters.page,
        limit: this.filters.limit,
        status: this.filters.status || undefined,
        accessType: this.filters.accessType || undefined,
        search: this.filters.search || undefined,
        category: this.filters.category || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
      };
      const response = await this.webinarService.getAllWebinars(requestParams);
      this.webinars = {
        ...response,
        docs: response.docs.filter((webinar) => webinar && webinar._id && webinar.title),
      };
      this.filters.page = this.webinars.page;
      this.filters.limit = this.webinars.limit;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching webinars:', error);
      swalHelper.showToast('Failed to fetch webinars', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // Start Streaming Modal
  openStreamingModal(webinar: Webinar): void {
    this.selectedWebinar = webinar;
    this.showStreamingModal = true;
    this.streamingForm.reset();
    this.cdr.detectChanges();
  }

  closeStreamingModal(): void {
    this.showStreamingModal = false;
    this.selectedWebinar = null;
    this.streamingForm.reset();
    this.cdr.detectChanges();
  }

  async startStreaming(): Promise<void> {
    if (this.streamingForm.invalid || !this.selectedWebinar) {
      this.streamingForm.markAllAsTouched();
      swalHelper.showToast('Please provide a valid streaming URL', 'error');
      return;
    }

    this.modalLoading = true;
    try {
      const streamingData = {
        streamingUrl: this.streamingForm.value.streamingUrl
      };

      const response = await this.webinarService.startStreaming(this.selectedWebinar._id, streamingData);
      if (response.success) {
        swalHelper.showToast('Webinar streaming started successfully', 'success');
        this.closeStreamingModal();
        await this.fetchWebinars();
      } else {
        swalHelper.showToast(response.message || 'Failed to start streaming', 'error');
      }
    } catch (error: any) {
      console.error('Error starting streaming:', error);
      swalHelper.showToast(error.message || 'Failed to start streaming', 'error');
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  // End Webinar
  async endWebinar(webinar: Webinar): Promise<void> {
    const confirmResult = await swalHelper.confirmation(
      'End Webinar',
      'Are you sure you want to end this webinar? This action cannot be undone.',
      'warning'
    );

    if (!confirmResult.isConfirmed) return;

    this.loading = true;
    try {
      const response = await this.webinarService.endWebinar(webinar._id);
      if (response.success) {
        swalHelper.showToast('Webinar ended successfully', 'success');
        await this.fetchWebinars();
      } else {
        swalHelper.showToast(response.message || 'Failed to end webinar', 'error');
      }
    } catch (error: any) {
      console.error('Error ending webinar:', error);
      swalHelper.showToast(error.message || 'Failed to end webinar', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // Recording Upload Modal
  openRecordingModal(webinar: Webinar): void {
    this.selectedWebinar = webinar;
    this.showRecordingModal = true;
    this.recordingForm.reset();
    this.cdr.detectChanges();
  }

  closeRecordingModal(): void {
    this.showRecordingModal = false;
    this.selectedWebinar = null;
    this.recordingForm.reset();
    this.cdr.detectChanges();
  }

  async uploadRecording(): Promise<void> {
    if (this.recordingForm.invalid || !this.selectedWebinar) {
      this.recordingForm.markAllAsTouched();
      swalHelper.showToast('Please provide a valid recording URL', 'error');
      return;
    }

    this.modalLoading = true;
    try {
      const recordingUrl = this.recordingForm.value.recordingUrl;
      const response = await this.webinarService.uploadRecording(this.selectedWebinar._id, recordingUrl);
      
      if (response.success) {
        swalHelper.showToast('Recording uploaded successfully', 'success');
        this.closeRecordingModal();
        await this.fetchWebinars();
      } else {
        swalHelper.showToast(response.message || 'Failed to upload recording', 'error');
      }
    } catch (error: any) {
      console.error('Error uploading recording:', error);
      swalHelper.showToast(error.message || 'Failed to upload recording', 'error');
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Recording Requests Modal
  openRecordingRequestsModal(webinar: Webinar): void {
    this.selectedWebinar = webinar;
    this.recordingRequests = webinar.recordingRequests || [];
    this.showRecordingRequestsModal = true;
    this.cdr.detectChanges();
  }

  closeRecordingRequestsModal(): void {
    this.showRecordingRequestsModal = false;
    this.selectedWebinar = null;
    this.recordingRequests = [];
    this.cdr.detectChanges();
  }

  async approveRecordingRequest(requestId: string, status: 'approved' | 'rejected', adminNotes: string = ''): Promise<void> {
    if (!this.selectedWebinar) return;

    this.modalLoading = true;
    try {
      const approvalData = {
        status,
        adminNotes
      };

      const response = await this.webinarService.approveRecordingRequest(
        this.selectedWebinar._id, 
        requestId, 
        approvalData
      );

      if (response.success) {
        swalHelper.showToast(`Recording request ${status} successfully`, 'success');
        // Update local recording requests
        const requestIndex = this.recordingRequests.findIndex(req => req._id === requestId);
        if (requestIndex !== -1) {
          this.recordingRequests[requestIndex].status = status;
        }
        this.cdr.detectChanges();
      } else {
        swalHelper.showToast(response.message || `Failed to ${status} request`, 'error');
      }
    } catch (error: any) {
      console.error('Error processing recording request:', error);
      swalHelper.showToast(error.message || `Failed to ${status} request`, 'error');
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  // Helper methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'live': return 'bg-success';
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-secondary';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getRecordingStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ready': return 'bg-success';
      case 'processing': return 'bg-warning';
      case 'recording': return 'bg-info';
      case 'not_recorded': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  canStartStreaming(webinar: Webinar): boolean {
    return webinar.status === 'scheduled';
  }

  canEndWebinar(webinar: Webinar): boolean {
    return webinar.status === 'live';
  }

  canUploadRecording(webinar: Webinar): boolean {
    return webinar.status === 'completed' && !webinar.isRecorded;
  }

  hasRecordingRequests(webinar: Webinar): boolean {
    return webinar.recordingRequests && webinar.recordingRequests.length > 0;
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
      limit: 10,
      status: null,
      accessType: null,
      search: '',
      category: '',
      startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))),
      endDate: this.formatDateForInput(new Date()),
    };
    this.filterSubject.next();
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

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}