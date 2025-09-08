
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { WebinarService,  } from '../../../services/webinar.service';
import { Webinar, WebinarResponse, WebinarAnalytics, CreateWebinarData, UpdateWebinarData, StartStreamingData, ApproveRecordingData } from '../../../interface/webinar.interface';
import { AppStorage } from '../../../core/utilities/app-storage';
import { common } from '../../../core/constants/common';
import { swalHelper } from '../../../core/constants/swal-helper';
import { jwtDecode } from 'jwt-decode';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-webinar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  providers: [WebinarService, AppStorage],
  templateUrl: './webinar.component.html',
  styleUrls: ['./webinar.component.scss'],
})
export class WebinarComponent implements OnInit {
  webinars: WebinarResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
    pagingCounter:0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };

  loading: boolean = false;
  showWebinarModal: boolean = false;
  editMode: boolean = false;
  editingWebinarId: string | null = null;
  modalLoading: boolean = false;
  webinarForm: FormGroup;
  adminId: string = '';
  adminName: string = '';

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
    id: 'webinar-pagination',
  };

  private filterSubject = new Subject<void>();

  constructor(
    private webinarService: WebinarService,
    private storage: AppStorage,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.webinarForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(1000)]],
      topic: ['', [Validators.maxLength(100)]],
      host: ['', Validators.required],
      hostName: ['', [Validators.maxLength(100)]],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      zoomLink: ['', [Validators.required, Validators.pattern(/^(https?:\/\/[^\s$.?#].[^\s]*)$/)]],
      accessType: ['free', Validators.required],
      price: [0, [Validators.min(0)]],
      maxCapacity: [100, [Validators.min(1), Validators.max(1000)]],
      streamingTech: ['webrtc', Validators.required],
      allowChat: [true],
      allowQA: [true],
      category: [''],
      assignedBatch: [''],
      thumbnail: [null],
    }, {
      validators: this.priceValidator
    });

    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchWebinars();
    });
  }

  ngOnInit(): void {
    // Fetch admin ID and name from localStorage
    const token = this.storage.get(common.TOKEN);
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.adminId = decoded._id || '';
        this.adminName = decoded.name || 'Administrator';
        this.webinarForm.patchValue({
          host: this.adminId,
          hostName: this.adminName,
        });
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        swalHelper.showToast('Failed to load admin data', 'error');
      }
    } else {
      swalHelper.showToast('Admin data not found in localStorage', 'error');
    }
    this.filterSubject.next();
  }



  // Custom validator for price
  priceValidator(form: FormGroup) {
    const accessType = form.get('accessType')?.value;
    const price = form.get('price')?.value;
    if (accessType === 'paid' && (!price || price <= 0)) {
      form.get('price')?.setErrors({ required: true, min: true });
      return { invalidPrice: true };
    }
    return null;
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

  openWebinarModal(webinar?: Webinar): void {
    this.showWebinarModal = true;
    this.editMode = !!webinar;
    this.editingWebinarId = webinar?._id || null;

    if (webinar) {
      this.webinarForm.patchValue({
        title: webinar.title,
        description: webinar.description,
        topic: webinar.topic,
        host: webinar._id || this.adminId,
        hostName: webinar.hostName || this.adminName,
        date: this.formatDateForInput(new Date(webinar.date)),
        startTime: webinar.startTime,
        endTime: webinar.endTime,
        zoomLink: webinar.zoomLink,
        accessType: webinar.accessType,
        price: webinar.price,
        maxCapacity: webinar.maxCapacity,
        streamingTech: webinar.streamingTech,
        allowChat: webinar.allowChat,
        allowQA: webinar.allowQA,
        category: webinar.category,
        assignedBatch: webinar.assignedBatch,
        thumbnail: null,
      });
    } else {
      this.webinarForm.reset({
        host: this.adminId,
        hostName: this.adminName,
        accessType: 'free',
        price: 0,
        maxCapacity: 100,
        streamingTech: 'webrtc',
        allowChat: true,
        allowQA: true,
      });
    }
    this.cdr.detectChanges();
  }

  closeWebinarModal(): void {
    this.showWebinarModal = false;
    this.editMode = false;
    this.editingWebinarId = null;
    this.webinarForm.reset({
      host: this.adminId,
      hostName: this.adminName,
      accessType: 'free',
      price: 0,
      maxCapacity: 100,
      streamingTech: 'webrtc',
      allowChat: true,
      allowQA: true,
    });
    this.cdr.detectChanges();
  }

  async submitWebinar(): Promise<void> {
    if (this.webinarForm.invalid) {
      this.webinarForm.markAllAsTouched();
      this.logFormErrors();
      swalHelper.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    this.modalLoading = true;
    try {
      const formValue = this.webinarForm.value;
      const thumbnail = formValue.thumbnail;

      if (this.editMode && this.editingWebinarId) {
        const updateData: UpdateWebinarData = {
          webinarId: this.editingWebinarId,
          title: formValue.title,
          description: formValue.description,
          topic: formValue.topic,
          host: formValue.host,
          hostName: formValue.hostName,
          date: formValue.date,
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          zoomLink: formValue.zoomLink,
          accessType: formValue.accessType,
          price: formValue.price,
          maxCapacity: formValue.maxCapacity,
          streamingTech: formValue.streamingTech,
          allowChat: formValue.allowChat,
          allowQA: formValue.allowQA,
          category: formValue.category,
          assignedBatch: formValue.assignedBatch,
        };
        const response = await this.webinarService.updateWebinar(updateData, thumbnail);
        if (response.success) {
          swalHelper.showToast('Webinar updated successfully', 'success');
          this.closeWebinarModal();
          await this.fetchWebinars();
        } else {
          swalHelper.showToast(response.message || 'Failed to update webinar', 'error');
        }
      } else {
        const createData: CreateWebinarData = {
          title: formValue.title,
          description: formValue.description,
          topic: formValue.topic,
          host: formValue.host,
          hostName: formValue.hostName,
          date: formValue.date,
          startTime: formValue.startTime,
          endTime: formValue.endTime,
          zoomLink: formValue.zoomLink,
          accessType: formValue.accessType,
          price: formValue.price,
          maxCapacity: formValue.maxCapacity,
          streamingTech: formValue.streamingTech,
          allowChat: formValue.allowChat,
          allowQA: formValue.allowQA,
          category: formValue.category,
          assignedBatch: formValue.assignedBatch,
        };
        const response = await this.webinarService.createWebinar(createData, thumbnail);
        if (response.success) {
          swalHelper.showToast('Webinar created successfully', 'success');
          this.closeWebinarModal();
          await this.fetchWebinars();
        } else {
          swalHelper.showToast(response.message || 'Failed to create webinar', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error saving webinar:', error);
      swalHelper.showToast(error.message || 'Failed to save webinar', 'error');
    } finally {
      this.modalLoading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteWebinar(webinarId: string): Promise<void> {
    this.loading = true;
    try {
      const response = await this.webinarService.deleteWebinar(webinarId);
      if (response.success) {
        swalHelper.showToast('Webinar deleted successfully', 'success');
        await this.fetchWebinars();
      } else {
        swalHelper.showToast(response.message || 'Failed to delete webinar', 'error');
      }
    } catch (error) {
      console.error('Error deleting webinar:', error);
      swalHelper.showToast('Failed to delete webinar', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async viewWebinarDetails(webinarId: string): Promise<void> {
    this.loading = true;
    try {
      const response = await this.webinarService.getWebinarById(webinarId);
      if (response.success && response.data) {
        console.log("wertyuio",response.data)
        this.openWebinarModal(response.data); // Open in view/edit mode
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch webinar details', 'error');
      }
    } catch (error) {
      console.error('Error fetching webinar details:', error);
      swalHelper.showToast('Failed to fetch webinar details', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private logFormErrors(): void {
    Object.keys(this.webinarForm.controls).forEach((key) => {
      const controlErrors = this.webinarForm.get(key)?.errors;
      if (controlErrors) {
        console.log(`Field: ${key}, Errors:`, controlErrors);
      }
    });
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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.webinarForm.patchValue({ thumbnail: input.files[0] });
    }
  }
}