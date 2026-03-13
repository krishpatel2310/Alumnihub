import { Calendar, Users, Briefcase, TrendingUp, Heart, MessageCircle, Loader2, Building2, DollarSign } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminService, eventService, userService, jobService, donationService, connectionService, communicationService } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

// Temporarily disabled to debug
// const AlumniWorldMap = lazy(() => import("@/components/AlumniWorldMap"));
// const AlumniSpotlight = lazy(() => import("@/components/AlumniSpotlight"));

interface DashboardStats {
  totalAlumni: number;
  totalEvents: number;
  activeEvents: number;
  totalDonations: string;
  totalJobs: number;
  totalConnections: number;
}

interface DonationStats {
  totalRaised: number;
  activeDonors: number;
  avgDonation: number;
  campaignGoalPercentage: number;
  totalGoal: number;
  totalCampaigns: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  isactive: boolean;
  participants: string[];
}

interface Alumni {
  _id: string;
  name: string;
  email: string;
  role?: string;
  graduationYear?: string;
  course?: string;
  isVerified?: boolean;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  salary: number;
  location?: string;
}

interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
}
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlumni: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalDonations: "₹0",
    totalJobs: 0,
    totalConnections: 0
  });
  const { toast } = useToast();
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [featuredAlumni, setFeaturedAlumni] = useState<Alumni[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      // Check cache first for instant loading
      const cachedData = cache.get<{
        stats: typeof stats;
        recentEvents: typeof recentEvents;
        featuredAlumni: typeof featuredAlumni;
        recentJobs: typeof recentJobs;
        recentPosts: typeof recentPosts;
        donationStats: typeof donationStats;
      }>(CACHE_KEYS.DASHBOARD_DATA);

      if (cachedData && !forceRefresh) {
        // Use cached data immediately
        setStats(cachedData.stats);
        setRecentEvents(cachedData.recentEvents);
        setFeaturedAlumni(cachedData.featuredAlumni);
        setRecentJobs(cachedData.recentJobs);
        setRecentPosts(cachedData.recentPosts);
        setDonationStats(cachedData.donationStats);
        setLoading(false);

        // Refresh in background if cache is older than 2 minutes
        if (cache.getTTL(CACHE_KEYS.DASHBOARD_DATA) < CACHE_TTL.MEDIUM - 120) {
          fetchDashboardData(true);
        }
        return;
      }

      setLoading(true);

      // Fetch all data in parallel using Promise.allSettled to prevent one failure from blocking others
      const [
        alumniResult,
        eventsResult,
        jobsResult,
        donationsResult,
        connectionsResult,
        postsResult
      ] = await Promise.allSettled([
        userService.getAllUsers(),
        eventService.getEvents(),
        jobService.getAllJobs(),
        donationService.getDonationStats(),
        connectionService.getConnections({ status: 'accepted' }),
        communicationService.getAllPosts()
      ]);

      // Process Alumni Data
      let verifiedAlumni: Alumni[] = [];
      let featured: Alumni[] = [];
      if (alumniResult.status === 'fulfilled') {
        const alumniResponse = alumniResult.value;
        const allUsers = Array.isArray(alumniResponse?.data) ? alumniResponse.data : [];
        verifiedAlumni = allUsers.filter((user: Alumni) => user.role?.toLowerCase() === "alumni");
        featured = verifiedAlumni.sort(() => 0.5 - Math.random()).slice(0, 3);
      }

      // Process Events Data
      let allEvents: Event[] = [];
      let activeEvents: Event[] = [];
      let upcomingEvents: Event[] = [];
      if (eventsResult.status === 'fulfilled') {
        const eventsResponse = eventsResult.value;
        allEvents = eventsResponse?.success && Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
        activeEvents = allEvents.filter((event: Event) => event.isactive);
        upcomingEvents = activeEvents
          .filter((event: Event) => new Date(event.date) >= new Date())
          .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
      }

      // Process Jobs Data
      let jobs: Job[] = [];
      let recentJobsList: Job[] = [];
      if (jobsResult.status === 'fulfilled') {
        const jobsResponse = jobsResult.value;
        jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
        const verifiedJobs = jobs.filter((job: any) => job.isVerified);
        recentJobsList = verifiedJobs.slice(0, 5);
        setRecentJobs(recentJobsList);
      } else {
        setRecentJobs([]);
      }

      // Process Donation Data
      let donationAmount = "₹0";
      let donationStatsData = null;
      if (donationsResult.status === 'fulfilled') {
        const donationResponse = donationsResult.value;
        if (donationResponse?.data) {
          const stats = donationResponse.data;
          donationStatsData = stats;
          setDonationStats(stats);
          const amount = stats.totalRaised || 0;
          donationAmount = amount >= 100000
            ? `₹${(amount / 100000).toFixed(1)}L`
            : amount >= 1000
              ? `₹${(amount / 1000).toFixed(1)}k`
              : `₹${amount.toLocaleString()}`;
        }
      } else {
        setDonationStats(null);
      }

      // Process Connections Data
      let connectionsCount = 0;
      if (connectionsResult.status === 'fulfilled') {
        const connectionsResponse = connectionsResult.value;
        if (connectionsResponse?.data) {
          connectionsCount = Array.isArray(connectionsResponse.data) ? connectionsResponse.data.length : 0;
        }
      }

      // Process Posts Data
      let recentPostsList: Post[] = [];
      if (postsResult.status === 'fulfilled') {
        const postsResponse = postsResult.value;
        let allPosts: any[] = [];
        if (postsResponse?.data) {
          if (Array.isArray(postsResponse.data)) {
            allPosts = postsResponse.data;
          } else if (postsResponse.data.posts && Array.isArray(postsResponse.data.posts)) {
            allPosts = postsResponse.data.posts;
          }
        } else if (Array.isArray(postsResponse)) {
          allPosts = postsResponse;
        }
        recentPostsList = allPosts.slice(0, 3);
        setRecentPosts(recentPostsList);
      } else {
        setRecentPosts([]);
      }

      const newStats = {
        totalAlumni: verifiedAlumni.length,
        totalEvents: allEvents.length,
        activeEvents: activeEvents.length,
        totalDonations: donationAmount,
        totalJobs: jobs.filter((job: any) => job.isVerified).length,
        totalConnections: connectionsCount
      };

      setStats(newStats);
      setRecentEvents(upcomingEvents);
      setFeaturedAlumni(featured);

      // Cache the dashboard data
      cache.set(CACHE_KEYS.DASHBOARD_DATA, {
        stats: newStats,
        recentEvents: upcomingEvents,
        featuredAlumni: featured,
        recentJobs: recentJobsList,
        recentPosts: recentPostsList,
        donationStats: donationStatsData
      }, CACHE_TTL.MEDIUM);

    } catch (error: any) {
      console.error("Dashboard fetch error:", error);
      toast({ title: "Error", description: "Failed to load complete dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getAlumniInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Skeleton only for data sections, static UI renders immediately
  const StatsGridSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-4 sm:p-5 bg-card border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 sm:w-20" />
              <Skeleton className="h-7 sm:h-8 w-12 sm:w-16" />
            </div>
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  const ContentSkeleton = () => (
    <>
      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border/50 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '150ms' }}>
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 mb-4" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 sm:w-48" />
                  <Skeleton className="h-3 w-24 sm:w-32" />
                </div>
                <Skeleton className="h-5 sm:h-6 w-14 sm:w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '200ms' }}>
          <Skeleton className="h-5 sm:h-6 w-28 sm:w-36 mb-4" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20 sm:w-28" />
                  <Skeleton className="h-3 w-16 sm:w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={{ animationDelay: `${250 + i * 50}ms` }}
          >
            <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-3 sm:mb-4" />
            <div className="space-y-2 sm:space-y-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="p-2 sm:p-3 bg-muted/30 rounded-lg">
                  <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
                  <Skeleton className="h-2 sm:h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Hero Section - Always shown */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4 sm:p-6 md:p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            Welcome to AlumniHub
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-primary-foreground/90 mb-4 sm:mb-6 max-w-2xl">
            Connect, engage, and grow with our vibrant alumni community. Discover events,
            opportunities, and meaningful connections that last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button onClick={() => navigate('/communications')} size="default" className="bg-white text-primary hover:bg-white/90 text-sm sm:text-base">
              Explore Community
            </Button>
            <Button onClick={() => navigate('/events')} size="default" className="bg-white text-primary hover:bg-white/90 text-sm sm:text-base">
              Join Events
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/10 rounded-full -translate-y-16 sm:-translate-y-24 md:-translate-y-32 translate-x-16 sm:translate-x-24 md:translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-24 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 bg-white/5 rounded-full translate-y-12 sm:translate-y-18 md:translate-y-24 -translate-x-12 sm:-translate-x-18 md:-translate-x-24"></div>
      </div>

      {/* Stats Grid - Show skeleton or data */}
      {loading ? (
        <StatsGridSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            className="stats-card-orange cursor-pointer hover:shadow-md transition-all active:scale-95"
            onClick={() => navigate('/alumni')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-card-label">Total Alumni</p>
                <p className="stats-card-number">{stats.totalAlumni.toLocaleString()}</p>
              </div>
              <Users className="stats-card-icon" />
            </div>
          </div>
          <div
            className="stats-card-blue cursor-pointer hover:shadow-md transition-all active:scale-95"
            onClick={() => navigate('/events')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-card-label">Active Events</p>
                <p className="stats-card-number">{stats.activeEvents}</p>
              </div>
              <Calendar className="stats-card-icon" />
            </div>
          </div>
          <div
            className="stats-card-teal cursor-pointer hover:shadow-md transition-all active:scale-95"
            onClick={() => navigate('/events')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-card-label">Total Events</p>
                <p className="stats-card-number">{stats.totalEvents}</p>
              </div>
              <Briefcase className="stats-card-icon" />
            </div>
          </div>
          <div
            className="stats-card-pink cursor-pointer hover:shadow-md transition-all active:scale-95"
            onClick={() => navigate('/donations')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-card-label">Donations</p>
                <p className="stats-card-number">{stats.totalDonations}</p>
              </div>
              <Heart className="stats-card-icon" />
            </div>
          </div>
        </div>
      )}

      {/* Alumni Spotlight Section - Temporarily Disabled */}
      {/* {!loading && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '100ms' }}>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <AlumniSpotlight />
          </Suspense>
        </div>
      )} */}

      {/* Alumni World Map Section - Temporarily Disabled */}
      {/* {!loading && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '150ms' }}>
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <AlumniWorldMap />
          </Suspense>
        </div>
      )} */}

      {/* Content - Show skeleton or data */}
      {loading ? (
        <ContentSkeleton />
      ) : (
        <>

          {/* Bento Grid - Fixed Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Upcoming Events (Takes 2/3 width on large screens) */}
            <div className="lg:col-span-2">
              <BentoCard
                title="Upcoming Events"
                description="Don't miss these exciting opportunities"
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
                iconBg="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
                size="lg"
                gradient
                className="h-full cursor-pointer hover:border-blue-500/30 transition-colors"
                onClick={() => navigate('/events')}
              >
                <div className="space-y-4">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event, index) => (
                      <div key={event._id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatEventDate(event.date)} • {event.location || 'Location TBD'}
                          </p>
                        </div>
                        <Badge variant={index % 3 === 0 ? "default" : index % 3 === 1 ? "secondary" : "outline"}>
                          Event
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No upcoming events</p>
                  )}
                  <Button
                    className="w-full mt-4 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/25 hover:text-blue-700 border border-blue-500/20 hover:border-blue-500/40 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/30 dark:hover:text-blue-300"
                    onClick={(e) => { e.stopPropagation(); navigate('/events'); }}
                    variant="ghost"
                  >
                    View All Events
                  </Button>
                </div>
              </BentoCard>
            </div>

            {/* Right Column - Alumni Spotlight */}
            <div className="lg:col-span-1">
              <BentoCard
                title="Alumni Spotlight"
                description="Celebrating our community achievements"
                icon={<Users className="w-5 h-5 text-purple-500" />}
                iconBg="bg-gradient-to-br from-purple-500/20 to-purple-600/20"
                size="md"
                className="h-full cursor-pointer hover:border-purple-500/30 transition-colors"
                onClick={() => navigate('/alumni')}
              >
                <div className="space-y-4">
                  {featuredAlumni.length > 0 ? (
                    featuredAlumni.map((alumni) => (
                      <div key={alumni._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {getAlumniInitials(alumni.name)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {alumni.name} {alumni.graduationYear && `'${String(alumni.graduationYear).slice(-2)}`}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {alumni.course || 'Alumni'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No featured alumni</p>
                  )}
                </div>
              </BentoCard>
            </div>
          </div>


          {/* Second Row - Four Equal Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <BentoCard
              title="Job Opportunities"
              description="Latest career opportunities"
              icon={<Briefcase className="w-5 h-5 text-green-500" />}
              iconBg="bg-gradient-to-br from-green-500/20 to-green-600/20"
              size="md"
              className="h-full cursor-pointer hover:border-green-500/30 transition-colors"
              onClick={() => navigate('/jobs')}
            >
              <div className="space-y-3">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <div key={job._id} className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {job.company} • ₹{(job.salary / 1000).toFixed(0)}k
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No jobs available</p>
                )}
                <Button onClick={(e) => { e.stopPropagation(); navigate('/jobs'); }} size="sm" className="w-full mt-2 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/25 hover:text-green-700 border border-green-500/20 hover:border-green-500/40 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/30 dark:hover:text-green-300" variant="ghost">
                  View All Jobs
                </Button>
              </div>
            </BentoCard>

            <BentoCard
              title="Top Companies"
              description="Where our alumni thrive"
              icon={<Building2 className="w-5 h-5 text-orange-500" />}
              iconBg="bg-gradient-to-br from-orange-500/20 to-orange-600/20"
              size="md"
              className="h-full"
            >
              <div className="grid grid-cols-2 gap-4 h-full grid-rows-3">
                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <CompanyLogo
                    companyName="TCS"
                    domain="tcs.com"
                    containerClassName="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                    className="w-12 h-8 object-contain"
                    fallbackClassName="text-blue-600 font-bold text-lg"
                  />
                  <div>
                    <p className="font-semibold text-base mb-0.5">TCS</p>
                    <p className="text-sm text-muted-foreground">250+ alumni</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <CompanyLogo
                    companyName="Infosys"
                    domain="infosys.com"
                    containerClassName="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                    className="w-12 h-8 object-contain"
                    fallbackClassName="text-blue-600 font-bold text-lg"
                  />
                  <div>
                    <p className="font-semibold text-base mb-0.5">Infosys</p>
                    <p className="text-sm text-muted-foreground">180+ alumni</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <CompanyLogo
                    companyName="Google"
                    domain="google.com"
                    containerClassName="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                    className="w-12 h-8 object-contain"
                    fallbackClassName="text-blue-600 font-bold text-lg"
                  />
                  <div>
                    <p className="font-semibold text-base mb-0.5">Google</p>
                    <p className="text-sm text-muted-foreground">45+ alumni</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <CompanyLogo
                    companyName="Microsoft"
                    domain="microsoft.com"
                    containerClassName="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                    className="w-12 h-8 object-contain"
                    fallbackClassName="text-blue-600 font-bold text-lg"
                  />
                  <div>
                    <p className="font-semibold text-base mb-0.5">Microsoft</p>
                    <p className="text-sm text-muted-foreground">38+ alumni</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <CompanyLogo
                    companyName="IBM"
                    domain="ibm.com"
                    containerClassName="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                    className="w-12 h-8 object-contain"
                    fallbackClassName="text-blue-800 font-bold text-lg"
                  />
                  <div>
                    <p className="font-semibold text-base mb-0.5">IBM</p>
                    <p className="text-sm text-muted-foreground">95+ alumni</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <CompanyLogo
                    companyName="Wipro"
                    domain="wipro.com"
                    containerClassName="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                    className="w-12 h-8 object-contain"
                    fallbackClassName="text-purple-600 font-bold text-lg"
                  />
                  <div>
                    <p className="font-semibold text-base mb-0.5">Wipro</p>
                    <p className="text-sm text-muted-foreground">120+ alumni</p>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              title="Community Chat"
              description="Recent conversations"
              icon={<MessageCircle className="w-5 h-5 text-cyan-500" />}
              iconBg="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20"
              size="md"
              className="h-full cursor-pointer hover:border-cyan-500/30 transition-colors"
              onClick={() => navigate('/communications')}
            >
              <div className="space-y-4">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <div key={post._id} className="flex items-start space-x-3 p-2 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{post.author?.name || 'Alumni'}</p>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recent posts</p>
                )}
                <Button onClick={(e) => { e.stopPropagation(); navigate('/communications'); }} size="sm" className="w-full rounded-full bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/25 hover:text-cyan-700 border border-cyan-500/20 hover:border-cyan-500/40 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-cyan-500/15 dark:text-cyan-400 dark:hover:bg-cyan-500/30 dark:hover:text-cyan-300" variant="ghost">
                  Join Conversation
                </Button>
              </div>
            </BentoCard>

            <BentoCard
              title="Donation Impact"
              description="Making a difference together"
              icon={<Heart className="w-5 h-5 text-rose-500" />}
              iconBg="bg-gradient-to-br from-rose-500/20 to-pink-600/20"
              size="md"
              className="h-full cursor-pointer hover:border-rose-500/30 transition-colors"
              onClick={() => navigate('/donations')}
            >
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">{stats.totalDonations}</p>
                  <p className="text-sm text-muted-foreground">Raised this year</p>
                </div>
                {donationStats ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Campaign Progress</span>
                        <span>{donationStats.campaignGoalPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(donationStats.campaignGoalPercentage, 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-xl font-bold text-rose-500">{donationStats.activeDonors}</p>
                        <p className="text-xs text-muted-foreground">Active Donors</p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-xl font-bold text-rose-500">{donationStats.totalCampaigns}</p>
                        <p className="text-xs text-muted-foreground">Campaigns</p>
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Donation</p>
                      <p className="text-lg font-bold text-rose-500">₹{donationStats.avgDonation.toFixed(0)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Loading...</span>
                        <span>--</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <Button onClick={(e) => { e.stopPropagation(); navigate('/donations'); }} className="w-full rounded-full bg-rose-500/10 text-rose-600 hover:bg-rose-500/25 hover:text-rose-700 border border-rose-500/20 hover:border-rose-500/40 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/30 dark:hover:text-rose-300" variant="ghost">Support a Cause</Button>
              </div>
            </BentoCard>
          </div>
        </>
      )}
    </div>
  );
}