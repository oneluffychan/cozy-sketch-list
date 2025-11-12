import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sparkles, Heart } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back! 🌸");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success("Account created! Welcome to your anime haven ✨");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 paper-texture">
      <div className="w-full max-w-md">
        <div className="card-sketchy p-8 bg-card relative">
          {/* Cute doodles */}
          <div className="absolute -top-6 -right-6 sticker">
            <Sparkles className="w-12 h-12 text-anime-purple" fill="currentColor" />
          </div>
          <div className="absolute -bottom-4 -left-4 sticker">
            <Heart className="w-10 h-10 text-anime-pink" fill="currentColor" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-handwritten mb-2 wobble-hover inline-block">
              {isLogin ? "Welcome Back!" : "Join Us!"}
            </h1>
            <p className="text-muted-foreground font-doodle">
              Your cozy anime companion 🌸
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-doodle mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="btn-doodle"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-doodle mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="btn-doodle"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-doodle bg-primary hover:bg-primary/90 font-doodle text-lg"
            >
              {loading ? "Loading..." : isLogin ? "Login ✨" : "Sign Up 🌟"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground underline-doodle font-doodle"
            >
              {isLogin
                ? "Need an account? Sign up!"
                : "Already have an account? Login!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
