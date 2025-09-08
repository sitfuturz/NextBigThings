import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { 
  DashboardAnalyticsResponse, 
  ChartDataResponse, 
  RecentActivitiesResponse 
} from '../interface/analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private headers: any[] = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    const token = this.storage.get(common.TOKEN);
    if (token) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getDashboardAnalytics(days: number = 30): Promise<any> {
    try {
      this.getHeaders();
      
      let queryParams = new HttpParams();
      queryParams = queryParams.set('days', days.toString());

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_DASHBOARD_ANALYTICS}?${queryParams.toString()}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Get Dashboard Analytics Error:', error);
      swalHelper.showToast('Failed to fetch dashboard analytics', 'error');
      throw error;
    }
  }

  async getChartData(type: 'users' | 'webinars' | 'events', days: number = 30): Promise<any> {
    try {
      this.getHeaders();
      
      let queryParams = new HttpParams();
      queryParams = queryParams.set('type', type);
      queryParams = queryParams.set('days', days.toString());

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_CHART_DATA}?${queryParams.toString()}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Get Chart Data Error:', error);
      swalHelper.showToast('Failed to fetch chart data', 'error');
      throw error;
    }
  }

  async getRecentActivities(limit: number = 20): Promise<any> {
    try {
      this.getHeaders();
      
      let queryParams = new HttpParams();
      queryParams = queryParams.set('limit', limit.toString());

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_RECENT_ACTIVITIES}?${queryParams.toString()}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Get Recent Activities Error:', error);
      swalHelper.showToast('Failed to fetch recent activities', 'error');
      throw error;
    }
  }
}