import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService } from "@/services/ApiServices";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Sparkles } from "lucide-react";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { UserProfileDialog } from "@/components/profile/UserProfileDialog";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  currentPosition?: string;
  company?: string;
  graduationYear?: number;
  course?: string;
  location?: string;
  avatar?: string;
  skills?: string[];
  interests?: string[];
}

interface MentorRecommendation {
  mentor: {
    _id: string;
    name: string;
    email: string;
    currentPosition?: string;
    company?: string;
    graduationYear?: number;
    course?: string;
    location?: string;
    avatar?: string;
    skills?: string[];
    interests?: string[];
  };
  score: number;
  reason?: string;
}

interface CareerRecommendation {
  key: string;
  name: string;
  description: string;
  recommendedSkills: string[];
  roadmap?: string[];
  score: number;
  matchedSkills?: string[];
  reason?: string;
}

export default function Recommendations() {
  const { toast } = useToast();
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [mentors, setMentors] = useState<MentorRecommendation[]>([]);
  const [careers, setCareers] = useState<CareerRecommendation[]>([]);

  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingMentors(true);
        setLoadingCareers(true);

        const [meRes, usersRes] = await Promise.all([
          userService.getCurrentUser(),
          userService.getAllUsers(),
        ]);

        const me = meRes?.data as UserProfile;
        const allUsers = (usersRes?.data || []) as UserProfile[];

        if (!me) {
          throw new Error("Current user not found");
        }

        setCurrentUser(me);

        // ---- Mentor recommendations (frontend rule-based) ----
        const alumni = allUsers.filter((u) => u.role === "alumni");

        const normalize = (value?: string | number) =>
          (value ?? "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "");

        const studentSkills = new Set(me.skills || []);
        const studentCourse = normalize(me.course);
        const studentLocation = normalize(me.location);

        const mentorScored: MentorRecommendation[] = alumni.map((alum) => {
          let rawScore = 0;

          const alumCourse = normalize(alum.course);
          if (
            studentCourse &&
            alumCourse &&
            (alumCourse === studentCourse ||
              alumCourse.includes(studentCourse) ||
              studentCourse.includes(alumCourse))
          ) {
            rawScore += 3;
          }

          const alumLocation = normalize(alum.location);
          if (studentLocation && alumLocation && alumLocation === studentLocation) {
            rawScore += 1;
          }

          if (Array.isArray(alum.skills) && alum.skills.length > 0) {
            const overlap = alum.skills.filter((s) => studentSkills.has(s));
            rawScore += overlap.length * 2;
          }

          // Normalize score into 0–1 range so we always show 0–100%
          // Max rawScore with current weights is roughly 3 (course) + 1 (location) + 2*5 (skills) = 14
          const normalizedScore = Math.min(rawScore / 14, 1);

          return {
            mentor: alum,
            score: normalizedScore,
            reason: "Rule-based match based on course, location and skills overlap",
          };
        });

        const sortedMentors = mentorScored
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        setMentors(sortedMentors);

        // ---- Career path recommendations (frontend rule-based) ----
        const careerPaths = [
          {
            key: "backend_engineer",
            name: "Backend Engineer",
            description:
              "Designs and builds server-side applications, APIs, and databases. Focuses on scalability, performance, and security.",
            recommendedSkills: [
              "Node.js",
              "Express",
              "MongoDB",
              "SQL",
              "REST APIs",
              "Authentication",
              "Docker",
              "System Design",
            ],
            roadmap: [
              "Master JavaScript/TypeScript fundamentals",
              "Learn Node.js and Express for building APIs",
              "Understand databases (MongoDB and/or SQL)",
            ],
          },
          {
            key: "frontend_engineer",
            name: "Frontend Engineer",
            description:
              "Builds interactive user interfaces and web applications, focusing on user experience, accessibility, and performance.",
            recommendedSkills: [
              "HTML",
              "CSS",
              "JavaScript",
              "React",
              "State Management",
              "Responsive Design",
            ],
            roadmap: [
              "Learn HTML, CSS, and modern JavaScript",
              "Build projects using React or a similar framework",
            ],
          },
          {
            key: "fullstack_developer",
            name: "Full Stack Developer",
            description:
              "Works on both frontend and backend, able to build end-to-end web applications.",
            recommendedSkills: [
              "React",
              "Node.js",
              "Express",
              "MongoDB",
              "REST APIs",
            ],
            roadmap: [
              "Learn frontend fundamentals",
              "Learn backend fundamentals",
              "Build and deploy full-stack projects",
            ],
          },
          {
            key: "data_analyst",
            name: "Data Analyst",
            description:
              "Analyzes data to generate insights, dashboards, and reports to support business decisions.",
            recommendedSkills: [
              "SQL",
              "Excel",
              "Python",
              "Pandas",
              "Data Visualization",
              "Statistics",
            ],
            roadmap: [
              "Learn SQL and basic statistics",
              "Use Python and Pandas for data analysis",
            ],
          },
          {
            key: "data_scientist",
            name: "Data Scientist",
            description:
              "Builds models and experiments using data, machine learning, and statistics.",
            recommendedSkills: [
              "Python",
              "Machine Learning",
              "Statistics",
              "Pandas",
              "NumPy",
              "Scikit-learn",
            ],
            roadmap: [
              "Strengthen math and statistics foundations",
              "Study common ML algorithms and evaluation",
            ],
          },
        ];

        const userSkills = new Set(me.skills || []);

        const careerScored: CareerRecommendation[] = careerPaths.map((path) => {
          const overlap = (path.recommendedSkills || []).filter((skill) =>
            userSkills.has(skill)
          );

          const score = overlap.length / Math.max(path.recommendedSkills.length, 1);

          return {
            key: path.key,
            name: path.name,
            description: path.description,
            recommendedSkills: path.recommendedSkills,
            roadmap: path.roadmap,
            score,
            matchedSkills: overlap,
            reason: overlap.length
              ? "Matched based on overlapping skills"
              : "Potential path based on general tech profile",
          };
        });

        const sortedCareers = careerScored
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        setCareers(sortedCareers);
      } catch (error: any) {
        console.error("Recommendation error:", error);
        toast({
          title: "Unable to load recommendations",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingMentors(false);
        setLoadingCareers(false);
      }
    };

    fetchData();
  }, [toast]);

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const MentorSkeleton = () => (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border rounded-lg bg-card/40"
        >
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );

  const CareerSkeleton = () => (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="p-4 border rounded-lg bg-card/40 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  const handleMessage = (userId: string) => {
    setSelectedUserId(userId);
    setChatDialogOpen(true);
  };

  const handleAvatarClick = (userId: string) => {
    setSelectedProfileId(userId);
    setProfileDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">
          AI Recommendations
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Get personalized mentor and career path suggestions based on your profile.
        </p>
      </div>

      <Tabs defaultValue="mentors" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="mentors" className="gap-2 text-xs sm:text-sm">
            <UserPlus className="w-4 h-4" />
            Mentors
          </TabsTrigger>
          <TabsTrigger value="careers" className="gap-2 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" />
            Career Paths
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Recommended Mentors
              </CardTitle>
              <CardDescription>
                Alumni whose experience and skills align closely with your profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMentors ? (
                <MentorSkeleton />
              ) : mentors.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No mentor recommendations available yet. Try adding more skills and profile details.
                </p>
              ) : (
                <div className="space-y-3">
                  {mentors.map((item) => (
                    <div
                      key={item.mentor._id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/40 transition-colors"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => handleAvatarClick(item.mentor._id)}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={item.mentor.avatar} />
                          <AvatarFallback>
                            {getInitials(item.mentor.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              {item.mentor.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.mentor.currentPosition ||
                                item.mentor.company ||
                                "Alumni"}
                              {item.mentor.graduationYear &&
                                ` • Class of ${item.mentor.graduationYear}`}
                            </p>
                          </div>
                          <Badge variant="outline">
                            Match {(item.score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        {item.mentor.skills && item.mentor.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.mentor.skills.slice(0, 4).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-[10px] sm:text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {item.reason && (
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                            {item.reason}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full"
                        variant="outline"
                        onClick={() => handleMessage(item.mentor._id)}
                      >
                        Message
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="careers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recommended Career Paths
              </CardTitle>
              <CardDescription>
                Roles and paths that align well with your current skills and interests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCareers ? (
                <CareerSkeleton />
              ) : careers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No career recommendations available yet. Try adding your skills and interests in your profile.
                </p>
              ) : (
                <div className="space-y-3">
                  {careers.map((path) => (
                    <div
                      key={path.key}
                      className="p-4 border rounded-lg hover:bg-accent/40 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{path.name}</h3>
                        <Badge variant="outline">
                          Fit {(path.score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {path.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {path.recommendedSkills.slice(0, 6).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-[10px] sm:text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {path.matchedSkills && path.matchedSkills.length > 0 && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                          You already have: {path.matchedSkills.join(", ")}
                        </p>
                      )}
                      {path.roadmap && path.roadmap.length > 0 && (
                        <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1 space-y-1">
                          {path.roadmap.slice(0, 3).map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      )}
                      {path.reason && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {path.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <ChatDialog
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        userId={selectedUserId || undefined}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        userId={selectedProfileId}
        onMessageClick={(userId) => {
          setSelectedUserId(userId);
          setChatDialogOpen(true);
        }}
      />
    </div>
  );
}

