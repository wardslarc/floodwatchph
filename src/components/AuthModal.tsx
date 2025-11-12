import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Shield, RotateCcw, ArrowLeft, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

type AuthStep = 'credentials' | '2fa' | 'success';

export default function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const { login, signup, verify2FA, resend2FACode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStep, setAuthStep] = useState<AuthStep>('credentials');
  const [currentTab, setCurrentTab] = useState<'login' | 'signup'>(defaultTab);
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // 2FA state
  const [twoFACode, setTwoFACode] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);

  // Countdown timer for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setTwoFACode('');
    setError('');
    setAuthStep('credentials');
    setUserEmail('');
    setIsLoading(false);
    setIs2FALoading(false);
    setCountdown(0);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForms();
    }
    onOpenChange(newOpen);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!loginEmail || !loginPassword) {
        throw new Error('Please fill in all fields');
      }

      const result = await login(loginEmail, loginPassword);
      
      if (result.requires2FA) {
        setUserEmail(loginEmail);
        setAuthStep('2fa');
        setCountdown(60); // 1 minute countdown for resend
      } else if (result.success) {
        setAuthStep('success');
        setTimeout(() => {
          handleOpenChange(false);
        }, 1500);
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
        throw new Error('Please fill in all fields');
      }
      if (signupPassword !== signupConfirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (signupPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const result = await signup(signupEmail, signupPassword, signupName);
      
      if (result.requires2FA) {
        setUserEmail(signupEmail);
        setAuthStep('2fa');
        setCountdown(60);
      } else if (result.success) {
        setAuthStep('success');
        setTimeout(() => {
          handleOpenChange(false);
        }, 1500);
      } else {
        throw new Error(result.error || 'Signup failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIs2FALoading(true);

    try {
      if (!twoFACode || twoFACode.length !== 6) {
        throw new Error('Please enter a valid 6-digit code');
      }

      const result = await verify2FA(twoFACode);
      
      if (result.success) {
        setAuthStep('success');
        setTimeout(() => {
          handleOpenChange(false);
        }, 1500);
      } else {
        throw new Error(result.error || '2FA verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA verification failed');
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      const result = await resend2FACode();
      if (!result.success) {
        throw new Error(result.error || 'Failed to resend code');
      }
      setCountdown(60); // Reset countdown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToCredentials = () => {
    setAuthStep('credentials');
    setTwoFACode('');
    setError('');
  };

  // Auto-advance to next input (you can implement this with multiple inputs if needed)
  const handle2FACodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setTwoFACode(numericValue);
    
    // Auto-submit when 6 digits are entered
    if (numericValue.length === 6) {
      handle2FAVerification(new Event('submit') as any);
    }
  };

  const renderCredentialsForm = () => (
    <Tabs 
      value={currentTab} 
      onValueChange={(value) => setCurrentTab(value as 'login' | 'signup')}
      className="mt-4"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignup} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-name"
                type="text"
                placeholder="Juan Dela Cruz"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="your@email.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-confirm-password"
                type="password"
                placeholder="••••••••"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );

  const render2FAForm = () => (
    <div className="space-y-6 mt-4">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <DialogTitle className="text-xl">Two-Factor Authentication</DialogTitle>
        <DialogDescription className="mt-2">
          We've sent a 6-digit verification code to your email
          <br />
          <strong>{userEmail}</strong>
        </DialogDescription>
      </div>

      <form onSubmit={handle2FAVerification} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="2fa-code">Verification Code</Label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="2fa-code"
              type="text"
              placeholder="000000"
              value={twoFACode}
              onChange={(e) => handle2FACodeChange(e.target.value)}
              className="pl-10 text-center text-lg font-mono tracking-widest"
              maxLength={6}
              disabled={is2FALoading}
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToCredentials}
            className="flex-1"
            disabled={is2FALoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={is2FALoading || twoFACode.length !== 6}
          >
            {is2FALoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResendCode}
            disabled={isResending || countdown > 0}
            className="text-sm"
          >
            {isResending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1" />
            )}
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="text-center space-y-4 py-4">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
      <DialogTitle className="text-2xl">Success!</DialogTitle>
      <DialogDescription>
        {currentTab === 'login' 
          ? 'You have been successfully logged in.' 
          : 'Your account has been created successfully.'
        }
      </DialogDescription>
      <div className="pt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {authStep === '2fa' ? 'Secure Your Account' : 'Welcome to FloodWatch.ph'}
          </DialogTitle>
          <DialogDescription>
            {authStep === '2fa' 
              ? 'Enter your verification code to continue' 
              : 'Sign in to report floods and help your community'
            }
          </DialogDescription>
        </DialogHeader>

        {authStep === 'credentials' && renderCredentialsForm()}
        {authStep === '2fa' && render2FAForm()}
        {authStep === 'success' && renderSuccessScreen()}
      </DialogContent>
    </Dialog>
  );
}