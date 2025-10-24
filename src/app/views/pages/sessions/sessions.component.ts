import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService, Session, SessionResponse, CategoryService, Category } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { debounceTime, Subject } from 'rxjs';
import { environment } from 'src/env/env.local';

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
  filePreviewModal: any;
  urlFilesModal: any;
  editMode: boolean = false;
  
  // File preview properties
  previewFileUrl: string = '';
  previewFileName: string = '';
  previewFileType: 'image' | 'video' | 'file' = 'file';
  
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
    videos: null as File[] | null,
    videoUrls: [] as string[]
  };

  videoInputType: 'file' | 'url' = 'file';

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
      const filePreviewElement = document.getElementById('filePreviewModal');
      const urlFilesElement = document.getElementById('urlFilesModal');
      
      if (modalElement) {
        this.sessionModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Session modal element not found in the DOM');
      }
      
      if (filePreviewElement) {
        this.filePreviewModal = new bootstrap.Modal(filePreviewElement, {
          backdrop: false,
          keyboard: false
        });
      } else {
        console.warn('File preview modal element not found in the DOM');
      }
      
      if (urlFilesElement) {
        this.urlFilesModal = new bootstrap.Modal(urlFilesElement, {
          backdrop: false,
          keyboard: false
        });
      } else {
        console.warn('URL Files modal element not found in the DOM');
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
    this.videoInputType = 'file';
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
      videos: null as File[] | null,
      videoUrls: []
    };
    
    this.showModal();
  }

  openEditSessionModal(session: Session): void {
    this.editMode = true;
    this.selectedSession = session;
    this.videoInputType = 'file';
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
      videos: null as File[] | null,
      videoUrls: []
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
    console.log('Files selected:', files?.length, 'Type:', type);
    if (files && files.length > 0) {
      if (type === 'thumbnail') {
        this.newSession.thumbnail = files[0] as File;
      } else if (type === 'files') {
        this.newSession.files = Array.from(files) as File[];
        console.log('Files array:', this.newSession.files.length);
      } else if (type === 'videos') {
        // Append new files to existing array instead of replacing
        const newFiles = Array.from(files) as File[];
        if (!this.newSession.videos) {
          this.newSession.videos = [];
        }
        this.newSession.videos = [...this.newSession.videos, ...newFiles];
        console.log('Videos array:', this.newSession.videos.length);
        // Clear the input to allow selecting the same file again
        event.target.value = '';
      }
    }
  }

  removeVideoFile(index: number): void {
    if (this.newSession.videos && this.newSession.videos.length > index) {
      this.newSession.videos.splice(index, 1);
    }
  }

  getFileName(file: File): string {
    return file.name;
  }

  clearFileInput(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  isValidUrl(url: string): boolean {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  addVideoUrl(): void {
    if (!this.newSession.videoUrls) {
      this.newSession.videoUrls = [];
    }
    this.newSession.videoUrls.push('');
  }

  removeVideoUrl(index: number): void {
    if (this.newSession.videoUrls) {
      this.newSession.videoUrls.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  async saveSession(): Promise<void> {
    try {
      if (!this.newSession.title || !this.newSession.url || !this.newSession.categoryId || !this.newSession.date || !this.newSession.startTime || !this.newSession.endTime) {
        swalHelper.showToast('Please fill all required fields', 'warning');
        return;
      }

      // Validate video URLs if using URL mode
      if (this.videoInputType === 'url' && this.newSession.videoUrls && this.newSession.videoUrls.length > 0) {
        for (let i = 0; i < this.newSession.videoUrls.length; i++) {
          const url = this.newSession.videoUrls[i];
          if (url && url.trim() !== '' && !this.isValidUrl(url)) {
            swalHelper.showToast(`Please enter a valid URL at position ${i + 1}`, 'error');
            return;
          }
        }
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
      
      // Handle video files OR video URLs (same field name 'videos')
      if (this.videoInputType === 'file' && this.newSession.videos && this.newSession.videos.length > 0) {
        console.log('Sending video files:', this.newSession.videos.length);
        this.newSession.videos.forEach((file: File) => {
          formData.append('videos', file);
        });
      } else if (this.videoInputType === 'url' && this.newSession.videoUrls && this.newSession.videoUrls.length > 0) {
        // Send URLs as strings in the 'videos' field
        console.log('Sending video URLs:', this.newSession.videoUrls.length);
        this.newSession.videoUrls.forEach((url: string) => {
          if (url && url.trim() !== '') {
            formData.append('videos', url.trim());
          }
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
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
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

  // File preview methods
  getFileUrl(filePath: string): string {
    if (!filePath) return '';
    
    // If URL is already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // Use environment imageUrl as base URL
    const baseUrl = environment.imageUrl;
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `${baseUrl}${cleanPath}`;
  }

  isImageFile(fileName: string): boolean {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return imageExtensions.includes(extension);
  }

  openFilePreview(filePath: string, type: 'image' | 'video' | 'file'): void {
    // Close the URL Files modal first if it's open
    if (this.urlFilesModal) {
      this.urlFilesModal.hide();
    }
    
    this.previewFileUrl = this.getFileUrl(filePath);
    this.previewFileName = filePath.split('/').pop() || filePath;
    this.previewFileType = type;
    
    if (this.filePreviewModal) {
      this.filePreviewModal.show();
    } else {
      try {
        const modalElement = document.getElementById('filePreviewModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: false,
            keyboard: false
          });
          this.filePreviewModal = modalInstance;
          modalInstance.show();
        } else {
          $('#filePreviewModal').modal({backdrop: false, keyboard: false}).modal('show');
        }
      } catch (error) {
        console.error('Error showing file preview modal:', error);
        $('#filePreviewModal').modal({backdrop: false, keyboard: false}).modal('show');
      }
    }
  }

  openUrlFilesModal(session: Session): void {
    // Close the file preview modal first if it's open
    if (this.filePreviewModal) {
      this.filePreviewModal.hide();
    }
    
    this.selectedSession = session;
    
    if (this.urlFilesModal) {
      this.urlFilesModal.show();
    } else {
      try {
        const modalElement = document.getElementById('urlFilesModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: false,
            keyboard: false
          });
          this.urlFilesModal = modalInstance;
          modalInstance.show();
        } else {
          $('#urlFilesModal').modal({backdrop: false, keyboard: false}).modal('show');
        }
      } catch (error) {
        console.error('Error showing URL Files modal:', error);
        $('#urlFilesModal').modal({backdrop: false, keyboard: false}).modal('show');
      }
    }
  }

  goBackToUrlFilesModal(): void {
    // Close the file preview modal
    if (this.filePreviewModal) {
      this.filePreviewModal.hide();
    }
    
    // Reopen the URL Files modal
    if (this.urlFilesModal) {
      this.urlFilesModal.show();
    }
  }

  async toggleSessionPremiumStatus(session: Session): Promise<void> {
    try {
      const newPremiumStatus = !session.isPremium;
      const statusText = newPremiumStatus ? 'Premium' : 'Free';
      
      const result = await swalHelper.confirmation(
        'Toggle Session Status',
        `Are you sure you want to change this session to ${statusText}?`,
        'question'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const formData = new FormData();
          formData.append('title', session.title);
          formData.append('description', session.description || '');
          formData.append('url', session.url || '');
          formData.append('categoryId', session.categoryId && typeof session.categoryId === 'object' ? session.categoryId._id : session.categoryId || '');
          formData.append('isPremium', newPremiumStatus.toString());
          formData.append('date', session.date ? new Date(session.date).toISOString().slice(0, 10) : '');
          formData.append('startTime', session.startTime || '');
          formData.append('endTime', session.endTime || '');
          
          const response = await this.sessionService.updateSession(session._id, formData);
          
          if (response && response.success) {
            // Update the session object in the local array
            session.isPremium = newPremiumStatus;
            swalHelper.showToast(`Session status changed to ${statusText}`, 'success');
          } else {
            swalHelper.showToast(response.message || 'Failed to update session status', 'error');
          }
        } catch (error) {
          console.error('Error updating session status:', error);
          swalHelper.showToast('Failed to update session status', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }
}
