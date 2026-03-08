// Auth service interface

export type UserRole = 'runner' | 'crew' | 'volunteer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: string;
  isAnonymous: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
}

export interface AuthResult {
  user: UserProfile;
  session: AuthSession;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(payload: RegisterPayload): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  updateProfile(userId: string, payload: UpdateProfilePayload): Promise<UserProfile>;
  getSession(): Promise<AuthSession | null>;
}
