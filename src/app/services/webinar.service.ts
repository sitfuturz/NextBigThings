import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { Webinar, WebinarResponse, WebinarAnalytics, CreateWebinarData, UpdateWebinarData, StartStreamingData, ApproveRecordingData } from '../interface/webinar.interface';

@Injectable({
  providedIn: 'root',
})
export class WebinarService {
  private headers: any[] = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    const token = this.storage.get(common.TOKEN);
    if (token) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async createWebinar(data: CreateWebinarData, thumbnail?: File): Promise<any> {
    try {
      this.getHeaders();
      const formData = new FormData();
      
      // Append all data fields
      Object.keys(data).forEach(key => {
        if (data[key as keyof CreateWebinarData] !== undefined) {
          formData.append(key, data[key as keyof CreateWebinarData] as string);
        }
      });
      
      // Append thumbnail if provided
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_WEBINAR,
          method: 'POST',
        },
        formData,
        this.headers
      );
      
      swalHelper.showToast('Webinar created successfully', 'success');
      return response;
    } catch (error) {
      console.error('Create Webinar Error:', error);
      swalHelper.showToast('Failed to create webinar', 'error');
      throw error;
    }
  }

  async getAllWebinars(params: {
    page?: number;
    limit?: number;
    status?: string;
    accessType?: string;
    search?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WebinarResponse> {
    try {
      this.getHeaders();
      
      let queryParams = new HttpParams();
      if (params.page) queryParams = queryParams.set('page', params.page.toString());
      if (params.limit) queryParams = queryParams.set('limit', params.limit.toString());
      if (params.status) queryParams = queryParams.set('status', params.status);
      if (params.accessType) queryParams = queryParams.set('accessType', params.accessType);
      if (params.search) queryParams = queryParams.set('search', encodeURIComponent(params.search));
      if (params.category) queryParams = queryParams.set('category', encodeURIComponent(params.category));
      if (params.startDate) queryParams = queryParams.set('startDate', params.startDate);
      if (params.endDate) queryParams = queryParams.set('endDate', params.endDate);

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_ALL_WEBINARS}?${queryParams.toString()}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Webinars Error:', error);
      swalHelper.showToast('Failed to fetch webinars', 'error');
      throw error;
    }
  }

  async getWebinarById(webinarId: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_WEBINAR,
          method: 'POST',
        },
        { webinarId },
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Get Webinar By ID Error:', error);
      swalHelper.showToast('Failed to fetch webinar details', 'error');
      throw error;
    }
  }

  async updateWebinar(data: UpdateWebinarData, thumbnail?: File): Promise<any> {
    try {
      this.getHeaders();
      const formData = new FormData();
      
      // Append all data fields
      Object.keys(data).forEach(key => {
        if (data[key as keyof UpdateWebinarData] !== undefined) {
          formData.append(key, data[key as keyof UpdateWebinarData] as string);
        }
      });
      
      // Append thumbnail if provided
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_WEBINAR,
          method: 'POST',
        },
        formData,
        this.headers
      );
      
      swalHelper.showToast('Webinar updated successfully', 'success');
      return response;
    } catch (error) {
      console.error('Update Webinar Error:', error);
      swalHelper.showToast('Failed to update webinar', 'error');
      throw error;
    }
  }

  async deleteWebinar(webinarId: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_WEBINAR,
          method: 'POST',
        },
        { webinarId },
        this.headers
      );
      
      swalHelper.showToast('Webinar deleted successfully', 'success');
      return response;
    } catch (error) {
      console.error('Delete Webinar Error:', error);
      swalHelper.showToast('Failed to delete webinar', 'error');
      throw error;
    }
  }

  async startStreaming(webinarId: string, data: StartStreamingData): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.START_STREAMING}/${webinarId}`,
          method: 'POST',
        },
        data,
        this.headers
      );
      
      swalHelper.showToast('Webinar streaming started', 'success');
      return response;
    } catch (error) {
      console.error('Start Streaming Error:', error);
      swalHelper.showToast('Failed to start webinar streaming', 'error');
      throw error;
    }
  }

  async endWebinar(webinarId: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.END_WEBINAR}/${webinarId}`,
          method: 'POST',
        },
        null,
        this.headers
      );
      
      swalHelper.showToast('Webinar ended successfully', 'success');
      return response;
    } catch (error) {
      console.error('End Webinar Error:', error);
      swalHelper.showToast('Failed to end webinar', 'error');
      throw error;
    }
  }

  async uploadRecording(webinarId: string, recordingUrl: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPLOAD_RECORDING}/${webinarId}`,
          method: 'POST',
        },
        { recordingUrl },
        this.headers
      );
      
      swalHelper.showToast('Recording uploaded successfully', 'success');
      return response;
    } catch (error) {
      console.error('Upload Recording Error:', error);
      swalHelper.showToast('Failed to upload recording', 'error');
      throw error;
    }
  }

  async approveRecordingRequest(webinarId: string, requestId: string, data: ApproveRecordingData): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.APPROVE_RECORDING}/${webinarId}/${requestId}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      swalHelper.showToast(`Recording request ${data.status}`, 'success');
      return response;
    } catch (error) {
      console.error('Approve Recording Request Error:', error);
      swalHelper.showToast('Failed to process recording request', 'error');
      throw error;
    }
  }

  async getWebinarAnalytics(webinarId: string): Promise<WebinarAnalytics> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_WEBINAR_ANALYTICS}/${webinarId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Webinar Analytics Error:', error);
      swalHelper.showToast('Failed to fetch webinar analytics', 'error');
      throw error;
    }
  }
}