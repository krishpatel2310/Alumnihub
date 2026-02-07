import { useState, useEffect } from "react";
import { Send, MessageSquare, Mail, Bell, Users, Plus, TrendingUp, Flame, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RedditPostCard } from "@/components/communication/RedditPostCard";
import { PostComposer } from "@/components/communication/PostComposer";
import { communicationService, notificationService } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const messages = [
  {
    id: 1,
    user: "Priya Sharma '18",
    message: "Looking for mentorship opportunities in AI/ML. Would love to connect with alumni in this field! I'm particularly interested in computer vision and natural language processing. Currently working on a startup idea and would appreciate any guidance from experienced professionals.",
    timestamp: "2 hours ago",
    replies: 15,
    category: "Mentorship",
    upvotes: 45,
    downvotes: 2
  },
  {
    id: 2,
    user: "Arjun Patel '15",
    message: "Hosting a fintech startup meetup next month in Mumbai. Alumni in finance welcome to join! We'll be discussing the latest trends in digital banking, crypto, and payment solutions. Great networking opportunity!",
    timestamp: "4 hours ago",
    replies: 23,
    category: "Events",
    upvotes: 67,
    downvotes: 5
  },
  {
    id: 3,
    user: "Kavya Reddy '20",
    message: "Just published a research paper on biomedical engineering applications in prosthetics. Happy to discuss with fellow researchers and share insights about the latest developments in the field.",
    timestamp: "1 day ago",
    replies: 12,
    category: "Research",
    upvotes: 34,
    downvotes: 1
  },
  {
    id: 4,
    user: "Rohan Singh '16",
    message: "Our marketing agency is expanding! Looking for talented alumni to join our team. We're specifically looking for digital marketing specialists, content creators, and data analysts. Great company culture and competitive benefits.",
    timestamp: "2 days ago",
    replies: 28,
    category: "Jobs",
    upvotes: 89,
    downvotes: 7
  },
  {
    id: 5,
    user: "Ananya Gupta '19",
    message: "Successfully raised Series A funding for my EdTech startup! AMA about the fundraising process, pitching to VCs, and building a product-market fit. Happy to share lessons learned.",
    timestamp: "3 days ago",
    replies: 42,
    category: "Alumni Stories",
    upvotes: 156,
    downvotes: 3
  }
];

const notifications = [
  {
    id: 1,
    title: "Priya Sharma replied to your post",
    message: "Thanks for the mentorship advice! I'd love to connect and discuss further.",
    timestamp: "1 hour ago",
    type: "reply",
    read: false
  },
  {
    id: 2,
    title: "Arjun Patel started a new thread",
    message: "Looking for co-founders for my new fintech startup - anyone interested?",
    timestamp: "2 hours ago",
    type: "thread",
    read: false
  },
  {
    id: 3,
    title: "Kavya Reddy replied to you",
    message: "Great question about biomedical research! Here's my perspective...",
    timestamp: "5 hours ago",
    type: "reply",
    read: true
  },
  {
    id: 4,
    title: "Rohan Singh mentioned you in a post",
    message: "Tagging @AlumniDave for insights on marketing strategy for startups",
    timestamp: "8 hours ago",
    type: "mention",
    read: true
  },
  {
    id: 5,
    title: "Ananya Gupta started a new discussion",
    message: "Anyone attending the upcoming Alumni Tech Summit? Let's plan a meetup!",
    timestamp: "1 day ago",
    type: "thread",
    read: true
  },
  {
    id: 6,
    title: "5 people liked your comment",
    message: "Your comment on 'Career transition tips' received multiple likes",
    timestamp: "2 days ago",
    type: "like",
    read: true
  }
];

export default function Communications() {
  const [newMessage, setNewMessage] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    totalPosts: 0,
    activeUsers: 0,
    comments: 0,
    upvotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await communicationService.getAllPosts({
        sortBy,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 20
      });

      if (response.success && response.data) {
        setPosts(response.data.posts || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await communicationService.getCommunicationStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      // Failed to fetch stats
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      // Only fetch community chat related notifications
      const response = await notificationService.getNotifications({
        page: 1,
        limit: 20,
        type: 'reply,comment,upvote,mention,post'
      });

      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error: any) {
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (error: any) {
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  // Navigate to post from notification
  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.postId) {
      navigate(`/communications/post/${notification.postId}`);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts();
    fetchStats();
    fetchNotifications();
  }, [sortBy, selectedCategory]);

  // Handle post created
  const handlePostCreated = () => {
    fetchPosts();
    fetchStats();
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in px-1 sm:px-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text mb-0.5 sm:mb-1">Community Chat</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Stay connected with the alumni community
          </p>
        </div>
      </div>

      <Tabs defaultValue="community" className="space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Tabs - Full width on mobile */}
          <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
            <TabsTrigger value="community" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-full">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 sm:gap-2 relative text-xs sm:text-sm h-full">
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Alerts
              {unreadCount > 0 && (
                <Badge className="ml-1 px-1 min-w-[18px] h-4 text-[10px] sm:text-xs" variant="destructive">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Sort Options - Scrollable on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none touch-manipulation">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 h-7 sm:h-8 px-2 sm:px-3 rounded-full font-semibold transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 text-[11px] sm:text-xs whitespace-nowrap flex-shrink-0 ${sortBy === 'hot'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'hover:bg-orange-500/15 hover:text-orange-400 border border-transparent hover:border-orange-500/20'
                }`}
              onClick={() => setSortBy('hot')}
            >
              <Flame className="w-3 h-3" />
              Hot
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 h-7 sm:h-8 px-2 sm:px-3 rounded-full font-semibold transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 text-[11px] sm:text-xs whitespace-nowrap flex-shrink-0 ${sortBy === 'new'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'hover:bg-blue-500/15 hover:text-blue-400 border border-transparent hover:border-blue-500/20'
                }`}
              onClick={() => setSortBy('new')}
            >
              <Clock className="w-3 h-3" />
              New
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 h-7 sm:h-8 px-2 sm:px-3 rounded-full font-semibold transition-all duration-200 focus-visible:ring-0 focus-visible:ring-offset-0 text-[11px] sm:text-xs whitespace-nowrap flex-shrink-0 ${sortBy === 'top'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'hover:bg-purple-500/15 hover:text-purple-400 border border-transparent hover:border-purple-500/20'
                }`}
              onClick={() => setSortBy('top')}
            >
              <TrendingUp className="w-3 h-3" />
              Top
            </Button>
          </div>
        </div>

        <TabsContent value="community" className="space-y-3 sm:space-y-4">
          {/* Post Composer */}
          <PostComposer onPostCreated={handlePostCreated} />

          {/* Community Stats - Compact on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <Card className="border-l-2 sm:border-l-4 border-l-orange-500">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Posts</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.totalPosts.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-2 sm:border-l-4 border-l-green-500">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Users</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-2 sm:border-l-4 border-l-blue-500">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Replies</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.comments.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-2 sm:border-l-4 border-l-purple-500">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">Votes</p>
                    <p className="text-lg sm:text-xl font-bold">{stats.upvotes.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Feed */}
          <div className="space-y-2 sm:space-y-3">
            {loading ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-muted-foreground text-sm">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-muted-foreground text-sm">No posts yet. Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => (
                <RedditPostCard
                  key={post._id}
                  post={post}
                  onUpdate={fetchPosts}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Recent Notifications
                  </CardTitle>
                  <CardDescription>Stay updated with important announcements and activities</CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="gap-2 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/25 hover:text-green-700 border border-green-500/20 hover:border-green-500/40 font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/30 dark:hover:text-green-300"
                  >
                    <Check className="w-4 h-4" />
                    Mark all as read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const formatTimestamp = (timestamp: string) => {
                      const date = new Date(timestamp);
                      const now = new Date();
                      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

                      if (diffInSeconds < 60) return 'just now';
                      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
                      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
                      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

                      return date.toLocaleDateString();
                    };

                    return (
                      <div
                        key={notification._id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent ${!notification.read ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.read ? 'bg-primary' : 'bg-transparent'
                          }`} />

                        <div className="relative flex-shrink-0">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={notification.sender?.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {notification.sender?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm mb-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.createdAt)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Broadcasts
              </CardTitle>
              <CardDescription>Send announcements to alumni groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Enter email subject..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Group</label>
                  <select className="w-full p-2 border border-border bg-card rounded-md text-foreground">
                    <option>All Alumni</option>
                    <option>Class of 2020</option>
                    <option>Class of 2019</option>
                    <option>Technology Alumni</option>
                    <option>Business Alumni</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message Content</label>
                <Textarea
                  placeholder="Write your announcement..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Save Draft</Button>
                  <Button variant="outline" size="sm">Preview</Button>
                </div>
                <Button className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Broadcasts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Broadcasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    subject: "Alumni Tech Summit 2024 - Registration Open",
                    recipients: "All Alumni",
                    sent: "2 days ago",
                    opens: "68%"
                  },
                  {
                    subject: "Scholarship Fund Update - 85% Goal Reached",
                    recipients: "Donors",
                    sent: "1 week ago",
                    opens: "72%"
                  },
                  {
                    subject: "New Job Opportunities from Alumni Network",
                    recipients: "Recent Graduates",
                    sent: "2 weeks ago",
                    opens: "65%"
                  }
                ].map((broadcast, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h4 className="font-medium">{broadcast.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent to {broadcast.recipients} • {broadcast.sent}
                      </p>
                    </div>
                    <Badge variant="secondary">{broadcast.opens} open rate</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}