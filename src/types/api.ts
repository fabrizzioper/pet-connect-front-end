/**
 * API Types
 * All types for API requests and responses
 */

// Common types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationResponse;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  message: string;
  user: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    profilePicture?: string;
  };
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: {
    _id: string;
    username: string;
    role: 'USER' | 'ADMIN';
  };
}

// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
  profilePicture?: string;
  bio?: string;
  pets: string[];
  followers: string[];
  following: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  bio?: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Pet types
export interface Pet {
  _id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'exotic' | string;
  breed?: string;
  age?: number;
  description?: string;
  photos: string[];
  profilePicture?: string;
  owner: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetRequest {
  name: string;
  type: string;
  breed?: string;
  age?: number;
  description?: string;
  profilePicture?: string;
  photos?: string[];
}

export interface UpdatePetRequest {
  name?: string;
  type?: string;
  breed?: string;
  age?: number;
  description?: string;
  profilePicture?: string;
  photos?: string[];
}

// Post types
export interface Post {
  _id: string;
  author: string | User;
  pet?: string | Pet;
  content: string;
  media: Array<{
    type: 'image' | 'video';
    url: string;
  }>;
  category: string;
  likes: string[];
  comments: string[];
  isActive: boolean;
  reports: Array<{
    user: string;
    reason: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
}

export interface CreatePostRequest {
  content: string;
  petId?: string;
  category: string;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
  }>;
}

export interface UpdatePostRequest {
  content?: string;
  category?: string;
}

// Comment types
export interface Comment {
  _id: string;
  post: string | Post;
  author: string | User;
  content: string;
  likes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  postsCount?: number;
}

export interface CreateCategoryRequest {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  displayName?: string;
  description?: string;
  icon?: string;
}

// Admin types
export interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalComments: number;
  totalPets: number;
  postsByCategory: Record<string, number>;
  mostPopularPets: Pet[];
  reportsPending: number;
}

export interface Report {
  _id: string;
  type: 'post' | 'comment';
  targetId: string;
  reporter: {
    _id: string;
    username: string;
    email: string;
  };
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface BlockUserRequest {
  blocked: boolean;
  reason: string;
}

// Search types
export interface SearchRequest {
  query: string;
  type?: 'users' | 'pets' | 'posts' | 'all';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  users: User[];
  pets: Pet[];
  posts: Post[];
  pagination: PaginationResponse;
}

// Error types
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

