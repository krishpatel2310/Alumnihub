import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const isNewUser = searchParams.get('isNewUser') === 'true';

        if (!token || !userStr) {
          throw new Error('Missing authentication data');
        }

        // Parse user data
        const userData = JSON.parse(decodeURIComponent(userStr));

        // If it's a new user, redirect to role selection
        if (isNewUser) {
          navigate(`/auth/role-selection?token=${token}&user=${encodeURIComponent(userStr)}`, { 
            replace: true 
          });
          return;
        }

        // Store token
        localStorage.setItem('accessToken', token);

        // Update auth context
        login({
          user: userData,
          accessToken: token,
          userType: userData.role === 'admin' ? 'admin' : 'user'
        });

        // Success toast
        toast({
          title: 'Login successful!',
          description: 'Welcome back to AlumniHub!',
          variant: 'success',
        });

        // Navigate based on role
        if (userData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Google auth error:', error);
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: 'Unable to complete Google login. Please try again.',
        });
        navigate('/login', { replace: true });
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, login, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Completing Google sign-in...</p>
      </div>
    </div>
  );
};
