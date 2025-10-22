import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, FileText, PenSquare, Inbox } from "lucide-react";
import { getAllBlogPosts, deleteBlogPost, type BlogPost } from "@/lib/blogStorage";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// ✅ THIS INTERFACE IS CRITICAL
interface AdminDashboardProps {
  editorContent: React.ReactNode;
  previewContent: React.ReactNode;
  onEditPost?: (post: BlogPost) => void;
  key?: number;
}

// ✅ COMPONENT MUST ACCEPT PROPS
export const AdminDashboard = ({ 
  editorContent, 
  previewContent, 
  onEditPost,
  key,
}: AdminDashboardProps) => {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, [key]);

  const loadPosts = () => {
    const posts = getAllBlogPosts();
    setAllPosts(posts);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteBlogPost(id);
      loadPosts();
      toast({
        title: "Deleted",
        description: "Blog post has been deleted",
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    if (onEditPost) {
      onEditPost(post);
    }
  };

  const publishedPosts = allPosts.filter(p => p.published);
  const draftPosts = allPosts.filter(p => !p.published);

  const PostCard = ({ post }: { post: BlogPost }) => (
    <Card className="bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{post.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{post.date}</p>
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
          {post.published && (  // ✅ Only show View button if published
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
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => handleDelete(post.id, post.title)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          Manage ({publishedPosts.length}) 
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
    {publishedPosts.length === 0 ? ( // ✅ CORRECT - only published
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No published posts yet!</p>
        </CardContent>
      </Card>
    ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedPosts.map(post => ( // ✅ CORRECT - only show published
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
                <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No drafts. All posts are published!</p>
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