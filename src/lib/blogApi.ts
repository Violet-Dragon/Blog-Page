const API_URL = 'http://localhost/blog-api/api';

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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  faqs?: FAQ[];
}

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  order_num?: number;
}

// ========== BLOG POST FUNCTIONS ==========

export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${API_URL}/posts.php?admin=true`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getPublishedBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${API_URL}/posts.php`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getBlogPost = async (id: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(`${API_URL}/posts.php?id=${id}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
};

export const saveBlogPost = async (post: BlogPost): Promise<void> => {
  try {
    // Check if updating existing post or creating new
    const isUpdate = post.id && post.id.length > 0;
    const method = isUpdate ? 'PUT' : 'POST';
    
    // Generate ID if creating new post
    if (!isUpdate) {
      post.id = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const response = await fetch(`${API_URL}/posts.php`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(post),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save post');
    }
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/posts.php`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// ========== AUTHENTICATION FUNCTIONS ==========

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth.php`, {
      credentials: 'include'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/auth.php`, {
      method: 'DELETE',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
};