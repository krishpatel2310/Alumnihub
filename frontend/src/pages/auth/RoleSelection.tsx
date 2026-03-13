import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

export const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<'alumni' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Please select a role',
        description: 'Choose whether you are an alumni or student to continue.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');

      if (!token || !userStr) {
        throw new Error('Missing authentication data');
      }

      // Update user role
      const response = await api.patch('/users/update-role', { role: selectedRole });

      if (response.success) {
        // Parse user data and update with new role
        const userData = JSON.parse(decodeURIComponent(userStr));
        userData.role = selectedRole;

        // Store token
        localStorage.setItem('accessToken', token);

        // Update auth context
        login({
          user: userData,
          accessToken: token,
          userType: 'user'
        });

        toast({
          title: 'Welcome to AlumniHub!',
          description: `You've been registered as ${selectedRole}.`,
          variant: 'success',
        });

        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Role selection error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to set role',
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gradient">
              Select Your Role
            </CardTitle>
            <CardDescription className="text-base">
              Choose your role to personalize your AlumniHub experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Alumni Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('alumni')}
                className="cursor-pointer"
              >
                <Card
                  className={`p-6 transition-all duration-200 ${
                    selectedRole === 'alumni'
                      ? 'border-purple-500 border-2 bg-purple-50 dark:bg-purple-950'
                      : 'border-border hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className={`p-4 rounded-full ${
                        selectedRole === 'alumni'
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                      }`}
                    >
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Alumni</h3>
                      <p className="text-sm text-muted-foreground">
                        I've graduated and want to connect with fellow alumni, mentor students, and
                        give back to the community.
                      </p>
                    </div>
                    {selectedRole === 'alumni' && (
                      <div className="w-full pt-2">
                        <div className="h-1 bg-purple-500 rounded-full" />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Student Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('student')}
                className="cursor-pointer"
              >
                <Card
                  className={`p-6 transition-all duration-200 ${
                    selectedRole === 'student'
                      ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-950'
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className={`p-4 rounded-full ${
                        selectedRole === 'student'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                    >
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Student</h3>
                      <p className="text-sm text-muted-foreground">
                        I'm currently studying and want to network, find mentors, and explore career
                        opportunities.
                      </p>
                    </div>
                    {selectedRole === 'student' && (
                      <div className="w-full pt-2">
                        <div className="h-1 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            <Button
              onClick={handleRoleSelection}
              disabled={!selectedRole || isLoading}
              className="w-full gradient-primary text-primary-foreground h-12 text-lg"
            >
              {isLoading ? 'Setting up your account...' : 'Continue'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              You can update your role later in settings
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
