import { useState, useEffect, useRef } from "react";
import { AdminDashboard } from "@/components/ui/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  saveBlogPost, 
  getAllBlogPosts, 
  deleteBlogPost, 
  type BlogPost,
  checkAuth,
  logout
} from "@/lib/blogApi"; // ✅ Changed import
import { useNavigate } from "react-router-dom";
import { 
  Eye, Save, Send, Sparkles, ArrowLeft, Bold, Italic, List, 
  Link2, Image as ImageIcon, Heading1, Heading2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Underline, Type, Palette, Globe, LogOut
} from "lucide-react";
import { markdownToHtml, supportedLanguages } from "@/lib/markdown";

const Admin = () => {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Add loading
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<"astronomy" | "astrophysics" | "heliophysics">("astronomy");
  const [tags, setTags] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [readTime, setReadTime] = useState("5 min read");
  const [language, setLanguage] = useState("en");
  const [editingPostId, setEditingPostId] = useState<string | null>(null); // ✅ Track editing
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ✅ Check authentication on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        toast({
          title: "Not Authenticated",
          description: "Please login to access admin panel",
          variant: "destructive",
        });
        navigate('/admin/login'); // You'll need to create this page
      }
    };
    checkAuthentication();
  }, [navigate, toast]);

  // ✅ Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const posts = await getAllBlogPosts();
        setAllPosts(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [toast]);

  // Calculate read time based on word count
  useEffect(() => {
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    setReadTime(`${minutes} min read`);
  }, [content]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (content && !excerpt) {
      const firstParagraph = content.split('\n\n')[0];
      setExcerpt(firstParagraph.slice(0, 150) + '...');
    }
  }, [content, excerpt]);

  // ✅ Refresh posts after save/delete
  const refreshPosts = async () => {
    try {
      const posts = await getAllBlogPosts();
      setAllPosts(posts);
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertImage = () => {
    const imageUrl = prompt("Enter image URL:");
    if (imageUrl) {
      const imageMarkdown = `\n\n![Image description](${imageUrl})\n\n`;
      const textarea = contentRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const newText = content.substring(0, start) + imageMarkdown + content.substring(start);
      setContent(newText);
    }
  };

  const insertWithDialog = (type: 'color' | 'bg' | 'size' | 'font') => {
    const prompts = {
      color: 'Enter color (e.g., red, #ff0000):',
      bg: 'Enter background color (e.g., yellow, #ffff00):',
      size: 'Enter font size (e.g., 24):',
      font: 'Enter font family (e.g., serif, Georgia):'
    };
    
    const value = prompt(prompts[type]);
    if (!value) return;
    
    const formatMap = {
      color: `{color:${value}}`,
      bg: `{bg:${value}}`,
      size: `{size:${value}}`,
      font: `{font:${value}}`
    };
    
    insertFormatting(formatMap[type], `{/${type}}`);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      const textarea = contentRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end) || "link text";
      const linkMarkdown = `[${selectedText}](${url})`;
      const newText = content.substring(0, start) + linkMarkdown + content.substring(end);
      
      setContent(newText);
    }
  };

  // ✅ Update save draft to use API
  const handleSaveDraft = async () => {
    if (!title || !content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    const post: BlogPost = {
      id: editingPostId || `post-${Date.now()}`,
      title,
      excerpt: excerpt || content.slice(0, 150) + '...',
      content,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      image: featuredImage || '/placeholder.svg',
      author,
      date: new Date().toISOString(),
      readTime,
      published: false,
    };

    try {
      await saveBlogPost(post);
      await refreshPosts();
      
      toast({
        title: "Draft Saved",
        description: "Your blog post has been saved as a draft",
      });
      
      // Clear form after save
      clearForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    }
  };

  // ✅ Update publish to use API
  const handlePublish = async () => {
    if (!title || !content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    const post: BlogPost = {
      id: editingPostId || `post-${Date.now()}`,
      title,
      excerpt: excerpt || content.slice(0, 150) + '...',
      content,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      image: featuredImage || '/placeholder.svg',
      author,
      date: new Date().toISOString(),
      readTime,
      published: true,
    };

    try {
      await saveBlogPost(post);
      await refreshPosts();
      
      toast({
        title: "Published",
        description: "Your blog post has been published successfully!",
      });
      
      // Clear form after publish
      clearForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive",
      });
    }
  };

  // ✅ Clear form helper
  const clearForm = () => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setTags("");
    setFeaturedImage("");
    setEditingPostId(null);
  };

  // ✅ Handle edit post
  const handleEditPost = (post: BlogPost) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt);
    setCategory(post.category);
    setTags(post.tags.join(', '));
    setFeaturedImage(post.image);
    setAuthor(post.author);
    
    toast({
      title: "Loaded",
      description: `Editing: ${post.title}`,
    });
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-xl text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background stars */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Content Editor
            </h1>
            <p className="text-muted-foreground mt-2">
              {editingPostId ? 'Editing post' : 'Create amazing space content'}
            </p>
          </div>
          <div className="flex gap-2">
            {editingPostId && (
              <Button variant="outline" onClick={clearForm}>
                New Post
              </Button>
            )}
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              <Send className="mr-2 h-4 w-4" />
              {editingPostId ? 'Update' : 'Publish'}
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <AdminDashboard
          posts={allPosts}
          onEditPost={handleEditPost}
          onDeletePost={async (id) => {
            try {
              await deleteBlogPost(id);
              await refreshPosts();
              toast({
                title: "Deleted",
                description: "Post deleted successfully",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to delete post",
                variant: "destructive",
              });
            }
          }}
          editorContent={
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content Card */}
                <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter post title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-xl font-bold"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">Content</Label>
                      
                      {/* Formatting Toolbar */}
                      <div className="space-y-2 mb-2">
                        <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-md border border-border">
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("# ", "")} title="Heading 1">
                            <Heading1 className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("## ", "")} title="Heading 2">
                            <Heading2 className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-8 bg-border mx-1" />
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("**", "**")} title="Bold">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("*", "*")} title="Italic">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("{u}", "{/u}")} title="Underline">
                            <Underline className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-8 bg-border mx-1" />
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("\n- ", "")} title="List">
                            <List className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={insertLink} title="Link">
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={insertImage} title="Image">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting(":left: ", "")} title="Align Left">
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting(":center: ", "")} title="Center">
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting(":right: ", "")} title="Align Right">
                            <AlignRight className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting(":justify: ", "")} title="Justify">
                            <AlignJustify className="h-4 w-4" />
                          </Button>
                          <div className="w-px h-8 bg-border mx-1" />
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertWithDialog('color')} title="Text Color">
                            <Palette className="h-4 w-4" />
                            <span className="ml-1 text-xs">Color</span>
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertWithDialog('size')} title="Font Size">
                            <Type className="h-4 w-4" />
                            <span className="ml-1 text-xs">Size</span>
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertWithDialog('font')} title="Font">
                            <Type className="h-4 w-4" />
                            <span className="ml-1 text-xs">Font</span>
                          </Button>
                        </div>
                      </div>
                      
                      <Textarea
                        ref={contentRef}
                        id="content"
                        placeholder="Write your content using Markdown syntax..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[400px] font-mono"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {content.trim().split(/\s+/).length} words • {readTime} • Supports Markdown
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                      <Textarea
                        id="excerpt"
                        placeholder="Brief description of your post..."
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="h-24"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata Sidebar */}
                <Card className="bg-card/50 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle>Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="language">
                        <Globe className="inline h-4 w-4 mr-2" />
                        Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedLanguages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="astronomy">Astronomy</SelectItem>
                          <SelectItem value="astrophysics">Astrophysics</SelectItem>
                          <SelectItem value="heliophysics">Heliophysics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        placeholder="space, cosmos, stars"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
                    </div>

                    <div>
                      <Label htmlFor="featuredImage">Featured Image URL</Label>
                      <Input
                        id="featuredImage"
                        placeholder="https://..."
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                      />
                    </div>

                    {featuredImage && (
                      <div className="rounded-lg overflow-hidden border border-border">
                        <img src={featuredImage} alt="Preview" className="w-full h-32 object-cover" />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        placeholder="Author name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button variant="outline" className="w-full" disabled>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Enhance (Coming Soon)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          }
          previewContent={
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-4">{title || "Untitled Post"}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="capitalize px-3 py-1 rounded-full bg-primary/20 text-primary">
                    {category}
                  </span>
                  <span>{author}</span>
                  <span>{readTime}</span>
                </div>
                {featuredImage && (
                  <img src={featuredImage} alt={title} className="w-full h-64 object-cover rounded-lg mb-6" />
                )}
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(content || "No content yet...") }}
                />
              </CardContent>
            </Card>
          }
        />
      </div>
    </div>
  );
};

export default Admin;       