import axios from 'axios';

// Use relative paths for Next.js API routes
const api = axios.create({
  baseURL: '/api',
});

export const getBlogs = () => api.get('/blogs');
export const getBlog = (id: string) => api.get(`/blogs/${id}`);
export const getBlogBySlug = (slug: string) => api.get(`/blogs/slug/${slug}`);
export const createBlog = (data: any) => api.post('/blogs', data);
export const updateBlog = (id: string, data: any) => api.put(`/blogs/${id}`, data);
export const deleteBlog = (id: string) => api.delete(`/blogs/${id}`);
export const swapBlogs = (id1: string, id2: string) => api.put(`/blogs/swap/${id1}/${id2}`);
export const login = (data: any) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');

export default api;
