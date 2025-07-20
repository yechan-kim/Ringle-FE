// 네트워크 요청 관리 서비스
class NetworkService {
  constructor() {
    this.retryCount = 3;
    this.retryDelay = 1000;
    this.rateLimitDelay = 100;
    this.lastRequestTime = 0;
  }

  // 요청 간격 제한
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  // 재시도 로직이 포함된 fetch
  async fetchWithRetry(url, options = {}, retryCount = this.retryCount) {
    await this.waitForRateLimit();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount > 0) {
        console.log(`요청 실패, ${this.retryDelay}ms 후 재시도... (${retryCount}회 남음)`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.fetchWithRetry(url, options, retryCount - 1);
      }
      
      throw error;
    }
  }

  // JSON 응답을 파싱하는 fetch
  async fetchJSON(url, options = {}) {
    const response = await this.fetchWithRetry(url, options);
    return response.json();
  }

  // POST 요청
  async post(url, data, options = {}) {
    return this.fetchJSON(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // GET 요청
  async get(url, options = {}) {
    return this.fetchJSON(url, {
      method: 'GET',
      ...options,
    });
  }

  // 네트워크 상태 확인
  async checkConnectivity() {
    try {
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch {
      return false;
    }
  }

  // API 키 유효성 검사
  async validateApiKey(apiKey, baseUrl) {
    try {
      const response = await this.post(`${baseUrl}/models`, {
        key: apiKey
      });
      return response.valid;
    } catch (error) {
      console.error('API 키 검증 실패:', error);
      return false;
    }
  }

  // 에러 메시지 생성
  getErrorMessage(error) {
    if (error.message.includes('HTTP 401')) {
      return '인증에 실패했습니다. API 키를 확인해주세요.';
    } else if (error.message.includes('HTTP 403')) {
      return '접근이 거부되었습니다. API 키 권한을 확인해주세요.';
    } else if (error.message.includes('HTTP 404')) {
      return '요청한 리소스를 찾을 수 없습니다.';
    } else if (error.message.includes('HTTP 429')) {
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message.includes('HTTP 500')) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요.';
    } else {
      return '알 수 없는 오류가 발생했습니다.';
    }
  }

  // 온라인 상태 변경 감지
  onOnlineStatusChange(callback) {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 클린업 함수 반환
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // 오프라인 상태 확인
  isOffline() {
    return !navigator.onLine;
  }

  // 요청 상태 모니터링
  createRequestMonitor() {
    const monitor = {
      isOnline: true,
      lastCheck: Date.now(),
      errorCount: 0,
      successCount: 0,
    };

    // 주기적으로 네트워크 상태 확인
    const checkNetwork = async () => {
      const wasOnline = monitor.isOnline;
      monitor.isOnline = await this.checkConnectivity();
      monitor.lastCheck = Date.now();

      if (wasOnline && !monitor.isOnline) {
        console.warn('네트워크 연결이 끊어졌습니다.');
      } else if (!wasOnline && monitor.isOnline) {
        console.log('네트워크 연결이 복구되었습니다.');
      }
    };

    // 30초마다 네트워크 상태 확인
    setInterval(checkNetwork, 30000);

    return monitor;
  }
}

export default new NetworkService(); 