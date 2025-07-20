import { config } from '../config/env.js';

class BackendService {
  constructor() {
    this.baseURL = config.BACKEND_URL;
    this.userId = config.USER_ID;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 요청 실패:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API 응답:', endpoint, data);
    return data;
  }

  // 멤버십 관련 API
  async getMembership(membershipId) {
    const response = await this.request(`/api/memberships/${membershipId}`);
    return response;
  }

  async getAllMemberships() {
    const response = await this.request('/api/memberships');
    console.log('getAllMemberships 응답:', response);
    return response;
  }

  async getMembershipsByType(type) {
    const response = await this.request(`/api/memberships/type/${type}`);
    return response;
  }

  // 결제 관련 API
  async processPayment(paymentData) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        userId: this.userId,
        ...paymentData
      })
    });
  }

  async getPayment(paymentId) {
    return this.request(`/api/payments/${paymentId}`);
  }

  async getUserPayments() {
    return this.request(`/api/payments/users/${this.userId}`);
  }

  // 사용자 멤버십 관련 API
  async getUserMemberships() {
    return this.request(`/api/user-memberships/users/${this.userId}`);
  }

  async getActiveUserMemberships() {
    return this.request(`/api/user-memberships/users/${this.userId}/active`);
  }

  async useFeature(featureType) {
    return this.request('/api/user-memberships/use-feature', {
      method: 'POST',
      body: JSON.stringify({
        userId: this.userId,
        featureType: featureType
      })
    });
  }
}

const backendService = new BackendService();
export { backendService };
export default backendService; 