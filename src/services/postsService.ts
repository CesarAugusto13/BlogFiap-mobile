import api from '../app/src/api/apiClient';
export const getPosts = (page=1, q='') => api.get('/posts', { params: { page, q }});
export const createPost = (payload) => api.post('/posts', payload);
