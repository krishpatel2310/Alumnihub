import { useEffect, useState } from 'react';
import { userService } from '@/services/ApiServices';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Briefcase, GraduationCap, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AlumniLocation {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  country?: string;
  currentPosition?: string;
  company?: string;
  graduationYear?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function AlumniWorldMapSimple() {
  const [locations, setLocations] = useState<AlumniLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlumniLocations();
  }, []);

  const fetchAlumniLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAlumniLocations();
      if (response.success) {
        setLocations(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching alumni locations:', error);
      setError(error.message || 'Failed to fetch alumni locations');
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch alumni locations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Group locations by country
  const locationsByCountry = locations.reduce((acc, location) => {
    const country = location.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(location);
    return acc;
  }, {} as Record<string, AlumniLocation[]>);

  const countryColors: Record<string, string> = {
    'USA': 'from-blue-500 to-blue-600',
    'India': 'from-orange-500 to-orange-600',
    'UK': 'from-purple-500 to-purple-600',
    'UAE': 'from-teal-500 to-teal-600',
    'Singapore': 'from-red-500 to-red-600',
    'Ireland': 'from-green-500 to-green-600',
    'Japan': 'from-pink-500 to-pink-600',
    'France': 'from-indigo-500 to-indigo-600',
    'Germany': 'from-yellow-500 to-yellow-600',
    'default': 'from-gray-500 to-gray-600',
  };

  if (loading) {
    return (
      <Card className="p-8 h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading alumni locations...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Unable to Load Locations</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={fetchAlumniLocations} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card className="p-8 h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Alumni Locations Found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Alumni locations will appear here once they update their profiles.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Global Alumni Network</h2>
            <p className="text-muted-foreground">
              Our alumni are making an impact in <span className="font-semibold text-purple-600 dark:text-purple-400">{Object.keys(locationsByCountry).length} countries</span> around the world
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {locations.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Alumni</div>
          </div>
        </div>
      </Card>

      {/* Locations by Country */}
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(locationsByCountry)
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([country, alumni]) => {
            const colorClass = countryColors[country] || countryColors['default'];
            return (
              <Card key={country} className="overflow-hidden">
                <div className={`p-4 bg-gradient-to-r ${colorClass} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6" />
                      <div>
                        <h3 className="text-xl font-bold">{country}</h3>
                        <p className="text-sm text-white/90">
                          {alumni.length} {alumni.length === 1 ? 'Alumni' : 'Alumni'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {alumni.map(a => a.city).filter((v, i, a) => a.indexOf(v) === i).length} {alumni.map(a => a.city).filter((v, i, a) => a.indexOf(v) === i).length === 1 ? 'City' : 'Cities'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {alumni.map((alumnus) => (
                    <div
                      key={alumnus.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <Avatar className="h-14 w-14 border-2 border-purple-500/20">
                        <AvatarImage src={alumnus.avatar} alt={alumnus.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg">
                          {alumnus.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg truncate">{alumnus.name}</h4>
                        
                        {alumnus.currentPosition && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Briefcase className="h-4 w-4" />
                            <span className="truncate">
                              {alumnus.currentPosition}
                              {alumnus.company && ` @ ${alumnus.company}`}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {alumnus.city && (
                            <Badge variant="secondary" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {alumnus.city}
                            </Badge>
                          )}
                          
                          {alumnus.graduationYear && (
                            <Badge variant="outline" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              Class of {alumnus.graduationYear}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
