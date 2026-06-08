import api from './apiService';

const ADS_API_URL = '/ads';

// ------------------- Public Endpoints -------------------

/**
 * Fetches all approved + active ads for public display.
 */
export const getPublicAds = async () => {
    try {
        const response = await api.get(`${ADS_API_URL}/public`);
        return response.data;
    } catch (error) {
        console.error('Error fetching public ads:', error);
        throw error;
    }
};

/**
 * Fetches a specific ad by ID (public view).
 * @param {string} id - The ID of the ad to fetch.
 */
export const getPublicAdById = async (id) => {
    try {
        const response = await api.get(`${ADS_API_URL}/public/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching public ad with ID ${id}:`, error);
        throw error;
    }
};

// ------------------- Admin Endpoints -------------------

/**
 * Fetches all ads for admin (including drafts/inactive).
 */
export const getAdminAllAds = async () => {
    try {
        const response = await api.get(`${ADS_API_URL}/admin`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all admin ads:', error);
        throw error;
    }
};
// Admin - Create ad (multipart)
export const createAd = async (adData, imageFile) => {
    const formData = new FormData();
    formData.append("ad", new Blob([JSON.stringify(adData)], { type: "application/json" }));
    if (imageFile) {
        formData.append("image", imageFile);
    }
    const response = await api.post(`${ADS_API_URL}/admin`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Admin - Update ad (multipart)
export const updateAd = async (id, adData, imageFile) => {
    const formData = new FormData();
    formData.append("ad", new Blob([JSON.stringify(adData)], { type: "application/json" }));
    if (imageFile) {
        formData.append("image", imageFile);
    }
    const response = await api.put(`${ADS_API_URL}/admin/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};


/**
 * Deletes an ad by ID.
 * @param {string} id - The ID of the ad to delete.
 */
export const deleteAd = async (id) => {
    try {
        const response = await api.delete(`${ADS_API_URL}/admin/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting ad with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Approves an ad by ID.
 * @param {string} id - The ID of the ad to approve.
 */
export const approveAd = async (id) => {
    try {
        const response = await api.put(`${ADS_API_URL}/admin/${id}/approve`);
        return response.data;
    } catch (error) {
        console.error(`Error approving ad with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Rejects an ad by ID.
 * @param {string} id - The ID of the ad to reject.
 */
export const rejectAd = async (id) => {
    try {
        const response = await api.put(`${ADS_API_URL}/admin/${id}/reject`);
        return response.data;
    } catch (error) {
        console.error(`Error rejecting ad with ID ${id}:`, error);
        throw error;
    }
};
