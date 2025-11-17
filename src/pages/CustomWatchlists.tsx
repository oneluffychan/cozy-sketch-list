import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Plus, Share2, Trash2, Edit, Copy } from "lucide-react";

interface CustomWatchlist {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  share_token: string;
  created_at: string;
}

const CustomWatchlists = () => {
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState<CustomWatchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: false,
  });

  useEffect(() => {
    checkAuth();
    fetchWatchlists();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchWatchlists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("custom_watchlists")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWatchlists(data || []);
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      toast.error("Failed to load watchlists");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (editingId) {
        const { error } = await supabase
          .from("custom_watchlists")
          .update({
            name: formData.name,
            description: formData.description,
            is_public: formData.is_public,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", session.user.id);

        if (error) throw error;
        toast.success("Watchlist updated! 🎉");
      } else {
        const { error } = await supabase
          .from("custom_watchlists")
          .insert({
            user_id: session.user.id,
            name: formData.name,
            description: formData.description,
            is_public: formData.is_public,
          });

        if (error) throw error;
        toast.success("Watchlist created! ✨");
      }

      setDialogOpen(false);
      setFormData({ name: "", description: "", is_public: false });
      setEditingId(null);
      fetchWatchlists();
    } catch (error) {
      console.error("Error saving watchlist:", error);
      toast.error("Failed to save watchlist");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this watchlist?")) return;

    try {
      const { error } = await supabase
        .from("custom_watchlists")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Watchlist deleted");
      fetchWatchlists();
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      toast.error("Failed to delete watchlist");
    }
  };

  const handleEdit = (watchlist: CustomWatchlist) => {
    setEditingId(watchlist.id);
    setFormData({
      name: watchlist.name,
      description: watchlist.description || "",
      is_public: watchlist.is_public,
    });
    setDialogOpen(true);
  };

  const copyShareLink = (shareToken: string) => {
    const link = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard! 📋");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-anime-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anime-purple mx-auto mb-4"></div>
          <p className="text-anime-purple font-doodle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anime-cream p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="btn-doodle"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-marker text-4xl text-anime-purple">My Custom Watchlists</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingId(null);
              setFormData({ name: "", description: "", is_public: false });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="btn-doodle">
                <Plus className="h-4 w-4 mr-2" />
                Create Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-marker text-2xl">
                  {editingId ? "Edit Watchlist" : "Create New Watchlist"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., My Top 10 Shounen"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What's special about this list?"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                  />
                  <Label htmlFor="public">Make this watchlist public</Label>
                </div>
                <Button type="submit" className="w-full btn-doodle">
                  {editingId ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {watchlists.length === 0 ? (
          <Card className="card-sketchy text-center p-12">
            <CardContent>
              <p className="text-gray-600 font-doodle mb-4">
                You haven't created any custom watchlists yet!
              </p>
              <p className="text-sm text-gray-500">
                Create themed collections of anime and share them with friends 🎉
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlists.map((watchlist) => (
              <Card key={watchlist.id} className="card-sketchy sticker hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="font-marker flex items-center justify-between">
                    <span className="truncate">{watchlist.name}</span>
                    {watchlist.is_public && (
                      <span className="text-xs bg-anime-purple text-white px-2 py-1 rounded-full">
                        Public
                      </span>
                    )}
                  </CardTitle>
                  {watchlist.description && (
                    <CardDescription className="font-doodle line-clamp-2">
                      {watchlist.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/watchlist/${watchlist.id}`)}
                    className="btn-doodle flex-1"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(watchlist)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {watchlist.is_public && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyShareLink(watchlist.share_token)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(watchlist.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomWatchlists;