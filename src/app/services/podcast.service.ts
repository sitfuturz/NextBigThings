import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { environment } from 'src/env/env.local';

// ==================== PODCAST INTERFACES ====================
export interface Podcast {
  _id: string;
  podcasterName: string;
  podcasterImage: string;
  aboutPodcaster: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PodcastResponse {
  podcasts: Podcast[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UpcomingPodcastResponse {
  message: string;
  data: {
    podcasts: Podcast[];
    pagination: {
      totalDocs: number;
      limit: number;
      totalPages: number;
      page: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
  };
  status: number;
  success?: boolean;
}

// ==================== SLOT INTERFACES ====================
export interface Slot {
  _id: string;
  podcastId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: 'available' | 'booked' | 'closed';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isFull: boolean;
  id: string;
}

export interface SlotResponse {
  message: string;
  data: {
    slots: Slot[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  status: number;
  success?: boolean;
}

export interface SlotGenerationRequest {
  podcastId: string;
  dates: string[];
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
}

export interface GenerateSlotResponse {
  message: string;
  data: {
    slots: Slot[];
    errors?: string[];
  };
  status: number;
  success?: boolean;
}

// ==================== BOOKING INTERFACES ====================
export interface BookingUser {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  mobile_number?: string;
  chapter_name?: string;
}

export interface BookingSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: string;
  isFull: boolean;
  id: string;
}

export interface PodcastBooking {
  _id: string;
  slotId: BookingSlot;
  userId: BookingUser;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BookingResponse {
  message: string;
  data: {
    docs: PodcastBooking[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
  status: number;
  success?: boolean;
}

export interface BookingStatusUpdate {
  bookingId: string;
  action: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  adminNotes?: string;
}

export interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  rejectedBookings: number;
  cancelledBookings: number;
  acceptedBookings: number;
}

export interface RequestBookingData {
  slotId: string;
  userId: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PodcastSlotsBookingService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  getImageUrl(): string {
    return environment.imageUrl;
  }

  // ==================== PODCAST METHODS ====================

  async getAllPodcasts(data: { 
    page: number; 
    limit: number; 
    search?: string; 
    status?: string; 
    dateFrom?: string; 
    dateTo?: string 
  }): Promise<{ data: PodcastResponse }> {
    try {
      this.getHeaders();
      
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }
      if (data.status) {
        queryParams += `&status=${data.status}`;
      }
      if (data.dateFrom) {
        queryParams += `&dateFrom=${data.dateFrom}`;
      }
      if (data.dateTo) {
        queryParams += `&dateTo=${data.dateTo}`;
      }

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_All_PODCAST + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Get Podcasts Error:', error);
      swalHelper.showToast('Failed to fetch podcasts', 'error');
      throw error;
    }
  }

  async getUpcomingPodcasts(data: { page: number; limit: number }): Promise<UpcomingPodcastResponse> {
    try {
      this.getHeaders();

      const queryParams = `?page=${data.page}&limit=${data.limit}`;

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_UPCOMING_PODCASTS + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Get Upcoming Podcasts Error:', error);
      swalHelper.showToast('Failed to fetch upcoming podcasts', 'error');
      throw error;
    }
  }

  async createPodcast(formData: FormData): Promise<any> {
    try {
      this.getHeaders();
      const fileHeaders = this.headers.filter((header: any) => !header['Content-Type']);

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_PODCAST,
          method: 'POST',
        },
        formData,
        fileHeaders
      );

      return response;
    } catch (error: any) {
      console.error('Create Podcast Error:', error);
      if (error && error.error) {
        return error.error;
      }
      swalHelper.showToast('Failed to create podcast', 'error');
      throw error;
    }
  }

  async updatePodcast(id: string, formData: FormData): Promise<any> {
    try {
      this.getHeaders();
      const fileHeaders = this.headers.filter((header: any) => !header['Content-Type']);

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPDATE_PODCAST}/${id}`,
          method: 'PUT',
        },
        formData,
        fileHeaders
      );

      return response;
    } catch (error) {
      console.error('Update Podcast Error:', error);
      swalHelper.showToast('Failed to update podcast', 'error');
      throw error;
    }
  }

  async deletePodcast(id: string): Promise<any> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.DELETE_PODCAST}/${id}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Delete Podcast Error:', error);
      swalHelper.showToast('Failed to delete podcast', 'error');
      throw error;
    }
  }

  // ==================== SLOT METHODS ====================

  async generateSlots(data: SlotGenerationRequest): Promise<GenerateSlotResponse> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GENERATE_SLOTS,
          method: 'POST',
        },
        data,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Generate Slots Error:', error);
      swalHelper.showToast('Failed to generate slots', 'error');
      throw error;
    }
  }

  async getAvailableSlots(data: { 
    podcastId: string; 
    date: string; 
    page?: number; 
    limit?: number 
  }): Promise<any> {
    try {
      this.getHeaders();

      let queryParams = `?podcastId=${data.podcastId}&date=${data.date}`;
      if (data.page) {
        queryParams += `&page=${data.page}`;
      }
      if (data.limit) {
        queryParams += `&limit=${data.limit}`;
      }

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_AVAILABLE_SLOTS + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Get Available Slots Error:', error);
      swalHelper.showToast('Failed to fetch available slots', 'error');
      throw error;
    }
  }

  async getAllSlots(data: { 
    podcastId?: string; 
    date?: string; 
    status?: string; 
    page: number; 
    limit: number 
  }): Promise<SlotResponse> {
    try {
      this.getHeaders();

      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.podcastId) {
        queryParams += `&podcastId=${data.podcastId}`;
      }
      if (data.date) {
        queryParams += `&date=${data.date}`;
      }
      if (data.status) {
        queryParams += `&status=${data.status}`;
      }

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_SLOTS + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Get All Slots Error:', error);
      swalHelper.showToast('Failed to fetch slots', 'error');
      throw error;
    }
  }

  async updateSlot(id: string, data: { capacity?: number; status?: string }): Promise<any> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPDATE_SLOT}/${id}`,
          method: 'PUT',
        },
        data,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Update Slot Error:', error);
      swalHelper.showToast('Failed to update slot', 'error');
      throw error;
    }
  }

  async deleteSlot(id: string): Promise<any> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.DELETE_SLOT}/${id}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Delete Slot Error:', error);
      swalHelper.showToast('Failed to delete slot', 'error');
      throw error;
    }
  }

  async bulkDeleteSlots(slotIds: string[]): Promise<any> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.BULK_DELETE_SLOTS,
          method: 'POST',
        },
        { slotIds },
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Bulk Delete Slots Error:', error);
      swalHelper.showToast('Failed to delete slots', 'error');
      throw error;
    }
  }

  // ==================== BOOKING METHODS ====================

  async getBookingsByPodcastId(
    podcastId: string, 
    page: number = 1, 
    limit: number = 10, 
    search: string = ""
  ): Promise<any> {
    try {
      this.getHeaders();

      let queryParams = `?page=${page}&limit=${limit}`;
      if (search) {
        queryParams += `&search=${encodeURIComponent(search)}`;
      }

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.BOOKING_BY_PODCASTID}/${podcastId}${queryParams}`,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Get Bookings Error:', error);
      swalHelper.showToast('Failed to fetch bookings', 'error');
      throw error;
    }
  }

  async requestBooking(data: RequestBookingData): Promise<any> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.REQUEST_BOOKING,
          method: 'POST',
        },
        data,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Request Booking Error:', error);
      swalHelper.showToast('Failed to request booking', 'error');
      throw error;
    }
  }

  async updateBookingStatus(data: BookingStatusUpdate): Promise<any> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.STATUS_UPDATE_BOOKING,
          method: 'POST',
        },
        data,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Update Booking Status Error:', error);
      swalHelper.showToast('Failed to update booking status', 'error');
      throw error;
    }
  }

  async getAllBookingsByUserId(
    userId: string, 
    data: { page?: number; limit?: number }
  ): Promise<any> {
    try {
      this.getHeaders();

      let queryParams = `?page=${data.page || 1}&limit=${data.limit || 10}`;

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_ALL_BOOKINGS_BY_USER}/${userId}${queryParams}`,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Get User Bookings Error:', error);
      swalHelper.showToast('Failed to fetch user bookings', 'error');
      throw error;
    }
  }

  async getCompletedBookingStats(userId: string): Promise<any> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_COMPLETED_BOOKING_STATS}/${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response;
    } catch (error) {
      console.error('Get Booking Stats Error:', error);
      swalHelper.showToast('Failed to fetch booking statistics', 'error');
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  }

  formatDateTime(date: string, time: string): string {
    return `${this.formatDate(date)} at ${this.formatTime(time)}`;
  }

  isSlotAvailable(slot: Slot): boolean {
    return slot.status === 'available' && slot.bookedCount < slot.capacity && slot.isActive;
  }

  getRemainingCapacity(slot: Slot): number {
    return Math.max(0, slot.capacity - slot.bookedCount);
  }

  isSlotFull(slot: Slot): boolean {
    return slot.bookedCount >= slot.capacity;
  }

  getSlotOccupancyPercentage(slot: Slot): number {
    return Math.round((slot.bookedCount / slot.capacity) * 100);
  }

  canCancelBooking(booking: PodcastBooking, hoursBeforeSlot: number = 24): boolean {
    const slotDateTime = new Date(`${booking.slotId.date}T${booking.slotId.startTime}`);
    const now = new Date();
    const hoursDifference = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDifference > hoursBeforeSlot && 
           booking.status !== 'cancelled' && 
           booking.status !== 'rejected';
  }

  getBookingStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'primary';
    }
  }

  getSlotStatusColor(slot: Slot): string {
    if (!slot.isActive) return 'secondary';
    if (slot.status === 'closed') return 'danger';
    if (this.isSlotFull(slot)) return 'warning';
    if (slot.status === 'available') return 'success';
    return 'primary';
  }

  validateSlotGeneration(data: SlotGenerationRequest): string[] {
    const errors: string[] = [];
    
    if (!data.podcastId) errors.push('Podcast ID is required');
    if (!data.dates || data.dates.length === 0) errors.push('At least one date is required');
    if (!data.startTime) errors.push('Start time is required');
    if (!data.endTime) errors.push('End time is required');
    if (!data.duration || data.duration <= 0) errors.push('Valid duration is required');
    if (!data.capacity || data.capacity <= 0) errors.push('Valid capacity is required');

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (data.startTime && !timeRegex.test(data.startTime)) {
      errors.push('Invalid start time format (HH:mm)');
    }
    if (data.endTime && !timeRegex.test(data.endTime)) {
      errors.push('Invalid end time format (HH:mm)');
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.push('End time must be after start time');
    }

    return errors;
  }
}