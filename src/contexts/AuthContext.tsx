import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(''); // Track email for 2FA

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        // Ensure createdAt is a Date object if it exists
        if (userData.createdAt && typeof userData.createdAt === 'string') {
          userData.createdAt = new Date(userData.createdAt);
        }
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, code?: string) => {
    try {
      setLoading(true);
      console.log('🔧 Login started with:', { email });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, code }),
      });

      console.log('🔧 Login response status:', response.status);

      const data = await response.json();
      console.log('🔧 Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful response - check for 2FA requirement
      if (data.success && data.data?.requires2FA) {
        console.log('🔧 Login - 2FA required');
        setUserEmail(email); // Store email for 2FA verification
        return { success: true, requires2FA: true };
      }

      // Handle successful login without 2FA
      if (data.success && data.data?.user) {
        console.log('🔧 Login successful');
        const userData: User = {
          id: data.data.user.id || data.data.user._id,
          email: data.data.user.email,
          name: data.data.user.name,
          createdAt: new Date(data.data.user.createdAt),
          role: data.data.user.role,
          is2FAEnabled: data.data.user.is2FAEnabled,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.data.token);
        setTempToken(null);
        return { success: true, user: userData };
      }

      // If successful but no user data, assume 2FA is required
      if (data.success) {
        console.log('🔧 Login successful, assuming 2FA required');
        setUserEmail(email);
        return { success: true, requires2FA: true };
      }

      throw new Error(data.message || 'Login failed with unknown response');
      
    } catch (error) {
      console.error('🔧 Login error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please make sure the backend is running on localhost:5000' 
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, code?: string) => {
    try {
      setLoading(true);
      console.log('🔧 Signup started with:', { email, name });
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, code }),
      });

      console.log('🔧 Signup response status:', response.status);

      const data = await response.json();
      console.log('🔧 Signup response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful response - check for 2FA requirement
      if (data.success && data.data?.requires2FA) {
        console.log('🔧 Signup - 2FA required');
        setUserEmail(email); // Store email for 2FA verification
        return { success: true, requires2FA: true };
      }

      // Handle successful signup without 2FA (shouldn't happen with your backend)
      if (data.success && data.data?.user) {
        console.log('🔧 Signup successful without 2FA');
        const userData: User = {
          id: data.data.user.id || data.data.user._id,
          email: data.data.user.email,
          name: data.data.user.name,
          createdAt: new Date(data.data.user.createdAt),
          role: data.data.user.role,
          is2FAEnabled: data.data.user.is2FAEnabled,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.data.token);
        setTempToken(null);
        return { success: true, user: userData };
      }

      // If successful but no user data, assume 2FA is required
      if (data.success) {
        console.log('🔧 Signup successful, assuming 2FA required');
        setUserEmail(email);
        return { success: true, requires2FA: true };
      }

      throw new Error(data.message || 'Signup failed with unknown response');
      
    } catch (error) {
      console.error('🔧 Signup error:', error);
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please make sure the backend is running on localhost:5000' 
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to enable 2FA');
      }

      // Update user state
      if (user) {
        const updatedUser: User = { ...user, is2FAEnabled: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Enable 2FA error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable 2FA';
      return { success: false, error: errorMessage };
    }
  };

  const disable2FA = async (code: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to disable 2FA');
      }

      // Update user state
      if (user) {
        const updatedUser: User = { ...user, is2FAEnabled: false };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Disable 2FA error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable 2FA';
      return { success: false, error: errorMessage };
    }
  };

  const verify2FA = async (code: string) => {
    try {
      console.log('🔧 Verifying 2FA code:', code);
      console.log('🔧 Using email for verification:', userEmail);
      
      const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail, // Use the stored email
          code 
        }),
      });

      console.log('🔧 2FA Verification response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '2FA verification failed' }));
        throw new Error(errorData.message || '2FA verification failed');
      }

      const data = await response.json();
      console.log('🔧 2FA Verification success data:', data);

      if (data.success && data.data?.user) {
        const userData: User = {
          id: data.data.user.id || data.data.user._id,
          email: data.data.user.email,
          name: data.data.user.name,
          createdAt: new Date(data.data.user.createdAt),
          role: data.data.user.role,
          is2FAEnabled: data.data.user.is2FAEnabled,
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.data.token);
        setTempToken(null);
        setUserEmail(''); // Clear the stored email
        
        return { success: true, user: userData };
      }

      throw new Error(data.message || '2FA verification failed');
      
    } catch (error) {
      console.error('🔧 2FA verification error:', error);
      const errorMessage = error instanceof Error ? error.message : '2FA verification failed';
      return { success: false, error: errorMessage };
    }
  };

  const resend2FACode = async () => {
    try {
      console.log('🔧 Resending 2FA code to:', userEmail);
      
      const response = await fetch(`${API_BASE_URL}/auth/resend-2fa-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }), // Use the stored email
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      return { success: true };
    } catch (error) {
      console.error('Resend code error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend code';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setTempToken(null);
    setUserEmail(''); // Clear stored email
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    enable2FA,
    disable2FA,
    verify2FA,
    resend2FACode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}