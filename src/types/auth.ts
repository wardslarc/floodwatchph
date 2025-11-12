export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  role?: string;
  is2FAEnabled?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, code?: string) => Promise<{ success: boolean; user?: User; error?: string; requires2FA?: boolean }>;
  signup: (email: string, password: string, name: string, code?: string) => Promise<{ success: boolean; user?: User; error?: string; requires2FA?: boolean }>;
  logout: () => void;
  enable2FA: () => Promise<{ success: boolean; error?: string }>;
  disable2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; error?: string }>;
  resend2FACode: () => Promise<{ success: boolean; error?: string }>;
}

export interface LoginData {
  email: string;
  password: string;
  code?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  code?: string;
}