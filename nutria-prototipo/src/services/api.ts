/**
 * API Service Configuration
 * Centralizes all backend API calls for the Nutria app
 */

// ========== CONFIGURATION ==========
// Change this to your backend server address
// For local development: http://10.0.2.2:5000 (Android) or http://localhost:5000 (iOS)
// For production: your actual backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

// Store the JWT token in memory (or use AsyncStorage for persistence)
let authToken: string | null = null;

// ========== TYPES ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    profile: {
      id: number;
      name: string;
      bio: string;
      avatarUrl?: string;
      followersCount: number;
      followingCount: number;
      postsCount: number;
      streak: number;
    };
  };
}

export interface UserDto {
  id: number;
  username: string;
  profile: {
    id: number;
    name: string;
    bio: string;
    avatarUrl?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    streak: number;
  };
}

export interface ProfileDto {
  id: number;
  username: string;
  name: string;
  bio: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  streak: number;
}

export interface PostDto {
  id: number;
  caption: string;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author?: {
    id: number;
    username: string;
    profile?: {
      name: string;
      avatarUrl?: string;
      streak?: number;
    };
  };
  isLikedByCurrentUser?: boolean;
}

export interface FeedResponse {
  posts: PostDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreatePostRequest {
  caption: string;
  imageUrl: string;
}

export interface FollowResponse {
  isFollowing: boolean;
  followersCount: number;
}

export interface CommentDto {
  id: number;
  text: string;
  createdAt: string;
  author?: {
    id: number;
    username: string;
    profile?: {
      id: number;
      name: string;
      avatarUrl?: string;
    };
  };
}

// ========== HELPER FUNCTIONS ==========

/**
 * Make API requests with automatic token injection
 */
async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET',
  body?: any
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ========== AUTHENTICATION ==========

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/register', 'POST', data);
  authToken = response.token;
  return response;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await request<AuthResponse>('/auth/login', 'POST', data);
  authToken = response.token;
  return response;
}

/**
 * Verify token is still valid
 */
export async function verifyToken(): Promise<UserDto> {
  return request<UserDto>('/auth/verify', 'GET');
}

/**
 * Set the auth token (useful when retrieving from AsyncStorage)
 */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
  return authToken;
}

// ========== POSTS ==========

/**
 * Get the user's feed (paginated)
 */
export async function getFeed(page = 1, pageSize = 10): Promise<FeedResponse> {
  return request<FeedResponse>(`/posts/feed?page=${page}&pageSize=${pageSize}`, 'GET');
}

/**
 * Get a specific post by ID
 */
export async function getPost(postId: number): Promise<PostDto> {
  return request<PostDto>(`/posts/${postId}`, 'GET');
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostRequest): Promise<PostDto> {
  return request<PostDto>('/posts', 'POST', data);
}

/**
 * Delete a post
 */
export async function deletePost(postId: number): Promise<void> {
  return request<void>(`/posts/${postId}`, 'DELETE');
}

// ========== INTERACTIONS (Likes & Comments) ==========

/**
 * Like a post
 */
export async function likePost(postId: number): Promise<{ message: string; likesCount: number }> {
  return request<{ message: string; likesCount: number }>(`/interactions/likes/${postId}`, 'POST');
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: number): Promise<{ message: string; likesCount: number }> {
  return request<{ message: string; likesCount: number }>(`/interactions/likes/${postId}`, 'DELETE');
}

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: number,
  text: string
): Promise<{ id: number; message: string; commentsCount: number }> {
  return request<{ id: number; message: string; commentsCount: number }>(
    `/interactions/comments/${postId}`,
    'POST',
    { text }
  );
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: number): Promise<void> {
  return request<void>(`/interactions/comments/${commentId}`, 'DELETE');
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: number, page = 1, pageSize = 20): Promise<CommentDto[]> {
  return request<CommentDto[]>(`/interactions/comments/post/${postId}?page=${page}&pageSize=${pageSize}`, 'GET');
}

/**
 * Get posts from a specific user
 */
export async function getUserPosts(userId: number, page = 1, pageSize = 20): Promise<FeedResponse> {
  return request<FeedResponse>(`/posts/user/${userId}?page=${page}&pageSize=${pageSize}`, 'GET');
}

// ========== FOLLOWS ==========

/**
 * Follow a user
 */
export async function followUser(userId: number): Promise<FollowResponse> {
  return request<FollowResponse>(`/follow/${userId}`, 'POST');
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userId: number): Promise<FollowResponse> {
  return request<FollowResponse>(`/follow/${userId}`, 'DELETE');
}

/**
 * Check if current user follows a target user
 */
export async function isFollowingUser(userId: number): Promise<FollowResponse> {
  return request<FollowResponse>(`/follow/${userId}/following`, 'GET');
}

// ========== PROFILE ==========

/**
 * Get user's profile
 */
export async function getProfile(): Promise<ProfileDto> {
  return request<ProfileDto>('/profile/me', 'GET');
}

/**
 * Get a user's profile by username
 */
export async function getProfileByUsername(username: string): Promise<ProfileDto> {
  return request<ProfileDto>(`/profile/username/${encodeURIComponent(username)}`, 'GET');
}

/**
 * Update user's profile
 */
export async function updateProfile(data: {
  name?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<ProfileDto> {
  return request<ProfileDto>('/profile/me', 'PUT', data);
}

export default {
  register,
  login,
  verifyToken,
  setAuthToken,
  getAuthToken,
  getFeed,
  getPost,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  followUser,
  unfollowUser,
  getProfile,
  getProfileByUsername,
  updateProfile,
  isFollowingUser,
  getPostComments,
  getUserPosts,
};
