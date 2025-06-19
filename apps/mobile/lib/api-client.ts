import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class MobileApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          try {
            this.token = await SecureStore.getItemAsync('auth_token');
          } catch (error) {
            console.log('Error getting token from secure store:', error);
          }
        }

        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          await this.clearToken();
          // In a real app, you would navigate to login screen here
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: AxiosError): any {
    const apiError = {
      message: 'An error occurred',
      statusCode: 500,
      errors: {},
    };

    if (error.response) {
      apiError.statusCode = error.response.status;
      if (error.response.data && typeof error.response.data === 'object') {
        const data = error.response.data as any;
        apiError.message = data.message || error.message;
        apiError.errors = data.errors || {};
      }
    } else if (error.request) {
      apiError.message = 'Network error. Please check your connection.';
    } else {
      apiError.message = error.message;
    }

    return apiError;
  }

  async setToken(token: string, rememberMe: boolean = false) {
    this.token = token;
    try {
      await SecureStore.setItemAsync('auth_token', token);
      if (rememberMe) {
        await SecureStore.setItemAsync('remember_me', 'true');
      }
    } catch (error) {
      console.log('Error storing token:', error);
    }
  }

  async clearToken() {
    this.token = null;
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('remember_me');
    } catch (error) {
      console.log('Error clearing token:', error);
    }
  }

  async loadToken() {
    try {
      this.token = await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.log('Error loading token:', error);
    }
  }

  // Authentication
  async login(email: string, password: string, rememberMe: boolean = false) {
    const response = await this.client.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    await this.setToken(access_token, rememberMe);
    return { token: access_token, user };
  }

  async register(data: RegisterData) {
    const response = await this.client.post('/auth/register', data);
    const { access_token, user } = response.data;
    await this.setToken(access_token);
    return { token: access_token, user };
  }

  async logout() {
    await this.clearToken();
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Bets
  async getBets(filters?: BetFilters) {
    const response = await this.client.get('/bets', { params: filters });
    return response.data;
  }

  async createBet(data: CreateBetData) {
    const response = await this.client.post('/bets', data);
    return response.data;
  }

  async getBet(id: string) {
    const response = await this.client.get(`/bets/${id}`);
    return response.data;
  }

  async updateBet(id: string, data: Partial<CreateBetData>) {
    const response = await this.client.patch(`/bets/${id}`, data);
    return response.data;
  }

  async deleteBet(id: string) {
    const response = await this.client.delete(`/bets/${id}`);
    return response.data;
  }

  async getBetStats() {
    const response = await this.client.get('/bets/stats');
    return response.data;
  }

  // Analytics
  async getAnalyticsOverview() {
    const response = await this.client.get('/analytics/overview');
    return response.data;
  }

  async getBettingTrends(days?: number) {
    const response = await this.client.get('/analytics/trends', { params: { days } });
    return response.data;
  }

  async getSportBreakdown() {
    const response = await this.client.get('/analytics/sports');
    return response.data;
  }

  // Receipt Scanner
  async scanReceipt(imageUri: string) {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as any);
    
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_RECEIPT_SCANNER_URL || 'http://localhost:8001'}/scan`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async uploadReceipt(formData: FormData) {
    const response = await this.client.post('/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    });
    return response.data;
  }

  // AI Services
  async getBettingInsights() {
    const response = await this.client.get('/ai/insights');
    return response.data;
  }

  async parseNaturalLanguageBet(input: string) {
    const response = await this.client.post('/ai/parse-bet', { input });
    return response.data;
  }

  async getBettingPatterns() {
    const response = await this.client.get('/ai/patterns');
    return response.data;
  }

  async getBettingOpportunities() {
    const response = await this.client.get('/ai/opportunities');
    return response.data;
  }

  async getPerformanceAnalysis() {
    const response = await this.client.get('/ai/performance-analysis');
    return response.data;
  }

  async createCustomInsight(insight: any) {
    const response = await this.client.post('/ai/insights', insight);
    return response.data;
  }

  async checkAiHealth() {
    const response = await this.client.get('/ai/health');
    return response.data;
  }
}

// Types
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface BetFilters {
  sport?: string;
  status?: 'PENDING' | 'WON' | 'LOST' | 'PUSHED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface CreateBetData {
  type: 'STRAIGHT' | 'PARLAY' | 'PROP';
  sport: string;
  amount: number;
  odds: string;
  status?: 'PENDING' | 'WON' | 'LOST' | 'PUSHED' | 'CANCELLED';
  description?: string;
  gameId?: string;
  legs?: Array<{
    gameId?: string;
    type: 'MONEYLINE' | 'SPREAD' | 'TOTAL' | 'PROP';
    selection: string;
    odds: string;
    handicap?: number;
    total?: number;
    propDescription?: string;
  }>;
}

// Create and export singleton instance
const mobileApiClient = new MobileApiClient();

export default mobileApiClient;