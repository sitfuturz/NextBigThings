import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService, Session, SessionResponse, CategoryService, Category } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { debounceTime, Subject } from 'rxjs';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css'],
})
export class SessionsComponent implements OnInit, AfterViewInit {
  sessions: SessionResponse = {
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
  selectedCategory: null = null;
  selectedPremium: boolean | null = null;
  selectedDate: string = '';
  selectedSession: Session | null = null;
  sessionModal: any;
  editMode: boolean = false;
  
  newSession = {
    title: '',
    description: '',
    url: '',
    categoryId: '',
    isPremium: false,
    date: '',
    startTime: '',
    endTime: '',
    thumbnail: null as File | null,
    files: null as File[] | null,
    videos: null as File[] | null
  };

  categories: Category[] = [];
  
  private searchSubject = new Subject<string>();
  
  payload = {
    page: 1,
    limit: 10,
    search: '',
    categoryId: null as string | null,
    isPremium: null as boolean | null,
    date: null as string | null
  };

  constructor(
    private sessionService: SessionService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchSessions();
    });
  }

  ngOnInit(): void {
    this.fetchSessions();
    this.fetchCategories();
  }

  ngAfterViewInit(): void {
    // Initialize modal properly with a delay to ensure DOM is fully loaded
    setTimeout(() => {
      const modalElement = document.getElementById('sessionModal');
      if (modalElement) {
        this.sessionModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchSessions(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search,
        categoryId: this.payload.categoryId,
        isPremium: this.payload.isPremium,
        date: this.payload.date
      };
      
      const response = await this.sessionService.getSessions(requestData);
      this.sessions = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching sessions:', error);
      swalHelper.showToast('Failed to fetch sessions', 'error');
    } finally {
      this.loading = false;
    }
  }

  async fetchCategories(): Promise<void> {
    try {
      const response = await this.categoryService.getCategories({ page: 1, limit: 1000 });
      this.categories = response.docs || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }

  onCategoryChange(): void {
    this.payload.page = 1;
    this.payload.categoryId = this.selectedCategory === '' ? null : this.selectedCategory;
    this.fetchSessions();
  }

  onPremiumChange(): void {
    this.payload.page = 1;
    this.payload.isPremium = this.selectedPremium;
    this.fetchSessions();
  }

  onDateChange(): void {
    this.payload.page = 1;
    this.payload.date = this.selectedDate === '' ? null : this.selectedDate;
    this.fetchSessions();
  }
  
  onChange(): void {
    this.payload.page = 1;
    this.fetchSessions();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchSessions();
  }

  openAddSessionModal(): void {
    this.editMode = false;
    this.newSession = {
      title: '',
      description: '',
      url: '',
      categoryId: '',
      isPremium: false,
      date: '',
      startTime: '',
      endTime: '',
      thumbnail: null as File | null,
      files: null as File[] | null,
      videos: null as File[] | null
    };
    
    this.showModal();
  }

  openEditSessionModal(session: Session): void {
    this.editMode = true;
    this.selectedSession = session;
    this.newSession = {
      title: session.title,
      description: session.description || '',
      url: session.url || '',
      categoryId: session.categoryId && typeof session.categoryId === 'object' ? session.categoryId._id : session.categoryId || '',
      isPremium: session.isPremium || false,
      date: session.date ? new Date(session.date).toISOString().slice(0, 10) : '',
      startTime: session.startTime || '',
      endTime: session.endTime || '',
      thumbnail: null as File | null,
      files: null as File[] | null,
      videos: null as File[] | null
    };
    
    this.showModal();
  }
  
  showModal(): void {
    // Force detect changes
    this.cdr.detectChanges();
    
    if (this.sessionModal) {
      this.sessionModal.show();
    } else {
      try {
        const modalElement = document.getElementById('sessionModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.sessionModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#sessionModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        // Last resort fallback
        $('#sessionModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.sessionModal) {
      this.sessionModal.hide();
    } else {
      $('#sessionModal').modal('hide');
    }
  }

  onFileChange(event: any, type: 'thumbnail' | 'files' | 'videos'): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (type === 'thumbnail') {
        this.newSession.thumbnail = files[0] as File;
      } else if (type === 'files') {
        this.newSession.files = Array.from(files) as File[];
      } else if (type === 'videos') {
        this.newSession.videos = Array.from(files) as File[];
      }
    }
  }

  async saveSession(): Promise<void> {
    try {
      if (!this.newSession.title || !this.newSession.url || !this.newSession.categoryId || !this.newSession.date || !this.newSession.startTime || !this.newSession.endTime) {
        swalHelper.showToast('Please fill all required fields', 'warning');
        return;
      }

      this.loading = true;

      const formData = new FormData();
      formData.append('title', this.newSession.title);
      formData.append('description', this.newSession.description);
      formData.append('url', this.newSession.url);
      formData.append('categoryId', this.newSession.categoryId);
      formData.append('isPremium', this.newSession.isPremium.toString());
      formData.append('date', this.newSession.date);
      formData.append('startTime', this.newSession.startTime);
      formData.append('endTime', this.newSession.endTime);
      
      if (this.newSession.thumbnail) {
        formData.append('thumbnail', this.newSession.thumbnail);
      }
      
      if (this.newSession.files && this.newSession.files.length > 0) {
        this.newSession.files.forEach((file: File) => {
          formData.append('files', file);
        });
      }
      
      if (this.newSession.videos && this.newSession.videos.length > 0) {
        this.newSession.videos.forEach((file: File) => {
          formData.append('videos', file);
        });
      }

      const response = this.editMode && this.selectedSession
        ? await this.sessionService.updateSession(this.selectedSession._id, formData)
        : await this.sessionService.createSession(formData);

      if (response && response.success) {
        swalHelper.showToast(`Session ${this.editMode ? 'updated' : 'created'} successfully`, 'success');
        this.closeModal();
        this.fetchSessions();
      } else {
        swalHelper.showToast(response.message || `Failed to ${this.editMode ? 'update' : 'create'} session`, 'error');
      }
    } catch (error: any) {
      console.error('Error saving session:', error);
      swalHelper.showToast(error.message || 'Failed to save session', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete Session',
        'Are you sure you want to delete this session? This action cannot be undone.',
        'warning'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const response = await this.sessionService.deleteSession(sessionId);
          
          if (response && response.success) {
            swalHelper.showToast('Session deleted successfully', 'success');
            this.fetchSessions();
          } else {
            swalHelper.showToast(response.message || 'Failed to delete session', 'error');
          }
        } catch (error) {
          console.error('Error deleting session:', error);
          swalHelper.showToast('Failed to delete session', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }

  // Format date helper function
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  formatDateOnly(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  formatDateTime(dateString: string, timeString: string): string {
    if (!dateString || !timeString) return 'N/A';
    const date = new Date(dateString);
    const time = timeString;
    return `${date.toLocaleDateString()} ${time}`;
  }
}
