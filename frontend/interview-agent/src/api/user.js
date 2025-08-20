import api from './client';

export const getMe = () => api.get('/auth/me');

export default { getMe };
