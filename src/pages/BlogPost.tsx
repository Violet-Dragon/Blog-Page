import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getBlogPost, type BlogPost as BlogPostType } from "@/lib/blogStorage";
import { markdownToHtml } from "@/lib/markdown";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);

  useEffect(() => {
    if (id) {
      const foundPost = getBlogPost(id);
      if (foundPost && foundPost.published) {
        setPost(foundPost);
      } else {
        // Post doesn't exist or is not published
        navigate('/');
      }
    }
  }, [id, navigate]);

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background stars */}
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
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>

        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="capitalize px-3 py-1 rounded-full bg-primary/20 text-primary">
                {post.category}
              </span>
              <span>{post.author}</span>
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          {post.image && post.image !== '/placeholder.svg' && (
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
          />
        </article>
      </div>
    </div>
  );
};

export default BlogPost;