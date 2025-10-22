import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, FileText, PenSquare, Inbox, Sparkles } from "lucide-react";
import { type BlogPost } from "@/lib/blogApi"; // ✅ Changed import
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  editorContent: React.ReactNode;
  previewContent: React.ReactNode;
  posts: BlogPost[]; // ✅ Receive posts from parent
  onEditPost?: (post: BlogPost) => void;
  onDeletePost?: (id: string) => Promise<void>; // ✅ Async delete handler
}

export const AdminDashboard = ({ 
  editorContent, 
  previewContent, 
  posts, // ✅ Use posts from props
  onEditPost,
  onDeletePost,
}: AdminDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null); // ✅ Track deleting state

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) {
      return;
    }

    if (onDeletePost) {
      setDeletingId(id);
      try {
        await onDeletePost(id);
        toast({
          title: "Deleted",
          description: "Blog post has been deleted",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEdit = (post: BlogPost) => {
    if (onEditPost) {
      onEditPost(post);
    }
  };

  // ✅ Filter posts from props
  const publishedPosts = posts.filter(p => p.published);
  const draftPosts = posts.filter(p => !p.published);

  const PostCard = ({ post }: { post: BlogPost }) => {
    const isDeleting = deletingId === post.id;

    return (
      <Card className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{post.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(post.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
              {/* Show category and tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">
                  {post.category}
                </Badge>
                {post.tags && post.tags.slice(0, 2).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge variant={post.published ? "default" : "secondary"}>
              {post.published ? "Published" : "Draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2">
            {post.published && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleEdit(post)}
              disabled={isDeleting}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => handleDelete(post.id, post.title)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Sparkles className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Tabs defaultValue="edit" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-4 bg-card">
        <TabsTrigger value="edit">
          <PenSquare className="h-4 w-4 mr-2" />
          Create Post
        </TabsTrigger>
        <TabsTrigger value="preview">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </TabsTrigger>
        <TabsTrigger value="manage">
          <FileText className="h-4 w-4 mr-2" />
          Published ({publishedPosts.length})
        </TabsTrigger>
        <TabsTrigger value="drafts">
          <Inbox className="h-4 w-4 mr-2" />
          Drafts ({draftPosts.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="edit">
        {editorContent}
      </TabsContent>

      <TabsContent value="preview">
        {previewContent}
      </TabsContent>

      <TabsContent value="manage">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Published Posts</h2>
            <p className="text-muted-foreground">{publishedPosts.length} published</p>
          </div>
          {publishedPosts.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No published posts yet!</p>
                <p className="text-sm text-muted-foreground">
                  Create your first post and click "Publish" to see it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="drafts">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Draft Posts</h2>
            <p className="text-muted-foreground">{draftPosts.length} drafts</p>
          </div>
          {draftPosts.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No drafts saved</p>
                <p className="text-sm text-muted-foreground">
                  Click "Save Draft" to save your work in progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};