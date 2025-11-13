import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, TrendingUp, Heart, Clock, CheckCircle } from "lucide-react";

interface WatchlistStats {
  total: number;
  watchLater: number;
  watching: number;
  completed: number;
  averageRating: number;
  totalEpisodesWatched: number;
}

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WatchlistStats>({
    total: 0,
    watchLater: 0,
    watching: 0,
    completed: 0,
    averageRating: 0,
    totalEpisodesWatched: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchStats(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const watchLater = data.filter(item => item.status === "watch_later").length;
      const watching = data.filter(item => item.status === "watching").length;
      const completed = data.filter(item => item.status === "completed").length;
      
      const ratingsData = data.filter(item => item.rating);
      const averageRating = ratingsData.length > 0
        ? ratingsData.reduce((acc, item) => acc + (item.rating || 0), 0) / ratingsData.length
        : 0;

      const totalEpisodesWatched = data.reduce(
        (acc, item) => acc + (item.episodes_watched || 0),
        0
      );

      setStats({
        total: data.length,
        watchLater,
        watching,
        completed,
        averageRating: Number(averageRating.toFixed(1)),
        totalEpisodesWatched,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-bounce">
          <User className="w-12 h-12 text-anime-purple" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen paper-texture pb-8">
      {/* Header */}
      <header className="bg-card border-b-2 border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="btn-doodle font-doodle"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-handwritten wobble-hover inline-block">
            My Profile 🌸
          </h1>
          <div className="w-32"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* User Info Card */}
        <Card className="card-sketchy bg-card">
          <CardHeader>
            <CardTitle className="font-handwritten text-2xl flex items-center gap-2">
              <User className="w-6 h-6 text-anime-purple" />
              Account Information
            </CardTitle>
            <CardDescription className="font-doodle">
              Your profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-doodle flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                value={session.user.email || ""}
                disabled
                className="btn-doodle bg-muted"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-doodle flex items-center gap-2">
                <User className="w-4 h-4" />
                User ID
              </label>
              <Input
                value={session.user.id}
                disabled
                className="btn-doodle bg-muted text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Anime */}
          <Card className="card-sketchy bg-gradient-to-br from-anime-pink/20 to-anime-blue/20">
            <CardHeader>
              <CardTitle className="font-handwritten text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-anime-purple" />
                Total Anime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-anime-purple">{stats.total}</p>
              <p className="text-sm text-muted-foreground font-doodle mt-2">
                In your collection
              </p>
            </CardContent>
          </Card>

          {/* Watch Later */}
          <Card className="card-sketchy bg-gradient-to-br from-anime-blue/20 to-anime-purple/20">
            <CardHeader>
              <CardTitle className="font-handwritten text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-anime-blue" />
                Watch Later
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-anime-blue">{stats.watchLater}</p>
              <p className="text-sm text-muted-foreground font-doodle mt-2">
                Waiting to watch
              </p>
            </CardContent>
          </Card>

          {/* Currently Watching */}
          <Card className="card-sketchy bg-gradient-to-br from-anime-purple/20 to-anime-pink/20">
            <CardHeader>
              <CardTitle className="font-handwritten text-xl flex items-center gap-2">
                <Heart className="w-5 h-5 text-anime-purple" />
                Watching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-anime-purple">{stats.watching}</p>
              <p className="text-sm text-muted-foreground font-doodle mt-2">
                Currently enjoying
              </p>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="card-sketchy bg-gradient-to-br from-anime-pink/20 to-anime-purple/20">
            <CardHeader>
              <CardTitle className="font-handwritten text-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-anime-pink" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-anime-pink">{stats.completed}</p>
              <p className="text-sm text-muted-foreground font-doodle mt-2">
                Finished watching
              </p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="card-sketchy bg-gradient-to-br from-anime-blue/20 to-anime-pink/20">
            <CardHeader>
              <CardTitle className="font-handwritten text-xl flex items-center gap-2">
                <Heart className="w-5 h-5 text-anime-pink" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-anime-pink">
                {stats.averageRating > 0 ? `${stats.averageRating}/10` : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground font-doodle mt-2">
                Your average score
              </p>
            </CardContent>
          </Card>

          {/* Total Episodes */}
          <Card className="card-sketchy bg-gradient-to-br from-anime-purple/20 to-anime-blue/20">
            <CardHeader>
              <CardTitle className="font-handwritten text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-anime-blue" />
                Episodes Watched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-anime-blue">{stats.totalEpisodesWatched}</p>
              <p className="text-sm text-muted-foreground font-doodle mt-2">
                Total episodes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Completion Progress */}
        <Card className="card-sketchy bg-card">
          <CardHeader>
            <CardTitle className="font-handwritten text-2xl">Collection Overview</CardTitle>
            <CardDescription className="font-doodle">
              Your watching progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-doodle">
                  <span>Watch Later</span>
                  <span>{stats.total > 0 ? ((stats.watchLater / stats.total) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-anime-blue transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.watchLater / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-doodle">
                  <span>Watching</span>
                  <span>{stats.total > 0 ? ((stats.watching / stats.total) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-anime-purple transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.watching / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-doodle">
                  <span>Completed</span>
                  <span>{stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-anime-pink transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
