import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, Sparkles } from "lucide-react";
import { getBlogPost, type BlogPost as BlogPostType } from "@/lib/blogApi"; // ✅ Changed import
import { markdownToHtml } from "@/lib/markdown";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const foundPost = await getBlogPost(id); // ✅ Now async
        
        if (foundPost && foundPost.published) {
          setPost(foundPost);
        } else {
          // Post doesn't exist or is not published
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-xl text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  // Post not found (shouldn't reach here due to navigation, but safety check)
  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                           radial-gradient(2px 2px at 60% 70%, white, transparent),
                           radial-gradient(1px 1px at 50% 50%, white, transparent),
                           radial-gradient(1px 1px at 80% 10%, white, transparent),
                           radial-gradient(2px 2px at 90% 60%, white, transparent),
                           radial-gradient(1px 1px at 33% 80%, white, transparent),
                           radial-gradient(1px 1px at 15% 90%, white, transparent)`,
          backgroundSize: '200% 200%',
          animation: 'float-slow 20s ease-in-out infinite',
          opacity: 0.3
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 hover:bg-primary/10 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Button>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8 animate-fade-in-up">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              {post.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              {post.title}
            </h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border/50">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="border-primary/30 text-primary/80"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post.image && post.image !== '/placeholder.svg' && (
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-96 object-cover rounded-lg shadow-[0_0_40px_rgba(159,122,234,0.3)]"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <div className="mb-8 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-lg text-muted-foreground italic">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-invert prose-lg max-w-none animate-fade-in-up
              prose-headings:bg-clip-text prose-headings:text-transparent prose-headings:bg-gradient-to-r prose-headings:from-primary prose-headings:to-secondary
              prose-p:text-foreground/90
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-primary
              prose-code:text-secondary prose-code:bg-secondary/10 prose-code:px-1 prose-code:rounded
              prose-pre:bg-card/50 prose-pre:border prose-pre:border-border/50
              prose-img:rounded-lg prose-img:shadow-lg
              prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1"
            style={{ animationDelay: '0.3s' }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
          />

          {/* FAQs Section */}
          {post.faqs && post.faqs.length > 0 && (
            <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {post.faqs.map((faq, index) => (
                  <details 
                    key={faq.id || index} 
                    className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:border-primary/50 transition-all"
                  >
                    <summary className="font-semibold text-lg cursor-pointer list-none flex items-center justify-between">
                      <span className="group-hover:text-primary transition-colors">
                        {faq.question}
                      </span>
                      <Sparkles className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </summary>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* SEO Meta (hidden, but good for debugging) */}
          {post.metaTitle && (
            <div className="hidden">
              <meta name="title" content={post.metaTitle} />
              <meta name="description" content={post.metaDescription} />
              <meta name="keywords" content={post.metaKeywords} />
            </div>
          )}
        </article>

        {/* Back to top button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="border-primary/50 hover:bg-primary/10"
          >
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;