import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface LeaderboardPoint {
  _id: string;
  name: string;
  point: number;
  month_count?: number;
  amount_limit?: number;
  from_date?: string;
  to_date?: string;
  createdAt?: string;
  __v?: number;
  isDeleted?: boolean;
}

export interface LeaderboardResponse {
  docs: LeaderboardPoint[];
  totalDocs: string | number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface PointsHistory {
  _id: string;
  userId: string;
  name: string;
  chapter_name: string;
  profilePic: string;
  one_to_one: number;
  referal: number;
  attendance_regular: number;
  induction: number;
  visitor: number;
  event_attendance: number;
  tyfcb: number;
  testimonial: number;
  totalPointsSum: number;
  leaderboardPoints: {
    one_to_one: number;
    referal: number;
    attendance_regular: number;
    induction: number;
    visitor: number;
    event_attendance: number;
    tyfcb: number;
    testimonial: number;
  };
}

export interface PointsHistoryResponse {
  docs: PointsHistory[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllLeaderboards(data: { page: number; limit: number; search: string }): Promise<LeaderboardResponse> {
    try {
      this.getHeaders();
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_LEADERBOARDS + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );

      return response.data || response;
    } catch (error) {
      console.error('Get Leaderboards Error:', error);
      swalHelper.showToast('Failed to fetch leaderboard points', 'error');
      throw error;
    }
  }

  async createLeaderboard(data: { name: string; point: number; month_count?: number; amount_limit?: number; from_date?: string; to_date?: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_LEADERBOARD,
          method: 'POST',
        },
        data,
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Create Leaderboard Error:', error);
      swalHelper.showToast('Failed to create leaderboard point', 'error');
      throw error;
    }
  }

  async updateLeaderboard(id: string, data: { name: string; point: number; month_count?: number; amount_limit?: number; from_date?: string; to_date?: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPDATE_LEADERBOARD}/${id}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Update Leaderboard Error:', error);
      swalHelper.showToast('Failed to update leaderboard point', 'error');
      throw error;
    }
  }

  async getLeaderboardById(id: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_LEADERBOARD_BY_ID}/${id}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Get Leaderboard By ID Error:', error);
      swalHelper.showToast('Failed to fetch leaderboard point details', 'error');
      throw error;
    }
  }

  async deleteLeaderboard(id: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.DELETE_LEADERBOARD}/${id}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Delete Leaderboard Error:', error);
      swalHelper.showToast('Failed to delete leaderboard point', 'error');
      throw error;
    }
  }

  async getAllPointsHistory(params: { page: number; limit: number; search?: string; chapter_name?: string }): Promise<PointsHistoryResponse> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_POINTS_HISTORY,
          method: 'POST',
        },
        params,
        this.headers
      );
      return response.data || response;
    } catch (error) {
      console.error('Get Points History Error:', error);
      swalHelper.showToast('Failed to fetch points history', 'error');
      throw error;
    }
  }
}