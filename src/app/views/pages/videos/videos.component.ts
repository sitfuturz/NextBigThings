import { Component, OnInit, AfterViewInit, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoService, Video, VideoResponse, CategoryService, Category } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { debounceTime, Subject } from 'rxjs';
import { environment } from 'src/env/env.local';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css'],
})
export class VideosComponent implements OnInit, AfterViewInit {
  videos: VideoResponse = {
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
  selectedCategory: string | null = null;
  selectedPremium: boolean | null = null;
  selectedVideo: Video | null = null;
  videoModal: any;
  videoViewModal: any;
  editMode: boolean = false;
  
  newVideo = {
    title: '',
    description: '',
    categoryId: '',
    isPremium: false,
    videoFile: null as File | null
  };

  categories: Category[] = [];
  
  private searchSubject = new Subject<string>();
  
  payload = {
    page: 1,
    limit: 10,
    search: '',
    categoryId: null as string | null,
    isPremium: null as boolean | null
  };

  constructor(
    @Inject(VideoService) private videoService: VideoService,
    @Inject(CategoryService) private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchVideos();
    });
  }

  ngOnInit(): void {
    this.fetchVideos();
    this.fetchCategories();
  }

  ngAfterViewInit(): void {
    // Initialize modal properly with a delay to ensure DOM is fully loaded
    setTimeout(() => {
      const modalElement = document.getElementById('videoModal');
      const videoViewElement = document.getElementById('videoViewModal');
      
      if (modalElement) {
        this.videoModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
      
      if (videoViewElement) {
        this.videoViewModal = new bootstrap.Modal(videoViewElement);
      } else {
        console.warn('Video view modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchVideos(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search,
        categoryId: this.payload.categoryId,
        isPremium: this.payload.isPremium
      };
      
      const response = await this.videoService.getVideos(requestData);
      this.videos = response;
      this.cdr.detectChanges();
      
      // Initialize video elements after data is loaded
      setTimeout(() => {
        this.initializeVideoElements();
      }, 100);
    } catch (error) {
      console.error('Error fetching videos:', error);
      swalHelper.showToast('Failed to fetch videos', 'error');
    } finally {
      this.loading = false;
    }
  }

  initializeVideoElements(): void {
    const videoElements = document.querySelectorAll('.video-thumbnail');
    videoElements.forEach((element: Element) => {
      const video = element as HTMLVideoElement;
      if (video.src) {
        // Set up video event listeners
        video.addEventListener('loadstart', () => {
          console.log('Video loading started');
        });
        
        video.addEventListener('canplay', () => {
          console.log('Video can play');
        });
        
        video.addEventListener('error', (e) => {
          console.error('Video load error:', e);
          const container = video.closest('.video-preview-container') as HTMLElement;
          if (container) {
            container.classList.add('paused');
            const overlay = container.querySelector('.play-overlay') as HTMLElement;
            if (overlay) {
              overlay.style.opacity = '1';
            }
          }
        });
      }
    });
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
    this.fetchVideos();
  }

  onPremiumChange(): void {
    this.payload.page = 1;
    this.payload.isPremium = this.selectedPremium;
    this.fetchVideos();
  }
  
  onChange(): void {
    this.payload.page = 1;
    this.fetchVideos();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchVideos();
  }

  openAddVideoModal(): void {
    this.editMode = false;
    this.newVideo = {
      title: '',
      description: '',
      categoryId: '',
      isPremium: false,
      videoFile: null as File | null
    };
    
    this.showModal();
  }

  openEditVideoModal(video: Video): void {
    this.editMode = true;
    this.selectedVideo = video;
    this.newVideo = {
      title: video.title,
      description: video.description || '',
      categoryId: video.categoryId && typeof video.categoryId === 'object' ? video.categoryId._id : video.categoryId || '',
      isPremium: video.isPremium || false,
      videoFile: null as File | null // Don't pre-populate video file in edit mode
    };
    
    this.showModal();
  }
  
  showModal(): void {
    // Force detect changes
    this.cdr.detectChanges();
    
    if (this.videoModal) {
      this.videoModal.show();
    } else {
      try {
        const modalElement = document.getElementById('videoModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.videoModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#videoModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        // Last resort fallback
        $('#videoModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.videoModal) {
      this.videoModal.hide();
    } else {
      $('#videoModal').modal('hide');
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        swalHelper.showToast('Please select a valid video file', 'error');
        return;
      }
      
      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        swalHelper.showToast('Video file size must be less than 100MB', 'error');
        return;
      }
      
      this.newVideo.videoFile = file;
    } else {
      // User cleared the file selection
      this.newVideo.videoFile = null;
    }
  }

  clearVideoFile(): void {
    this.newVideo.videoFile = null;
    // Clear the file input
    const fileInput = document.getElementById('videoFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async saveVideo(): Promise<void> {
    try {
      // Validation for required fields
      if (!this.newVideo.title || !this.newVideo.categoryId) {
        swalHelper.showToast('Please fill all required fields', 'warning');
        return;
      }

      // For new videos, video file is required
      if (!this.editMode && !this.newVideo.videoFile) {
        swalHelper.showToast('Please select a video file', 'warning');
        return;
      }

      // For edit mode, video file is optional (only required if user wants to update the video)
      if (this.editMode && !this.newVideo.videoFile) {
        // User doesn't want to update the video file, just update other fields
        console.log('Updating video without changing the video file');
      }

      this.loading = true;

      const formData = new FormData();
      formData.append('title', this.newVideo.title);
      formData.append('description', this.newVideo.description);
      formData.append('categoryId', this.newVideo.categoryId);
      formData.append('isPremium', this.newVideo.isPremium.toString());
      
      // Only append video file if it exists (for new videos or when updating video file)
      if (this.newVideo.videoFile) {
        formData.append('videoFile', this.newVideo.videoFile);
      }

      const response = this.editMode && this.selectedVideo
        ? await this.videoService.updateVideo(this.selectedVideo._id, formData)
        : await this.videoService.createVideo(formData);

      if (response && response.success) {
        swalHelper.showToast(`Video ${this.editMode ? 'updated' : 'created'} successfully`, 'success');
        this.closeModal();
        this.fetchVideos();
      } else {
        swalHelper.showToast(response.message || `Failed to ${this.editMode ? 'update' : 'create'} video`, 'error');
      }
    } catch (error: any) {
      console.error('Error saving video:', error);
      swalHelper.showToast(error.message || 'Failed to save video', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteVideo(videoId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete Video',
        'Are you sure you want to delete this video? This action cannot be undone.',
        'warning'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const response = await this.videoService.deleteVideo(videoId);
          
          if (response && response.success) {
            swalHelper.showToast('Video deleted successfully', 'success');
            this.fetchVideos();
          } else {
            swalHelper.showToast(response.message || 'Failed to delete video', 'error');
          }
        } catch (error) {
          console.error('Error deleting video:', error);
          swalHelper.showToast('Failed to delete video', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }

  async toggleVideoPremiumStatus(video: Video): Promise<void> {
    try {
      const newPremiumStatus = !video.isPremium;
      const statusText = newPremiumStatus ? 'Premium' : 'Free';
      
      const result = await swalHelper.confirmation(
        'Toggle Video Status',
        `Are you sure you want to change this video to ${statusText}?`,
        'question'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const formData = new FormData();
          formData.append('title', video.title);
          formData.append('description', video.description || '');
          formData.append('categoryId', video.categoryId && typeof video.categoryId === 'object' ? video.categoryId._id : video.categoryId || '');
          formData.append('isPremium', newPremiumStatus.toString());
          
          const response = await this.videoService.updateVideo(video._id, formData);
          
          if (response && response.success) {
            // Update the video object in the local array
            video.isPremium = newPremiumStatus;
            swalHelper.showToast(`Video status changed to ${statusText}`, 'success');
          } else {
            swalHelper.showToast(response.message || 'Failed to update video status', 'error');
          }
        } catch (error) {
          console.error('Error updating video status:', error);
          swalHelper.showToast('Failed to update video status', 'error');
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

  // Video preview methods
  getVideoUrl(url: string): string {
    if (!url) {
      console.log('No video URL provided');
      return '';
    }
    
    let finalUrl = '';
    // If URL is already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      finalUrl = url;
    } else {
      // Use the imageUrl from environment as base URL
      const baseUrl = environment.imageUrl;
      // Remove leading slash if present to avoid double slashes
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      finalUrl = `${baseUrl}${cleanUrl}`;
    }
    
    console.log('Generated video URL:', finalUrl);
    return finalUrl;
  }

  getVideoPoster(url: string): string {
    // Generate a simple poster/thumbnail placeholder
    return '';
  }

  getNewVideoUrl(): string {
    if (this.newVideo.videoFile) {
      return URL.createObjectURL(this.newVideo.videoFile);
    }
    return '';
  }

  playPreview(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video && video.src) {
      const container = video.closest('.video-preview-container') as HTMLElement;
      
      // Hide play overlay
      if (container) {
        container.classList.remove('paused');
        container.classList.add('playing');
        const overlay = container.querySelector('.play-overlay') as HTMLElement;
        if (overlay) {
          overlay.style.opacity = '0';
        }
      }
      
      video.currentTime = 0; // Start from beginning
      video.play().catch(e => {
        console.log('Video play failed:', e);
        // If autoplay fails, show the play overlay
        if (container) {
          container.classList.remove('playing');
          container.classList.add('paused');
          const overlay = container.querySelector('.play-overlay') as HTMLElement;
          if (overlay) {
            overlay.style.opacity = '1';
          }
        }
      });
    }
  }

  pausePreview(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video) {
      const container = video.closest('.video-preview-container') as HTMLElement;
      
      video.pause();
      video.currentTime = 0;
      
      // Show play overlay again
      if (container) {
        container.classList.remove('playing');
        container.classList.add('paused');
        const overlay = container.querySelector('.play-overlay') as HTMLElement;
        if (overlay) {
          overlay.style.opacity = '1';
        }
      }
    }
  }

  onVideoLoaded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    console.log('Video loaded successfully:', video.src);
    const container = video.closest('.video-preview-container') as HTMLElement;
    if (container) {
      container.classList.add('paused');
    }
  }

  onVideoError(event: Event): void {
    const video = event.target as HTMLVideoElement;
    console.error('Video failed to load:', video.src);
    const container = video.closest('.video-preview-container') as HTMLElement;
    if (container) {
      container.classList.add('paused');
      const overlay = container.querySelector('.play-overlay') as HTMLElement;
      if (overlay) {
        overlay.style.opacity = '1';
      }
    }
  }

  openVideoModal(video: Video): void {
    this.selectedVideo = video;
    if (this.videoViewModal) {
      this.videoViewModal.show();
    } else {
      try {
        const modalElement = document.getElementById('videoViewModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.videoViewModal = modalInstance;
          modalInstance.show();
        } else {
          $('#videoViewModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing video modal:', error);
        $('#videoViewModal').modal('show');
      }
    }
  }
}
