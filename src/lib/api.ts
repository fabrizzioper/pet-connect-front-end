/**
 * API Service
 * Typed API client with no fallbacks
 */

import { env } from '@/config/env';
import type {
  ApiResponse,
  PaginationResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerifyTokenResponse,
  User,
  UpdateUserRequest,
  ChangePasswordRequest,
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

    console.log('🔵 request - URL:', `${this.baseURL}${endpoint}`);
    console.log('🔵 request - Method:', options.method || 'GET');
    console.log('🔵 request - Headers:', headers);
    console.log('🔵 request - Body:', options.body);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log('🔵 response - Status:', response.status, response.statusText);
    console.log('🔵 response - OK:', response.ok);

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        statusCode: response.status,
        message: response.statusText,
      }));
      console.error('🔵 response - Error:', error);
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔵 response - Data:', data);
    return data;
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
    return this.request<ApiResponse<User>>(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getFollowers(userId: string, page = 1, limit = 10): Promise<{ followers: User[]; pagination: PaginationResponse }> {
    return this.request<{ followers: User[]; pagination: PaginationResponse }>(
      `/users/${userId}/followers?page=${page}&limit=${limit}`
    );
  }

  async getFollowing(userId: string, page = 1, limit = 10): Promise<{ following: User[]; pagination: PaginationResponse }> {
    return this.request<{ following: User[]; pagination: PaginationResponse }>(
      `/users/${userId}/following?page=${page}&limit=${limit}`
    );
  }

  // Pet endpoints
  async createPet(data: CreatePetRequest): Promise<{ message: string; pet: Pet }> {
    return this.request<{ message: string; pet: Pet }>('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyPets(): Promise<Pet[]> {
    const response = await this.request<{ pets: Pet[] }>('/pets/my-pets');
    return response.pets || [];
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
  async createPost(data: CreatePostRequest): Promise<{ message: string; post: Post }> {
    return this.request<{ message: string; post: Post }>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeed(page = 1, limit = 10): Promise<{ posts: Post[]; pagination: PaginationResponse; currentUserId?: string | null }> {
    return this.request<{ posts: Post[]; pagination: PaginationResponse; currentUserId?: string | null }>(
      `/posts/feed?page=${page}&limit=${limit}`
    );
  }

  async getFollowingFeed(page = 1, limit = 10): Promise<{ posts: Post[]; pagination: PaginationResponse }> {
    return this.request<{ posts: Post[]; pagination: PaginationResponse }>(
      `/posts/feed/following?page=${page}&limit=${limit}`
    );
  }

  async getUserPosts(userId: string, page = 1, limit = 10): Promise<{ posts: Post[]; pagination: PaginationResponse }> {
    return this.request<{ posts: Post[]; pagination: PaginationResponse }>(
      `/posts/user/${userId}?page=${page}&limit=${limit}`
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

  async toggleLike(postId: string): Promise<{ message: string; liked: boolean; likesCount: number }> {
    console.log('🔵 API toggleLike - postId:', postId);
    console.log('🔵 URL:', `${this.baseURL}/posts/${postId}/like`);
    console.log('🔵 Token:', this.getToken() ? 'Presente' : 'Ausente');
    
    const response = await this.request<{ message: string; liked: boolean; likesCount: number }>(`/posts/${postId}/like`, {
      method: 'PUT',
    });
    
    console.log('🔵 Respuesta recibida:', response);
    return response;
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
  ): Promise<{ message: string; comment: Comment }> {
    return this.request<{ message: string; comment: Comment }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getComments(postId: string, page = 1, limit = 10): Promise<{ comments: Comment[]; pagination: PaginationResponse }> {
    const response = await this.request<{ comments: Comment[]; pagination: PaginationResponse }>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`
    );
    return response;
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

  async getReports(page = 1, limit = 10): Promise<{ reports: Report[]; pagination: PaginationResponse }> {
    return this.request<{ reports: Report[]; pagination: PaginationResponse }>(
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
    // El backend no tiene un endpoint /search general, solo /search/users y /search/posts
    // Hacemos búsquedas separadas y combinamos los resultados
    const type = query.type || 'all';
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    const results: SearchResponse = {
      users: [],
      posts: [],
      pets: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };

    if (type === 'all' || type === 'users') {
      try {
        const usersResponse = await this.searchUsers(query.query, page, limit);
        results.users = usersResponse.users || [];
      } catch (err) {
        // Ignorar errores en búsquedas individuales
      }
    }

    if (type === 'all' || type === 'posts') {
      try {
        const postsResponse = await this.searchPosts(query.query, page, limit);
        results.posts = postsResponse.posts || [];
      } catch (err) {
        // Ignorar errores en búsquedas individuales
      }
    }

    // Calcular totales
    results.pagination.total = results.users.length + results.posts.length + results.pets.length;
    results.pagination.totalPages = Math.ceil(results.pagination.total / limit);

    return results;
  }

  async searchUsers(query: string, page = 1, limit = 10): Promise<{ users: User[]; pagination: PaginationResponse }> {
    return this.request<{ users: User[]; pagination: PaginationResponse }>(
      `/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  }

  async searchPosts(query: string, page = 1, limit = 10): Promise<{ posts: Post[]; pagination: PaginationResponse }> {
    return this.request<{ posts: Post[]; pagination: PaginationResponse }>(
      `/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  }
}

export const api = new ApiService();

