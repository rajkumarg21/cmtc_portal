import api from './apiService';

const NEWS_API_URL = '/news';

/**
 * Fetch all published news for public view
 * GET /news/public
 */
export const getPublishedNewsArticles = async () => {
  const response = await api.get(`${NEWS_API_URL}/public`);
  return response.data;
};

/**
 * Fetch a single published article by id for public view
 * GET /news/public/:id
 */
export const getPublishedNewsArticleById = async (id) => {
  const url = `${NEWS_API_URL}/public/${id}`;
  console.log("Calling API:", url);   // 👈 log the API endpoint

  const response = await api.get(url);
  console.log("API Response:", response.data);  // 👈 log response data

  return response.data;
};


/**
 * Fetch all news articles for admin
 * GET /news/admin
 */
export const getAllNewsArticles = async () => {
  const response = await api.get(`${NEWS_API_URL}/admin`);
  return response.data;
};

/**
 * Fetch a single news item by id for admin
 * GET /news/admin/:id
 */
export const getNewsArticleById = async (id) => {
  const response = await api.get(`${NEWS_API_URL}/admin/${id}`);
  return response.data;
};

/**
 * Create news article (multipart/form-data)
 * POST /news/admin
 */
export const createNewsArticle = async (newsArticleData, imageFile) => {
  const formData = new FormData();
  formData.append('newsArticle', new Blob([JSON.stringify(newsArticleData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  const response = await api.post(`${NEWS_API_URL}/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Update news article (multipart/form-data)
 * PUT /news/admin/:id
 */
export const updateNewsArticle = async (id, newsArticleData, imageFile) => {
  const formData = new FormData();
  formData.append('newsArticle', new Blob([JSON.stringify(newsArticleData)], { type: 'application/json' }));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  const response = await api.put(`${NEWS_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete news article
 * DELETE /news/admin/:id
 */
export const deleteNewsArticle = async (id) => {
  const response = await api.delete(`${NEWS_API_URL}/admin/${id}`);
  return response.data;
};

// --- ADD THESE NEW EXPORTED FUNCTIONS ---

/**
 * Approve a news article (admin)
 * PUT /news/admin/approve/:id
 */
export const approveNewsArticle = async (id) => {
  try {
    const response = await api.put(`${NEWS_API_URL}/admin/approve/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error approving news article with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Reject a news article (admin)
 * PUT /news/admin/reject/:id
 */
export const rejectNewsArticle = async (id) => {
  try {
    const response = await api.put(`${NEWS_API_URL}/admin/reject/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting news article with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch latest published news for public view.
 * Tries server-side limit first (GET /news/public?limit=...), if server doesn't support it, fall back to fetching all and slicing.
 *
 * @param {number} limit Number of items to return (default 3)
 * @returns {Promise<Array>}
 */
export const getLatestPublishedNews = async (limit = 3) => {
  // try server-side limit param
  try {
    const resp = await api.get(`${NEWS_API_URL}/public?limit=${limit}`);
    // expect array
    if (Array.isArray(resp.data)) {
      return resp.data;
    }
    // if server returns an object with items property, handle it
    if (resp.data && Array.isArray(resp.data.items)) {
      return resp.data.items.slice(0, limit);
    }
    // otherwise fall through to fetch all
  } catch (err) {
    // not fatal; we'll try fallback below
    // console.warn('Server-side limit fetch failed, falling back to client-side slice', err);
  }

  // fallback: fetch all and slice client-side
  try {
    const all = await getPublishedNewsArticles();
    if (Array.isArray(all)) {
      return all.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching latest news (fallback):', error);
    return [];
  }
};
