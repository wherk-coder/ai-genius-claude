import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(this.transformError(error))
      }
    )
  }

  setToken(token: string, rememberMe: boolean = false) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        // Use localStorage for persistent storage
        localStorage.setItem('auth_token', token)
        localStorage.setItem('remember_me', 'true')
      } else {
        // Use sessionStorage for session-only storage
        sessionStorage.setItem('auth_token', token)
        localStorage.removeItem('remember_me')
      }
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      localStorage.removeItem('remember_me')
    }
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      // Try localStorage first (for remembered sessions)
      let token = localStorage.getItem('auth_token')
      
      // If not found in localStorage, try sessionStorage
      if (!token) {
        token = sessionStorage.getItem('auth_token')
      }
      
      if (token) {
        this.token = token
      }
    }
  }

  private transformError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      statusCode: error.response?.status || 0,
      errors: {},
    }

    if (error.response?.data) {
      const data = error.response.data as any
      apiError.message = data.message || apiError.message
      apiError.errors = data.errors || {}
    }

    return apiError
  }

  // Authentication
  async login(email: string, password: string, rememberMe: boolean = false) {
    const response = await this.client.post('/auth/login', { email, password })
    const { access_token, user } = response.data
    this.setToken(access_token, rememberMe)
    return { token: access_token, user }
  }

  async register(data: RegisterData) {
    const response = await this.client.post('/auth/register', data)
    const { access_token, user } = response.data
    this.setToken(access_token)
    return { token: access_token, user }
  }

  async logout() {
    this.clearToken()
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile')
    return response.data
  }

  // Users
  async getMe() {
    const response = await this.client.get('/users/me')
    return response.data
  }

  async updateMe(data: Partial<UserUpdate>) {
    const response = await this.client.patch('/users/me', data)
    return response.data
  }

  // Bets
  async getBets(filters?: BetFilters) {
    const response = await this.client.get('/bets', { params: filters })
    return response.data
  }

  async createBet(data: CreateBetData) {
    const response = await this.client.post('/bets', data)
    return response.data
  }

  async getBet(id: string) {
    const response = await this.client.get(`/bets/${id}`)
    return response.data
  }

  async updateBet(id: string, data: Partial<CreateBetData>) {
    const response = await this.client.patch(`/bets/${id}`, data)
    return response.data
  }

  async deleteBet(id: string) {
    const response = await this.client.delete(`/bets/${id}`)
    return response.data
  }

  async getBetStats() {
    const response = await this.client.get('/bets/stats')
    return response.data
  }

  // Analytics
  async getAnalyticsOverview() {
    const response = await this.client.get('/analytics/overview')
    return response.data
  }

  async getBettingTrends(days?: number) {
    const response = await this.client.get('/analytics/trends', { params: { days } })
    return response.data
  }

  async getSportBreakdown() {
    const response = await this.client.get('/analytics/sports')
    return response.data
  }

  async getBetTypeAnalysis() {
    const response = await this.client.get('/analytics/bet-types')
    return response.data
  }

  async getBankrollHistory(days?: number) {
    const response = await this.client.get('/analytics/bankroll', { params: { days } })
    return response.data
  }

  async getInsights() {
    const response = await this.client.get('/analytics/insights')
    return response.data
  }

  // Sports
  async getTeams(sport?: string) {
    const response = await this.client.get('/sports/teams', { params: { sport } })
    return response.data
  }

  async getGames(filters?: GameFilters) {
    const response = await this.client.get('/sports/games', { params: filters })
    return response.data
  }

  async getUpcomingGames() {
    const response = await this.client.get('/sports/games/upcoming')
    return response.data
  }

  async getLiveGames() {
    const response = await this.client.get('/sports/games/live')
    return response.data
  }

  async getGameOdds(gameId: string) {
    const response = await this.client.get(`/sports/games/${gameId}/odds`)
    return response.data
  }

  // Subscriptions
  async getSubscriptionTiers() {
    const response = await this.client.get('/subscriptions/tiers')
    return response.data
  }

  async getMySubscription() {
    const response = await this.client.get('/subscriptions/me')
    return response.data
  }

  async getSubscriptionUsage() {
    const response = await this.client.get('/subscriptions/me/usage')
    return response.data
  }

  async addSportPackage(sport: string) {
    const response = await this.client.post(`/subscriptions/me/sport-packages/${sport}`)
    return response.data
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

  // Payments
  async createPaymentIntent(amount: number, metadata?: Record<string, any>) {
    const response = await this.client.post('/payments/create-payment-intent', {
      amount,
      metadata,
    })
    return response.data
  }

  async createSubscription(customerId: string, priceId: string) {
    const response = await this.client.post('/payments/create-subscription', {
      customerId,
      priceId,
    })
    return response.data
  }

  async createCustomer() {
    const response = await this.client.post('/payments/create-customer')
    return response.data
  }

  async getPrices() {
    const response = await this.client.get('/payments/prices')
    return response.data
  }

  // Receipt Scanner
  async scanReceipt(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_RECEIPT_SCANNER_URL || 'http://localhost:8001'}/scan`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }
}

// Types
export interface ApiError {
  message: string
  statusCode: number
  errors: Record<string, string[]>
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface UserUpdate {
  name: string
  email: string
}

export interface BetFilters {
  sport?: string
  status?: 'PENDING' | 'WON' | 'LOST' | 'PUSHED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface CreateBetData {
  type: 'STRAIGHT' | 'PARLAY' | 'PROP'
  sport: string
  amount: number
  odds: string
  status?: 'PENDING' | 'WON' | 'LOST' | 'PUSHED' | 'CANCELLED'
  description?: string
  gameId?: string
  legs?: Array<{
    gameId?: string
    type: 'MONEYLINE' | 'SPREAD' | 'TOTAL' | 'PROP'
    selection: string
    odds: string
    handicap?: number
    total?: number
    propDescription?: string
  }>
}

export interface GameFilters {
  sport?: string
  date?: string
  status?: 'SCHEDULED' | 'LIVE' | 'FINAL' | 'CANCELLED' | 'POSTPONED'
}

// Create and export singleton instance
const apiClient = new ApiClient()

// Load token on initialization
if (typeof window !== 'undefined') {
  apiClient.loadToken()
}

export default apiClient