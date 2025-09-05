import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatchService, Batch, BatchResponse } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-batch',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [BatchService],
  templateUrl: 'batch.component.html',
  styleUrls: ['./batch.component.css'],
})
export class BatchComponent implements OnInit, AfterViewInit {
  batches: BatchResponse = {
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
  selectedBatch: Batch | null = null;
  batchModal: any;
  editMode: boolean = false;
  
  newBatch = {
    name: '',
    startDate: '',
    endDate: '',
    capacity: 0
  };
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  constructor(
    private batchService: BatchService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchBatches();
    });
  }

  ngOnInit(): void {
    this.fetchBatches();
  }

  ngAfterViewInit(): void {
    // Initialize modal properly with a delay to ensure DOM is fully loaded
    setTimeout(() => {
      const modalElement = document.getElementById('batchModal');
      if (modalElement) {
        this.batchModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchBatches(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      
      const response = await this.batchService.getBatches(requestData);
      this.batches = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching batches:', error);
      swalHelper.showToast('Failed to fetch batches', 'error');
    } finally {
      this.loading = false;
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }
  
  onChange(): void {
    this.payload.page = 1;
    this.fetchBatches();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchBatches();
  }

  openAddBatchModal(): void {
    this.editMode = false;
    this.newBatch = {
      name: '',
      startDate: '',
      endDate: '',
      capacity: 0
    };
    
    this.showModal();
  }

  openEditBatchModal(batch: Batch): void {
    this.editMode = true;
    this.selectedBatch = batch;
    
    // Format dates for HTML date input (YYYY-MM-DD format)
    const formatDateForInput = (dateString: string): string => {
      if (!dateString) return '';
      
      try {
        // Handle different date formats
        let date: Date;
        
        // If it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        
        // Try to parse the date
        date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', dateString);
          return '';
        }
        
        // Return in YYYY-MM-DD format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return '';
      }
    };
    
    this.newBatch = {
      name: batch.name,
      startDate: formatDateForInput(batch.startDate),
      endDate: formatDateForInput(batch.endDate),
      capacity: batch.capacity
    };
    
    console.log('Editing batch:', batch);
    console.log('Formatted newBatch:', this.newBatch);
    
    this.showModal();
  }
  
  showModal(): void {
    // Force detect changes
    this.cdr.detectChanges();
    
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      if (this.batchModal) {
        this.batchModal.show();
      } else {
        try {
          const modalElement = document.getElementById('batchModal');
          if (modalElement) {
            const modalInstance = new bootstrap.Modal(modalElement);
            this.batchModal = modalInstance;
            modalInstance.show();
          } else {
            // Fallback to jQuery
            $('#batchModal').modal('show');
          }
        } catch (error) {
          console.error('Error showing modal:', error);
          // Last resort fallback
          $('#batchModal').modal('show');
        }
      }
    }, 100);
  }
  
  closeModal(): void {
    if (this.batchModal) {
      this.batchModal.hide();
    } else {
      $('#batchModal').modal('hide');
    }
  }

  async saveBatch(): Promise<void> {
    try {
      if (!this.newBatch.name || !this.newBatch.startDate || !this.newBatch.endDate || !this.newBatch.capacity) {
        swalHelper.showToast('Please fill all required fields', 'warning');
        return;
      }

      // Validate dates
      const startDate = new Date(this.newBatch.startDate);
      const endDate = new Date(this.newBatch.endDate);
      
      if (startDate >= endDate) {
        swalHelper.showToast('End date must be after start date', 'warning');
        return;
      }

      // Validate capacity
      if (this.newBatch.capacity <= 0) {
        swalHelper.showToast('Capacity must be greater than 0', 'warning');
        return;
      }

      this.loading = true;

      const response = this.editMode && this.selectedBatch
        ? await this.batchService.updateBatch({
            batchId: this.selectedBatch._id,
            name: this.newBatch.name,
            startDate: this.newBatch.startDate,
            endDate: this.newBatch.endDate,
            capacity: this.newBatch.capacity
          })
        : await this.batchService.createBatch(this.newBatch);

      console.log('Response:', response); // Debug log

      if (response && response.success) {
        swalHelper.showToast(`Batch ${this.editMode ? 'updated' : 'created'} successfully`, 'success');
        this.closeModal();
        this.fetchBatches();
      } else {
        swalHelper.showToast(response?.message || `Failed to ${this.editMode ? 'update' : 'create'} batch`, 'error');
      }
    } catch (error: any) {
      console.error('Error saving batch:', error);
      console.log('Error details:', JSON.stringify(error, null, 2));
      swalHelper.showToast(error?.response?.data?.message || error?.message || 'Failed to save batch', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteBatch(batchId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete Batch',
        'Are you sure you want to delete this batch? This action cannot be undone.',
        'warning'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const response = await this.batchService.deleteBatch(batchId);
          
          if (response && response.success) {
            swalHelper.showToast('Batch deleted successfully', 'success');
            this.fetchBatches();
          } else {
            swalHelper.showToast(response.message || 'Failed to delete batch', 'error');
          }
        } catch (error) {
          console.error('Error deleting batch:', error);
          swalHelper.showToast('Failed to delete batch', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }

  // Format date helper function for display (DD/MM/YYYY)
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      // Format as DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  }

  // Get batch status based on dates
  getBatchStatus(batch: Batch): string {
    const now = new Date();
    const startDate = new Date(batch.startDate);
    const endDate = new Date(batch.endDate);
    
    if (now < startDate) {
      return 'Upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'Active';
    } else {
      return 'Completed';
    }
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'badge bg-success';
      case 'Upcoming':
        return 'badge bg-warning';
      case 'Completed':
        return 'badge bg-secondary';
      default:
        return 'badge bg-light';
    }
  }
}