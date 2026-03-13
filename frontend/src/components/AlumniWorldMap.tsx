import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/leaflet-custom.css';
import { userService } from '@/services/ApiServices';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with gradient
const createCustomIcon = (avatarUrl?: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        ${avatarUrl 
          ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />` 
          : `<div style="color: white; font-weight: bold; font-size: 16px;">A</div>`
        }
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// City coordinates mapping (you can expand this)
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // India
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  
  // USA
  'New York': { lat: 40.7128, lng: -74.0060 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  
  // Europe
  'London': { lat: 51.5074, lng: -0.1278 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Amsterdam': { lat: 52.3676, lng: 4.9041 },
  'Dublin': { lat: 53.3498, lng: -6.2603 },
  
  // Asia
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
};

interface AlumniLocation {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  currentPosition?: string;
  company?: string;
  graduationYear?: number;
}

// Component to adjust map bounds to show all markers
function FitBounds({ locations }: { locations: AlumniLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => {
          const coords = getCoordinates(loc);
          return [coords.lat, coords.lng];
        })
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }
  }, [locations, map]);

  return null;
}

// Helper function to get coordinates
function getCoordinates(location: AlumniLocation): { lat: number; lng: number } {
  // If coordinates are provided, use them
  if (location.coordinates?.latitude && location.coordinates?.longitude) {
    return {
      lat: location.coordinates.latitude,
      lng: location.coordinates.longitude,
    };
  }

  // Otherwise, try to map city to coordinates
  const city = location.city || '';
  if (cityCoordinates[city]) {
    return cityCoordinates[city];
  }

  // Default to a random position (you can improve this)
  return {
    lat: 20 + Math.random() * 40,
    lng: -20 + Math.random() * 100,
  };
}

export default function AlumniWorldMap() {
  const [locations, setLocations] = useState<AlumniLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
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

  if (loading) {
    return (
      <Card className="p-8 h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading alumni locations...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Unable to Load Map</h3>
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
      <Card className="p-8 h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Alumni Locations Found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Alumni locations will appear here once they update their profiles with location information.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Render map with error boundary
  try {
    return (
      <Card className="overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Alumni World Map</h2>
              <p className="text-sm text-muted-foreground">
                {locations.length} alumni across the globe
              </p>
            </div>
          </div>
        </div>
        
        <div className="h-[500px] relative">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
            className="h-full w-full"
            style={{ zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <FitBounds locations={locations} />
            
            {locations.map((location) => {
              const coords = getCoordinates(location);
              return (
                <Marker
                  key={location.id}
                  position={[coords.lat, coords.lng]}
                  icon={createCustomIcon(location.avatar)}
                >
                  <Popup className="custom-popup" maxWidth={300}>
                    <div className="p-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 border-2 border-purple-500">
                          <AvatarImage src={location.avatar} alt={location.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            {location.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{location.name}</h3>
                          
                          {location.currentPosition && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate">{location.currentPosition}</span>
                            </div>
                          )}
                          
                          {location.company && (
                            <div className="text-sm text-gray-500 dark:text-gray-500 truncate">
                              @ {location.company}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {location.city && (
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="h-3 w-3 mr-1" />
                                {location.city}
                                {location.country && `, ${location.country}`}
                              </Badge>
                            )}
                            
                            {location.graduationYear && (
                              <Badge variant="outline" className="text-xs">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Class of {location.graduationYear}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Click on markers to view alumni details • Map shows approximate locations
          </p>
        </div>
      </Card>
    );
  } catch (err: any) {
    console.error('Map rendering error:', err);
    setMapError(err.message);
    return (
      <Card className="p-8 h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <MapPin className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Unable to Load Map</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {mapError || 'There was an error loading the map. Please try refreshing the page.'}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Refresh Page
            </Button>
          </div>
        </div>
      </Card>
    );
  }
}
