import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "starry" | "sakura" | "neon" | "minimal";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("starry");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          const { data, error } = await supabase
            .from("profiles")
            .select("theme")
            .eq("id", session.user.id)
            .single();

          if (data && !error) {
            setThemeState(data.theme as Theme);
            document.documentElement.setAttribute("data-theme", data.theme);
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        const { error } = await supabase
          .from("profiles")
          .upsert({ id: session.user.id, theme: newTheme, email: session.user.email })
          .eq("id", session.user.id);

        if (!error) {
          setThemeState(newTheme);
          document.documentElement.setAttribute("data-theme", newTheme);
        }
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};