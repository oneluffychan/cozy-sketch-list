import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AnimeCard from "./AnimeCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Anime {
  mal_id: number;
  title: string;
  title_japanese?: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  episodes?: number;
  score?: number;
  year?: number;
  synopsis?: string;
}

const AnimeSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [userWatchlist, setUserWatchlist] = useState<number[]>([]);

  useEffect(() => {
    fetchTrendingAnime();
    fetchUserWatchlist();
  }, []);

  const fetchUserWatchlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("watchlist")
        .select("anime_id")
        .eq("user_id", session.user.id);

      if (error) throw error;
      setUserWatchlist(data.map(item => item.anime_id));
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  const fetchTrendingAnime = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/top/anime?page=1&limit=12`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch trending anime");
      }

      const data = await response.json();
      setTrendingAnime(data.data || []);
    } catch (error) {
      console.error("Trending error:", error);
      toast.error("Failed to load trending anime");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent, page = 1) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearchMode(true);
    setCurrentPage(page);
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=12`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch anime");
      }

      const data = await response.json();
      setResults(data.data || []);
      setTotalPages(data.pagination?.last_visible_page || 1);
      
      if (data.data.length === 0) {
        toast.info("No anime found. Try a different search!");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search anime. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayAnime = isSearchMode ? results : trendingAnime;

  return (
    <div className="space-y-8">
      <form onSubmit={(e) => handleSearch(e, 1)} className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for anime... 🔍"
          className="btn-doodle font-doodle"
        />
        <Button
          type="submit"
          disabled={loading}
          className="btn-doodle bg-primary hover:bg-primary/90 font-doodle"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {!isSearchMode && (
        <div className="space-y-4">
          <h3 className="text-xl font-handwritten flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-anime-purple" />
            Trending Anime
          </h3>
        </div>
      )}

      {displayAnime.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayAnime.map((anime) => (
              <AnimeCard
                key={anime.mal_id}
                anime={{
                  anime_id: anime.mal_id,
                  anime_title: anime.title,
                  anime_title_japanese: anime.title_japanese,
                  anime_image: anime.images.jpg.large_image_url,
                  total_episodes: anime.episodes,
                  status: "watch_later",
                }}
                showAddButton
                existingInWatchlist={userWatchlist.includes(anime.mal_id)}
                onUpdate={fetchUserWatchlist}
              />
            ))}
          </div>

          {isSearchMode && totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer btn-doodle"
                    />
                  </PaginationItem>
                )}
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer btn-doodle"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer btn-doodle"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default AnimeSearch;
