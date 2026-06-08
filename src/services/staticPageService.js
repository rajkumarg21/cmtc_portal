// src/services/staticPageService.js

import api from './apiService';
import { CONTENT_STATUS } from '../utils/constants'; // Assuming this constant is defined

const STATIC_PAGES_API_URL = '/static-pages'; // Changed from STATIC_PAGE_API_URL to match your old file

// --- Public API Functions (for frontend display) ---

export const getStaticPageBySlug = async (slug) => {
  try {
    const response = await api.get(`${STATIC_PAGES_API_URL}/public/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching static page by slug "${slug}":`, error);
    throw error;
  }
};

/**
 * Fetches static pages configured to appear in the navigation bar and builds a hierarchical structure.
 *
 * This function is crucial for building the nested menu on the frontend.
 * It fetches all relevant pages, then uses a recursive helper to form a tree.
 * Only top-level pages (parentId === null) are returned at the root of the array.
 *
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of static page objects,
 * where each object may contain a 'children' array for sub-menu items.
 * @throws {Error} If the API call fails.
 */
export const getPagesForNavbar = async () => {
  try {
    // 1. Fetch all published and navbar-visible pages
    // Assuming backend returns a flat list, we build the tree on the frontend.
    const response = await api.get(`${STATIC_PAGES_API_URL}/public/all`); // Get all published pages
    const allNavbarPages = (Array.isArray(response.data) ? response.data : [])
                           .filter(p => p.showInNavbar && p.status === CONTENT_STATUS.PUBLISHED);

    // 2. Define the recursive function to build the tree
    const buildPageTree = (pages, parentId = null) => {
      // Filter for direct children of the current parentId
      const directChildren = pages
        .filter(page => page.parentId === parentId)
        .sort((a, b) => (a.orderInNavbar || 0) - (b.orderInNavbar || 0)); // Sort by order

      // Recursively build children for each direct child
      return directChildren.map(page => ({
        ...page,
        children: buildPageTree(pages, page.id), // Recurse with current page's ID as parentId
      }));
    };

    // 3. Start building the tree from the top-level (parentId: null)
    // This ensures only true top-level items are at the root of the returned array.
    return buildPageTree(allNavbarPages, null);

  } catch (error) {
    console.error('Error fetching pages for navbar:', error);
    throw error;
  }
};

export const getPublishedStaticPages = async () => {
  try {
    const response = await api.get(`${STATIC_PAGES_API_URL}/public/all`);
    // Ensure the response data is an array. If not, return an empty array.
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('API returned non-array data for published static pages:', response.data);
      return []; // Return empty array if data is not an array
    }
  } catch (error) {
    console.error('Error fetching all published static pages:', error);
    throw error;
  }
};


// --- CMS/Admin API Functions (for management) ---

export const getAllStaticPages = async () => {
  try {
    const response = await api.get(`${STATIC_PAGES_API_URL}`); // Changed endpoint
    // Ensure the response data is an array. If not, return an empty array.
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('API returned non-array data for all static pages (admin):', response.data);
      return []; // Return empty array if data is not an array
    }
  } catch (error) {
    console.error('Error fetching all static pages (admin):', error);
    throw error; // Re-throw the error so the component's catch block can handle it for toast/error state
  }
};

export const getStaticPageById = async (id) => {
  try {
    const response = await api.get(`${STATIC_PAGES_API_URL}/${id}`); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error(`Error fetching static page by ID "${id}":`, error);
    throw error;
  }
};

export const createStaticPage = async (pageData) => {
  try {
    const response = await api.post(`${STATIC_PAGES_API_URL}`, pageData); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error('Error creating static page:', error);
    throw error;
  }
};

export const updateStaticPage = async (id, pageData) => {
  try {
    const response = await api.put(`${STATIC_PAGES_API_URL}/${id}`, pageData); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error(`Error updating static page with ID "${id}":`, error);
    throw error;
  }
};

export const deleteStaticPage = async (id) => {
  try {
    const response = await api.delete(`${STATIC_PAGES_API_URL}/${id}`); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error(`Error deleting static page with ID "${id}":`, error);
    throw error;
  }
};

export const approveStaticPage = async (id) => {
  try {
    const response = await api.put(`${STATIC_PAGES_API_URL}/${id}/approve`); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error(`Error approving static page with ID "${id}":`, error);
    throw error;
  }
};

export const rejectStaticPage = async (id) => {
  try {
    const response = await api.put(`${STATIC_PAGES_API_URL}/${id}/reject`); // Changed endpoint
    return response.data;
  } catch (error) {
    console.error(`Error rejecting static page with ID "${id}":`, error);
    throw error;
  }
};
