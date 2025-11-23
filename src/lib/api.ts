/**
 * API Service
 * Typed API client with no fallbacks
 */

import { env } from '@/config/env';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerifyTokenResponse,
  User,
  UpdateUserRequest,
  Pet,
  CreatePetRequest,
  UpdatePetRequest,
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  AdminStatistics,
  Report,
  BlockUserRequest,
  SearchRequest,
  SearchResponse,
  ApiError,
} from '@/types/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = env.API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: response.statusText,
      }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async verifyToken(): Promise<VerifyTokenResponse> {
    return this.request<VerifyTokenResponse>('/auth/verify');
  }

  logout(): void {
    this.removeToken();
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async getUserById(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async followUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/users/${userId}/unfollow`, {
      method: 'POST',
    });
  }

  // Pet endpoints
  async createPet(data: CreatePetRequest): Promise<ApiResponse<Pet>> {
    return this.request<ApiResponse<Pet>>('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyPets(): Promise<Pet[]> {
    return this.request<Pet[]>('/pets/my-pets');
  }

  async getPetById(petId: string): Promise<Pet> {
    return this.request<Pet>(`/pets/${petId}`);
  }

  async updatePet(petId: string, data: UpdatePetRequest): Promise<Pet> {
    return this.request<Pet>(`/pets/${petId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePet(petId: string): Promise<void> {
    return this.request<void>(`/pets/${petId}`, {
      method: 'DELETE',
    });
  }

  // Post endpoints
  async createPost(data: CreatePostRequest): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeed(page = 1, limit = 10): Promise<{ posts: Post[]; pagination: PaginationResponse }> {
    return this.request<{ posts: Post[]; pagination: PaginationResponse }>(
      `/posts/feed?page=${page}&limit=${limit}`
    );
  }

  async getPostById(postId: string): Promise<Post> {
    return this.request<Post>(`/posts/${postId}`);
  }

  async updatePost(
    postId: string,
    data: UpdatePostRequest
  ): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string): Promise<void> {
    return this.request<void>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async toggleLike(postId: string): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async reportPost(postId: string, reason: string): Promise<void> {
    return this.request<void>(`/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Comment endpoints
  async createComment(
    postId: string,
    data: CreateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    return this.request<ApiResponse<Comment>>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<ApiResponse<Comment>> {
    return this.request<ApiResponse<Comment>>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    return this.request<void>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async toggleCommentLike(commentId: string): Promise<ApiResponse<Comment>> {
    return this.request<ApiResponse<Comment>>(`/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  async reportComment(commentId: string, reason: string): Promise<void> {
    return this.request<void>(`/comments/${commentId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Category endpoints
  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request<{ categories: Category[] }>('/categories');
  }

  async createCategory(
    data: CreateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(
    categoryId: string,
    data: UpdateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return this.request<void>(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminStatistics(): Promise<AdminStatistics> {
    return this.request<AdminStatistics>('/admin/statistics');
  }

  async getReports(page = 1, limit = 10): Promise<PaginatedResponse<Report>> {
    return this.request<PaginatedResponse<Report>>(
      `/admin/reports?page=${page}&limit=${limit}`
    );
  }

  async blockUser(
    userId: string,
    data: BlockUserRequest
  ): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>(`/admin/users/${userId}/block`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePostAsAdmin(postId: string, reason: string): Promise<void> {
    return this.request<void>(`/admin/posts/${postId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async deleteCommentAsAdmin(commentId: string): Promise<void> {
    return this.request<void>(`/admin/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Search endpoints
  async search(query: SearchRequest): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query.query,
      page: String(query.page || 1),
      limit: String(query.limit || 10),
    });
    if (query.type) {
      params.append('type', query.type);
    }
    return this.request<SearchResponse>(`/search?${params.toString()}`);
  }
}

export const api = new ApiService();

