import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { GoalsResponse } from '../interface/goals.interface';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private headers: any[] = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    const token = this.storage.get(common.TOKEN);
    if (token) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllUsersGoals(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }): Promise<GoalsResponse> {
    try {
      this.getHeaders();
      
      let queryParams = new HttpParams();
      if (params.page) queryParams = queryParams.set('page', params.page.toString());
      if (params.limit) queryParams = queryParams.set('limit', params.limit.toString());
      if (params.status) queryParams = queryParams.set('status', params.status);
      if (params.category) queryParams = queryParams.set('category', params.category);

      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_ALL_GOALS}?${queryParams.toString()}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get All Goals Error:', error);
      swalHelper.showToast('Failed to fetch goals', 'error');
      throw error;
    }
  }
}