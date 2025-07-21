interface ApiOptions extends RequestInit {
  skipAuth?: boolean
  skipRetry?: boolean
}

class ApiClient {
  private static instance: ApiClient
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  async request(url: string, options: ApiOptions = {}): Promise<Response> {
    const { skipAuth = false, skipRetry = false, ...fetchOptions } = options;
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (fetchOptions.headers) {
      if (typeof Headers !== "undefined" && fetchOptions.headers instanceof Headers) {
        (fetchOptions.headers as Headers).forEach((value, key) => {
          headers[key] = value;
        });
      } else if (typeof fetchOptions.headers === "object" && !Array.isArray(fetchOptions.headers)) {
        headers = { ...headers, ...fetchOptions.headers };
      }
    }
    // fetchOptions에서 headers 제거
    const { headers: _headers, ...fetchOpts } = fetchOptions;
    const response = await fetch(url, {
      ...fetchOpts,
      headers,
      credentials: "include",
    });
    if (response.status === 401 && !skipRetry && !skipAuth) {
      const refreshSuccess = await this.refreshToken();
      if (refreshSuccess) {
        return this.request(url, { ...options, skipRetry: true });
      } else {
        window.location.href = "/auth/login";
      }
    }
    return response;
  }

  private async refreshToken(): Promise<boolean> {
    // 이미 재발급 중이면 기존 Promise 반환
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // 편의 메서드들
  async get(url: string, options?: ApiOptions) {
    return this.request(url, { ...options, method: "GET" })
  }

  async post(url: string, data?: any, options?: ApiOptions) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(url: string, data?: any, options?: ApiOptions) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(url: string, options?: ApiOptions) {
    return this.request(url, { ...options, method: "DELETE" })
  }
}

export const apiClient = ApiClient.getInstance()
