import { useState, useEffect } from "react";
import { Search, Sparkles, Calendar, Clock, ArrowRight, Menu, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublishedBlogPosts, type BlogPost as StoredBlogPost } from "@/lib/blogStorage";
import { useNavigate } from "react-router-dom";
import heroNebula from "@/assets/hero-nebula.jpg";
import galaxy1 from "@/assets/galaxy-1.jpg";
import blackHole from "@/assets/black-hole.jpg";
import solarFlare from "@/assets/solar-flare.jpg";
import nebula1 from "@/assets/nebula-1.jpg";
import telescope from "@/assets/telescope.jpg";
import magnetosphere from "@/assets/magnetosphere.jpg";
import starCluster from "@/assets/star-cluster.jpg";
import darkMatter from "@/assets/dark-matter.jpg";

type Category = "all" | "astronomy" | "astrophysics" | "heliophysics";

interface BlogPost {
  id: number | string;
  title: string;
  excerpt: string;
  category: Exclude<Category, "all">;
  image: string;
  date: string;
  readTime: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Magnificent Spiral Arms of Distant Galaxies",
    excerpt: "Exploring the breathtaking structures of spiral galaxies and what their formations tell us about cosmic evolution and dark matter distribution.",
    category: "astronomy",
    image: galaxy1,
    date: "Oct 8, 2025",
    readTime: "8 min"
  },
  {
    id: 2,
    title: "Black Holes: Where Physics Breaks Down",
    excerpt: "Journey into the heart of the universe's most extreme objects, where gravity becomes so intense that even light cannot escape.",
    category: "astrophysics",
    image: blackHole,
    date: "Oct 5, 2025",
    readTime: "12 min"
  },
  {
    id: 3,
    title: "Solar Flares and Space Weather Prediction",
    excerpt: "Understanding how massive eruptions on the Sun's surface can impact Earth's technology and what we're doing to predict them.",
    category: "heliophysics",
    image: solarFlare,
    date: "Oct 3, 2025",
    readTime: "6 min"
  },
  {
    id: 4,
    title: "Nebulae: The Stellar Nurseries of Our Galaxy",
    excerpt: "Discover the cosmic clouds where new stars are born, featuring stunning imagery from the latest telescope observations.",
    category: "astronomy",
    image: nebula1,
    date: "Sep 29, 2025",
    readTime: "9 min"
  },
  {
    id: 5,
    title: "Radio Astronomy: Listening to the Universe",
    excerpt: "How massive radio telescope arrays are revolutionizing our understanding of distant galaxies, pulsars, and cosmic phenomena.",
    category: "astronomy",
    image: telescope,
    date: "Sep 25, 2025",
    readTime: "10 min"
  },
  {
    id: 6,
    title: "Earth's Magnetosphere: Our Cosmic Shield",
    excerpt: "Examining how Earth's magnetic field protects us from the solar wind and creates the beautiful aurora displays we see at the poles.",
    category: "heliophysics",
    image: magnetosphere,
    date: "Sep 20, 2025",
    readTime: "7 min"
  },
  {
    id: 7,
    title: "Stellar Evolution: The Life Cycle of Stars",
    excerpt: "From birth in molecular clouds to death as white dwarfs or spectacular supernovae, explore the amazing journey of stellar objects.",
    category: "astrophysics",
    image: starCluster,
    date: "Sep 15, 2025",
    readTime: "11 min"
  },
  {
    id: 8,
    title: "Dark Matter: The Universe's Hidden Framework",
    excerpt: "Investigating the invisible scaffolding that holds galaxies together and makes up 85% of all matter in the cosmos.",
    category: "astrophysics",
    image: darkMatter,
    date: "Sep 10, 2025",
    readTime: "13 min"
  },
  {
    id: 9,
    title: "Solar Wind Dynamics and Interplanetary Space",
    excerpt: "Understanding the continuous stream of charged particles flowing from the Sun and how it shapes our solar system.",
    category: "heliophysics",
    image: solarFlare,
    date: "Sep 5, 2025",
    readTime: "8 min"
  }
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(blogPosts);
  const navigate = useNavigate();

  // Load posts from localStorage on mount
  useEffect(() => {
    const storedPosts = getPublishedBlogPosts();
    if (storedPosts.length > 0) {
      setAllPosts(storedPosts);
    }
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let filtered = allPosts;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [selectedCategory, searchQuery]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated star field background */}
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

      {/* Navigation */}
      <nav className="relative z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 animate-fade-in-up">
              <Sparkles className="w-8 h-8 text-primary animate-glow-pulse" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                SpaceProbe
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("blog")}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Articles
              </button>
              <button
                onClick={() => scrollToSection("footer")}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Contact
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="text-muted-foreground hover:text-primary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Admin
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(159,122,234,0.3)]">
                Subscribe
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in-up">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-foreground/80 hover:text-primary transition-colors text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("blog")}
                className="text-foreground/80 hover:text-primary transition-colors text-left"
              >
                Articles
              </button>
              <button
                onClick={() => scrollToSection("footer")}
                className="text-foreground/80 hover:text-primary transition-colors text-left"
              >
                Contact
              </button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 w-full">
                Subscribe
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative z-10 pt-20 pb-32 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <Badge className="bg-primary/20 text-primary border-primary/30 animate-scale-in">
                Exploring the Cosmos
              </Badge>
              <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                Journey Through
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-shimmer bg-[length:200%_auto]">
                  Deep Space
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover the latest insights in astronomy, astrophysics, and heliophysics. 
                From distant galaxies to our own Sun, explore the wonders of the universe.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("blog")}
                  className="bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(159,122,234,0.4)] group"
                >
                  Explore Articles
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                >
                  Latest Research
                </Button>
              </div>
            </div>

            <div className={`relative ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(159,122,234,0.3)] animate-float">
                <img
                  src={heroNebula}
                  alt="Deep space nebula with cosmic clouds"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          {/* Search and Filters */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {(["all", "astronomy", "astrophysics", "heliophysics"] as Category[]).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`capitalize transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-primary shadow-[0_0_20px_rgba(159,122,234,0.4)] scale-105"
                      : "border-border/50 hover:border-primary/50 hover:bg-primary/10"
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Card
                key={post.id}
                onClick={() => navigate(`/blog/${post.id}`)} 
                className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(159,122,234,0.3)] animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
                  <Badge className={`absolute top-4 right-4 ${
                    post.category === "astronomy"
                      ? "bg-primary/80 text-primary-foreground"
                      : post.category === "astrophysics"
                      ? "bg-secondary/80 text-secondary-foreground"
                      : "bg-accent/80 text-accent-foreground"
                  }`}>
                    {post.category}
                  </Badge>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 animate-fade-in-up">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-xl text-muted-foreground">
                No articles found. Try a different search or category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm py-12 px-6 mt-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">SpaceProbe</h3>
              </div>
              <p className="text-muted-foreground">
                Your gateway to the wonders of space exploration and cosmic discoveries.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="space-y-2">
                <button onClick={() => { setSelectedCategory("astronomy"); scrollToSection("blog"); }} className="block text-muted-foreground hover:text-primary transition-colors">
                  Astronomy
                </button>
                <button onClick={() => { setSelectedCategory("astrophysics"); scrollToSection("blog"); }} className="block text-muted-foreground hover:text-primary transition-colors">
                  Astrophysics
                </button>
                <button onClick={() => { setSelectedCategory("heliophysics"); scrollToSection("blog"); }} className="block text-muted-foreground hover:text-primary transition-colors">
                  Heliophysics
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Newsletter</h4>
              <p className="text-muted-foreground mb-4">
                Stay tuned! Get the latest cosmic discoveries delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <Input placeholder="Your email" className="bg-background/50" /> 
                <Button className="bg-primary hover:bg-primary/90">
                  Subscribe
                 </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 SpaceProbe. Exploring the universe, one discovery at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
