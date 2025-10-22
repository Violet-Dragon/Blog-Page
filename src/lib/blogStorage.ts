
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "astronomy" | "astrophysics" | "heliophysics";
  tags: string[];
  image: string;
  author: string;
  date: string;
  readTime: string;
  published: boolean;
}

const STORAGE_KEY = 'cosmic_blog_posts';

export const saveBlogPost = (post: BlogPost): void => {
  const posts = getAllBlogPosts();
  const existingIndex = posts.findIndex(p => p.id === post.id);
  
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.push(post);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const getAllBlogPosts = (): BlogPost[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getPublishedBlogPosts = (): BlogPost[] => {
  return getAllBlogPosts().filter(post => post.published);
};

export const deleteBlogPost = (id: string): void => {
  const posts = getAllBlogPosts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const getBlogPost = (id: string): BlogPost | null => {
  const posts = getAllBlogPosts();
  return posts.find(post => post.id === id) || null;
};
