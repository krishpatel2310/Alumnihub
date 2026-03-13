import { useEffect, useState } from 'react';
import { userService } from '@/services/ApiServices';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  Briefcase, 
  MapPin, 
  GraduationCap, 
  Linkedin, 
  Github, 
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeaturedAlumni {
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  currentPosition?: string;
  company?: string;
  graduationYear?: number;
  achievements?: string[];
  linkedin?: string;
  github?: string;
  location?: string;
}

export default function AlumniSpotlight() {
  const [featuredAlumni, setFeaturedAlumni] = useState<FeaturedAlumni[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedAlumni();
  }, []);

  // Auto-rotate spotlight every 5 seconds
  useEffect(() => {
    if (!autoRotate || featuredAlumni.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAlumni.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, featuredAlumni.length]);

  const fetchFeaturedAlumni = async () => {
    try {
      setLoading(true);
      const response = await userService.getFeaturedAlumni();
      if (response.success && response.data) {
        setFeaturedAlumni(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch featured alumni',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) => (prev - 1 + featuredAlumni.length) % featuredAlumni.length);
  };

  const handleNext = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) => (prev + 1) % featuredAlumni.length);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (featuredAlumni.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Alumni Spotlight</CardTitle>
              <CardDescription>Featuring outstanding alumni achievements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No featured alumni at the moment</p>
        </CardContent>
      </Card>
    );
  }

  const currentAlumni = featuredAlumni[currentIndex];

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <Sparkles className="h-3 w-3 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl">Alumni Spotlight</CardTitle>
              <CardDescription>Celebrating excellence and achievement</CardDescription>
            </div>
          </div>

          {featuredAlumni.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-1">
                {featuredAlumni.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAutoRotate(false);
                      setCurrentIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'w-6 bg-amber-600' 
                        : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to alumni ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-amber-500/20 shadow-lg">
                    <AvatarImage src={currentAlumni.avatar} alt={currentAlumni.name} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-3xl">
                      {currentAlumni.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-2 shadow-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Social Links */}
                {(currentAlumni.linkedin || currentAlumni.github) && (
                  <div className="flex gap-2 mt-4">
                    {currentAlumni.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a href={currentAlumni.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {currentAlumni.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a href={currentAlumni.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                          GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold mb-2">{currentAlumni.name}</h3>

                {/* Position & Company */}
                {currentAlumni.currentPosition && (
                  <div className="flex items-center gap-2 text-lg text-foreground mb-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                      {currentAlumni.currentPosition}
                      {currentAlumni.company && (
                        <span className="text-muted-foreground"> @ {currentAlumni.company}</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                  {currentAlumni.graduationYear && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>Class of {currentAlumni.graduationYear}</span>
                    </div>
                  )}
                  {currentAlumni.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{currentAlumni.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {currentAlumni.bio && (
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {currentAlumni.bio}
                  </p>
                )}

                {/* Achievements */}
                {currentAlumni.achievements && currentAlumni.achievements.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-600" />
                      Key Achievements
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentAlumni.achievements.map((achievement, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
