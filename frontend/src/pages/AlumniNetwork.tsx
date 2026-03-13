import { useState } from 'react';
import { MapPin, Star, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlumniWorldMapSimple from '@/components/AlumniWorldMapSimple';
import AlumniSpotlight from '@/components/AlumniSpotlight';

export default function AlumniNetwork() {
  const [activeTab, setActiveTab] = useState('spotlight');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Alumni Network
          </h1>
          <p className="text-lg text-purple-100 max-w-2xl">
            Discover where our alumni are making an impact around the world. Connect with outstanding graduates and explore their achievements.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="spotlight" className="gap-2">
            <Star className="h-4 w-4" />
            Alumni Spotlight
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <MapPin className="h-4 w-4" />
            World Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spotlight" className="mt-6 space-y-6">
          <AlumniSpotlight />
        </TabsContent>

        <TabsContent value="map" className="mt-6 space-y-6">
          <AlumniWorldMapSimple />
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Global Presence</h3>
              <p className="text-sm text-muted-foreground">
                Alumni spanning across 5+ continents making an impact worldwide
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-600 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Featured Alumni</h3>
              <p className="text-sm text-muted-foreground">
                Celebrating outstanding achievements and contributions to their fields
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Strong Network</h3>
              <p className="text-sm text-muted-foreground">
                Connect with professionals at top companies like Google, Microsoft, Amazon
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
