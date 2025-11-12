export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}