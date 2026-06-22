import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'https://dirbook-backend.onrender.com';

function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (!entries.length) return '';
  return '?' + entries
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
}

async function getToken() {
  return await AsyncStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }));
    const detail = Array.isArray(err.detail)
      ? err.detail.map((e) => e.msg ?? JSON.stringify(e)).join(', ')
      : err.detail;
    const error = new Error(detail || 'Error del servidor');
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const register = (name, email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = () => request('/auth/me');

// ─── LOCALS ──────────────────────────────────────────────────────────────────
export const getLocals = (params = {}) =>
  request(`/locals${buildQuery(params)}`);

export const getLocal = (id) => request(`/locals/${id}`);

export const getMyLocals = () => request('/locals/mine');

export const createLocal = (data) =>
  request('/locals', { method: 'POST', body: JSON.stringify(data) });

export const updateLocal = (id, data) =>
  request(`/locals/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteLocal = (id) =>
  request(`/locals/${id}`, { method: 'DELETE' });

// ─── PROFESSIONALS ───────────────────────────────────────────────────────────
export const getProfessionals = (params = {}) =>
  request(`/professionals${buildQuery(params)}`);

export const getProfessional = (id) => request(`/professionals/${id}`);

export const getMyProfessionals = () => request('/professionals/mine');

export const createProfessional = (data) =>
  request('/professionals', { method: 'POST', body: JSON.stringify(data) });

export const updateProfessional = (id, data) =>
  request(`/professionals/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProfessional = (id) =>
  request(`/professionals/${id}`, { method: 'DELETE' });

// ─── POSTS ───────────────────────────────────────────────────────────────────
export const getPosts = (params = {}) =>
  request(`/posts/feed${buildQuery(params)}`);

export const getLocalPosts = (localId) => request(`/posts/local/${localId}`);

export const getProfessionalPosts = (profId) => request(`/posts/professional/${profId}`);

export const createPost = (data) =>
  request('/posts', { method: 'POST', body: JSON.stringify(data) });

export const updatePost = (postId, data) =>
  request(`/posts/${postId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deletePost = (postId) =>
  request(`/posts/${postId}`, { method: 'DELETE' });

// ─── SOCIAL (likes y comentarios) ────────────────────────────────────────────
export const likePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'POST' });

export const unlikePost = (postId) =>
  request(`/posts/${postId}/like`, { method: 'DELETE' });

export const getComments = (postId) => request(`/posts/${postId}/comments`);

export const addComment = (postId, content) =>
  request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

export const deleteComment = (commentId) =>
  request(`/posts/comments/${commentId}`, { method: 'DELETE' });

// ─── FOLLOWS ─────────────────────────────────────────────────────────────────
export const followLocal = (localId) =>
  request('/follows', { method: 'POST', body: JSON.stringify({ local_id: localId }) });

export const unfollowLocal = (localId) =>
  request(`/follows/${localId}`, { method: 'DELETE' });

export const getMyFollows = () => request('/follows/mine');

// ─── RATINGS ─────────────────────────────────────────────────────────────────
export const rateLocal = (localId, score, comment = '') =>
  request(`/ratings/${localId}`, {
    method: 'POST',
    body: JSON.stringify({ score, comment }),
  });

export const getLocalRatings = (localId) => request(`/ratings/${localId}/reviews`);

export const rateProfessional = (profId, score, comment = '') =>
  request(`/ratings/professional/${profId}`, {
    method: 'POST',
    body: JSON.stringify({ score, comment }),
  });

export const getProfessionalRatings = (profId) =>
  request(`/ratings/professional/${profId}/reviews`);

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const getEvents = (params = {}) =>
  request(`/posts/events${buildQuery(params)}`);

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export const getNotifications = () => request('/notifications');

export const markNotificationsRead = () =>
  request('/notifications/read', { method: 'PUT' });

// ─── UPLOAD ──────────────────────────────────────────────────────────────────
export const uploadImage = async (uri) => {
  const formData = new FormData();
  const filename = uri.split('/').pop();
  const ext = filename.split('.').pop();
  formData.append('file', { uri, name: filename, type: `image/${ext}` });
  return request('/upload', { method: 'POST', body: formData });
};
