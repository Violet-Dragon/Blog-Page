// const API_URL = 'http://localhost/blog-api/api';

// export interface BlogPost {
//   id: string;
//   title: string;
//   excerpt: string;
//   content: string;
//   category: "astronomy" | "astrophysics" | "heliophysics";
//   tags: string[];
//   image: string;
//   author: string;
//   date: string;
//   readTime: string;
//   published: boolean;
//   metaTitle?: string;
//   metaDescription?: string;
//   metaKeywords?: string;
//   faqs?: FAQ[];
// }

// export interface FAQ {
//   id?: number;
//   question: string;
//   answer: string;
//   order_num?: number;
// }

// // ========== BLOG POST FUNCTIONS ==========


// export const saveBlogPost = async (post: BlogPost): Promise<void> => {
//   try {
//     // Check if post exists in database (not just if ID exists)
//     let method = 'POST';
    
//     // Only use PUT if the post ID looks like a database ID (numeric)
//     if (post.id && !post.id.startsWith('post-')) {
//       method = 'PUT';
//     } else if (post.id && post.id.startsWith('post-')) {
//       // Remove the temporary ID so database generates a new one
//       delete post.id;
//     }
    
//     const response = await fetch(`${API_URL}/posts.php`, {
//       method,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify({post}),
//     });
    
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || 'Failed to save post');
//     }
//   } catch (error) {
//     console.error('Error saving post:', error);
//     throw error;
//   }
// };


// export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
//   try {
//     const response = await fetch(`${API_URL}/posts.php?admin=true`, {
//       credentials: 'include'
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch posts');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     return [];
//   }
// };

// export const getPublishedBlogPosts = async (): Promise<BlogPost[]> => {
//   try {
//     const response = await fetch(`${API_URL}/posts.php`,{
//     credentials: 'include'
//     });
//     if (!response.ok) {
//       throw new Error('Failed to fetch posts');
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     return [];
//   }
// };

// export const getBlogPost = async (id: string): Promise<BlogPost | null> => {
//   try {
//     const response = await fetch(`${API_URL}/posts.php?id=${id}`,{
//     credentials: 'include'
//     });
//     if (!response.ok) {
//       return null;
//     }
    
//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching post:', error);
//     return null;
//   }
// };



// export const deleteBlogPost = async (id: string): Promise<void> => {
//   try {
//     const response = await fetch(`${API_URL}/posts.php`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify({ id }),
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to delete post');
//     }
//   } catch (error) {
//     console.error('Error deleting post:', error);
//     throw error;
//   }
// };

// // ========== AUTHENTICATION FUNCTIONS ==========

// export const login = async (username: string, password: string): Promise<boolean> => {
//   try {
//     const response = await fetch(`${API_URL}/auth.php`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//       body: JSON.stringify({ username, password }),
//     });
    
//     return response.ok;
//   } catch (error) {
//     console.error('Login error:', error);
//     return false;
//   }
// };

// export const checkAuth = async (): Promise<boolean> => {
//   try {
//     const response = await fetch(`${API_URL}/auth.php`, {
//       credentials: 'include'
//     });
//     return response.ok;
//   } catch (error) {
//     return false;
//   }
// };

// export const logout = async (): Promise<void> => {
//   try {
//     await fetch(`${API_URL}/auth.php`, {
//       method: 'DELETE',
//       credentials: 'include'
//     });
//   } catch (error) {
//     console.error('Logout error:', error);
//   }
// };

const API_URL = 'http://localhost/blog-api/api';

export interface BlogPost {
  id?: string | number;
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

export const saveBlogPost = async (post: BlogPost): Promise<BlogPost> => {
  try {
    // Determine if this is an update or create
    const isUpdate = post.id && !String(post.id).startsWith('post-');
    const method = isUpdate ? 'PUT' : 'POST';
    
    // Create a clean post object
    const postData = { ...post };
    if (!isUpdate && postData.id && String(postData.id).startsWith('post-')) {
      delete postData.id; // Let database generate ID
    }
    
    console.log('Saving post:', { method, postData }); // Debug log
    
    const response = await fetch(`${API_URL}/posts.php`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ post: postData }),
    });
    
    const responseData = await response.json();
    console.log('Response:', responseData); // Debug log
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to save post');
    }
    
    // Return the post with the new ID if it was created
    if (!isUpdate && responseData.id) {
      return { ...postData, id: String(responseData.id) } as BlogPost;
    }
    
    return postData as BlogPost;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${API_URL}/posts.php?admin=true`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const posts = await response.json();
    // Convert id to string for consistency
    return posts.map((post: any) => ({ ...post, id: String(post.id) }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getPublishedBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await fetch(`${API_URL}/posts.php`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    const posts = await response.json();
    return posts.map((post: any) => ({ ...post, id: String(post.id) }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const getBlogPost = async (id: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(`${API_URL}/posts.php?id=${id}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const post = await response.json();
    return { ...post, id: String(post.id) };
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
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