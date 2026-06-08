import api from './apiService';
import { getAuthToken } from "../context/AuthContext";

/**
 * ==========================================================
 * PUBLIC APIs
 * ==========================================================
 */
const PUBLIC_API = `/public`;


/**
 * District dropdown
 */
export const getAllDistricts = () => {
  return api.get(`${PUBLIC_API}/districts`);
};

/**
 * Block dropdown based on district
 */
export const getBlocksByDistrict = (districtId) => {
  // Validate districtId before making the API call
  if (!districtId || districtId === "null" || districtId === "undefined" || districtId === null || districtId === undefined) {
    // Return a rejected promise instead of making the invalid API call
    return Promise.reject(new Error(`Invalid district ID: ${districtId}`));
  }

  // Ensure districtId is a string/number, not an object
  const id = String(districtId).trim();
  return api.get(`${PUBLIC_API}/blocks/${id}`);
};

/**
 * Centers by district
 */
export const getCentersByDistrict = (districtId) => {
  // ✅ Add validation here too
  if (!districtId || districtId === "null" || districtId === "undefined") {
    console.error("❌ [API] Invalid districtId for centers:", districtId);
    return Promise.reject(new Error(`Invalid district ID: ${districtId}`));
  }
  const id = String(districtId).trim();
  return api.get(`${PUBLIC_API}/centers/district/${id}`);
};

/**
 * Centers by block
 */
export const getCentersByBlock = (blockId) => {
  // Add validation for blockId too
  if (!blockId || blockId === "null" || blockId === "undefined") {
    return Promise.reject(new Error(`Invalid block ID: ${blockId}`));
  }
  const id = String(blockId).trim();
  return api.get(`${PUBLIC_API}/centers/block/${id}`);
};

/**
 * District + Blocks in single API
 */
export const getDistrictsWithBlocks = () => {
  return api.get(`${PUBLIC_API}/district-with-blocks`);
};


/**
 * Center full details page
 */
export const getCenterDetails = (centerId) => {
  // Add validation for centerId
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }

  const id = String(centerId).trim();
  return api.get(`${PUBLIC_API}/centers/${id}`);
};

/**
 * Get center amenities
 */
export const getCenterAmenities = async (centerId) => {
  try {
    // Validation
    if (!centerId || centerId === "null" || centerId === "undefined") {
      return [];
    }

    const id = String(centerId).trim();
    const url = `${PUBLIC_API}/newmaster/amenities/${id}`;
    const response = await api.get(url);

    // Case 1: response.data is already an array
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Case 2: response.data.data is an array
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // Case 3: response.data is a single object
    if (response.data && typeof response.data === "object") {
      return [response.data];
    }

    return [];

  } catch (error) {
    return [];
  }
};


/**
 * ==========================================================
 * BOOKING APIs (OLD + NEW)
 * ==========================================================
 */

/**
 * OLD: Get training calendar dates
 */
export const getTrainingCalendar = (centerId) => {
  // ✅ Add validation
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }

  const id = String(centerId).trim();
  return api.get(`${PUBLIC_API}/booking/calendar/${id}`);
};

/**
 * OLD: Get training time slots
 */
export const getTrainingSlots = (calendarId) => {
  // ✅ Add validation
  if (!calendarId || calendarId === "null" || calendarId === "undefined") {
    return Promise.reject(new Error(`Invalid calendar ID: ${calendarId}`));
  }

  const id = String(calendarId).trim();
  return api.get(`${PUBLIC_API}/booking/time-slots/${id}`);
};

/**
 * NEW: Monthly calendar status
 * (AVAILABLE / BOOKED / RESERVED / CLOSED)
 */
export const getMonthlyCalendar = (centerId, month) => {
  // Add validation
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }
  const id = String(centerId).trim();
  return api.get(`${PUBLIC_API}/booking/calendar-status`, {
    params: { centerId: id, month },
  });
};

/**
 *  Confirm booking (slot OR full-day)
 */
 export const confirmBooking = (payload, letterFile) => {
  const token = getAuthToken();

 
  // ✅ MULTIPART when file exists
  if (letterFile instanceof File) {
    const fd = new FormData();

    // Send booking JSON as part
    fd.append(
      "booking",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    // Send file part
    fd.append("letterFile", letterFile);

    // ✅ Debug FormData entries
    for (const [k, v] of fd.entries()) {
    }

    return api.post(`/booking/confirm`, fd, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        // ❌ DO NOT set Content-Type (axios/browser will set boundary)
      },
    });
  }

  // ✅ JSON when no file
  return api.post(`/booking/confirm`, payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // Content-Type defaults to application/json
    },
  });
};



/**
 *  Logged-in user details
 */
export const getCurrentUser = () => {
  return api.get(`${PUBLIC_API}/auth/me`);
};

/**
 * ==========================================================
 * DEBUG APIs
 * ==========================================================
 */

/**
 * Debug: All calendar entries for a center
 */
export const debugCalendar = (centerId) => {
  // ✅ Add validation
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }

  const id = String(centerId).trim();
  return api.get(`${PUBLIC_API}/debug/calendars/${id}`);
};

/**
 * Debug: Single calendar entry
 */
export const debugCalendarById = (calendarId) => {
  //  Add validation
  if (!calendarId || calendarId === "null" || calendarId === "undefined") {
    return Promise.reject(new Error(`Invalid calendar ID: ${calendarId}`));
  }

  const id = String(calendarId).trim();
  return api.get(`${PUBLIC_API}/debug/calendar/${id}`);
};

/**
 * ==========================================================
 * ADMIN APIs (CMTC)
 * ==========================================================
 */
const CMTC_ADMIN_API = `/admin/cmtc-centers`;

/**
 * ✅ Helper: Normalize center payload for admin UI compatibility.
 * Why needed:
 * - Some backends return snake_case fields (res_price) or different naming.
 * - Your UI expects camelCase: resPrice, nonResPrice, residentialCapacity, nonResidentialCapacity, centerType.
 * This function keeps old keys too (no breaking).
 */
const normalizeCenterForUI = (c) => {
  if (!c || typeof c !== "object") return c;

  return {
    ...c,

    // IDs
    centerId: c.centerId ?? c.id ?? c.cmtcCentersId ?? c.cmtc_centers_id,

    // Type
    centerType: c.centerType ?? c.center_type,

    // New capacities
    residentialCapacity: c.residentialCapacity ?? c.residential_capacity ?? c.res_capacity ?? 0,
    nonResidentialCapacity: c.nonResidentialCapacity ?? c.non_residential_capacity ?? c.nonResCapacity ?? c.non_res_capacity ?? 0,

    // New prices
    resPrice: c.resPrice ?? c.res_price ?? c.residentialPrice ?? c.priceResidential ?? 0,
    nonResPrice: c.nonResPrice ?? c.non_res_price ?? c.nonResidentialPrice ?? c.priceNonResidential ?? 0,
  };
};

/**
 * Get all centers (Admin)
 */
export const getAllCenters = () => {
  // ✅ normalize list so UI table + edit won't break if backend returns slightly different keys
  return api.get(`${CMTC_ADMIN_API}`).then(resp => {
    const data = resp?.data;
    if (Array.isArray(data)) return data.map(normalizeCenterForUI);
    if (Array.isArray(data?.data)) return data.data.map(normalizeCenterForUI);
    if (Array.isArray(data?.result)) return data.result.map(normalizeCenterForUI);
    return [];
  });
};

export const getAllPublicCenters = () => {
  // ✅ normalize list so UI table + edit won't break if backend returns slightly different keys
  return api.get(`${PUBLIC_API}/centers`).then(resp => {
    const data = resp?.data;
    if (Array.isArray(data)) return data.map(normalizeCenterForUI);
    if (Array.isArray(data?.data)) return data.data.map(normalizeCenterForUI);
    if (Array.isArray(data?.result)) return data.result.map(normalizeCenterForUI);
    return [];
  });
};


/**
 * Get center by ID
 */
export const getCenterById = (id) => {
  // ✅ Add validation
  if (!id || id === "null" || id === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${id}`));
  }
  const centerId = String(id).trim();

  // ✅ normalize single center response for edit form compatibility
  return api.get(`${CMTC_ADMIN_API}/${centerId}`).then((resp) => {
    const c = resp?.data ?? resp;
    const normalized = normalizeCenterForUI(c);
    // Keep original response shape (.data) because your pages sometimes do response.data
    return { ...resp, data: normalized };
  });
};

/**
 * Create center (WITH image upload)
 */
export const createCenter = async (payload, imageFile, brochureFile) => {
  const formData = new FormData();

  formData.append(
    "center",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  if (imageFile instanceof File) {
    formData.append("imageFile", imageFile);
  }

  // ✅ NEW: brochure
  if (brochureFile instanceof File) {
    formData.append("brochureFile", brochureFile); // MUST match backend @RequestPart name
  }

  return api.post(`${CMTC_ADMIN_API}`, formData, {
    headers: {
      // ❌ Don't set Content-Type manually (axios will add boundary)
      Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : ""
    },
  });
};


/**
 * Update center (WITH image upload)
 */
export const updateCenter = async (id, payload, imageFile, brochureFile) => {
  if (!id || id === "null" || id === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${id}`));
  }

  const centerId = String(id).trim();
  const formData = new FormData();

  formData.append(
    "center",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  if (imageFile instanceof File) {
    formData.append("imageFile", imageFile);
  }

  // ✅ NEW: brochure
  if (brochureFile instanceof File) {
    formData.append("brochureFile", brochureFile);
  }

  // ✅ Debug (remove later)
  for (const [k, v] of formData.entries()) {
  }

  return api.put(`${CMTC_ADMIN_API}/${centerId}`, formData, {
    headers: {
      Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : ""
    },
  });
};


/**
 * Add or update center amenities (Admin)
 */
export const addOrUpdateCenterAmenities = (centerId, amenities) => {
  // Add validation
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }

  const id = String(centerId).trim();
  return api.put(`${CMTC_ADMIN_API}/${id}/amenities`, amenities);
};

/**
 * Activate center
 */
export const activateCenter = (id) => {
  // ✅ Add validation
  if (!id || id === "null" || id === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${id}`));
  }

  const centerId = String(id).trim();
  return api.put(`${CMTC_ADMIN_API}/${centerId}/activate`);
};

/**
 * Deactivate center
 */
export const deactivateCenter = (id) => {
  // ✅ Add validation
  if (!id || id === "null" || id === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${id}`));
  }
  const centerId = String(id).trim();
  return api.put(`${CMTC_ADMIN_API}/${centerId}/deactivate`);
};

/**
 * Delete center
 */
export const deleteCenter = (id) => {
  // Add validation
  if (!id || id === "null" || id === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${id}`));
  }
  const centerId = String(id).trim();
  return api.delete(`${CMTC_ADMIN_API}/${centerId}`);
};

/**
 * ==========================================================
 * AMENITY MANAGEMENT APIs (NEW - FOR TRAINING CENTER AMENITY MANAGEMENT)
 * ==========================================================
 */

// Base API path for amenity management
const AMENITY_API = `/amenities`;

/**
 * Get center amenities with valueType support
 */
export const getCenterAmenitiesWithTypes = async (centerId) => {
  try {
    if (!centerId || !isValidId(centerId)) {
      console.warn("⚠️ Invalid centerId for getCenterAmenitiesWithTypes:", centerId);
      return [];
    }
    
    const id = safeId(centerId);
    const token = getAuthToken();
    
    const response = await api.get(`${AMENITY_API}/center/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
    
    // Normalize the response to include valueType
    const amenities = Array.isArray(response.data) 
      ? response.data 
      : response.data?.data || [];
    
    return amenities.map(amenity => ({
      ...amenity,
      valueType: (amenity.valueType || "QUANTITY").toUpperCase(),
quantity: amenity.quantity || 0,
selected: amenity.selected || false,

    }));
    
  } catch (error) {
    console.error("❌ Error fetching center amenities with types:", error);
    return [];
  }
};

/**
 * Add a single amenity to center
 */
export const addCenterAmenity = async (payload) => {
  const token = getAuthToken();
  
  if (!payload.centerId || !payload.amenityId) {
    throw new Error("Center ID and Amenity ID are required");
  }
  
  return api.post(`${AMENITY_API}/center`, payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Add multiple amenities to center (bulk)
 */
export const addBulkCenterAmenities = async (payloadArray) => {
  const token = getAuthToken();
  
  if (!Array.isArray(payloadArray) || payloadArray.length === 0) {
    throw new Error("At least one amenity payload is required");
  }
  
  return api.post(`${AMENITY_API}/center/bulk`, payloadArray, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Update center amenity
 */
export const updateCenterAmenity = async (amenityId, payload) => {
  const token = getAuthToken();
  
  if (!amenityId || !isValidId(amenityId)) {
    throw new Error("Valid Amenity ID is required");
  }
  
  const id = safeId(amenityId);
  return api.put(`${AMENITY_API}/center/${id}`, payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Delete center amenity
 */
export const deleteCenterAmenity = async (amenityId) => {
  const token = getAuthToken();
  
  if (!amenityId || !isValidId(amenityId)) {
    throw new Error("Valid Amenity ID is required");
  }
  
  const id = safeId(amenityId);
  return api.delete(`${AMENITY_API}/center/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  });
};

/**
 * Get available amenities for a center (not yet added)
 */
export const getAvailableAmenitiesForCenter = async (centerId) => {
  try {
    if (!centerId || !isValidId(centerId)) {
      console.warn("⚠️ Invalid centerId for getAvailableAmenitiesForCenter:", centerId);
      return [];
    }
    
    const id = safeId(centerId);
    const token = getAuthToken();
    
    const response = await api.get(`${AMENITY_API}/available/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
    
    // Normalize the response
    const amenities = Array.isArray(response.data) 
      ? response.data 
      : response.data?.data || [];
    
    return amenities.map(amenity => ({
      ...amenity,
      amenityId: amenity.amenityId || amenity.id || amenity.centerAmenityId,
      amenityName: amenity.amenityName || amenity.name || amenity.title,
      amenityCode: amenity.amenityCode || amenity.code,
      amenityTypeName: amenity.amenityTypeName || amenity.typeName,
      amenityTypeColor: amenity.amenityTypeColor || amenity.typeColor,
      description: amenity.description || amenity.amenityDescription,
      defaultQuantity: amenity.defaultQuantity || 0,
      valueType: amenity.valueType || "QUANTITY",
    }));
    
  } catch (error) {
    console.error("❌ Error fetching available amenities:", error);
    return [];
  }
};

/**
 * Get all amenity types
 */
export const getAllAmenityTypes = async () => {
  try {
    const token = getAuthToken();
    
    const response = await api.get(`${AMENITY_API}/types`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
    
    return Array.isArray(response.data) 
      ? response.data 
      : response.data?.data || [];
    
  } catch (error) {
    console.error("❌ Error fetching amenity types:", error);
    return [];
  }
};

/**
 * Get center amenity statistics
 */
export const getCenterAmenityStats = async (centerId) => {
  try {
    if (!centerId || !isValidId(centerId)) {
      console.warn("⚠️ Invalid centerId for getCenterAmenityStats:", centerId);
      return {
        totalAmenities: 0,
        available: 0,
        lowStock: 0,
        outOfStock: 0,
      };
    }
    
    const id = safeId(centerId);
    const token = getAuthToken();
    
    const response = await api.get(`${AMENITY_API}/center/${id}/stats`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
    
    return response.data || {
      totalAmenities: 0,
      available: 0,
      lowStock: 0,
      outOfStock: 0,
    };
    
  } catch (error) {
    console.error("❌ Error fetching amenity stats:", error);
    return {
      totalAmenities: 0,
      available: 0,
      lowStock: 0,
      outOfStock: 0,
    };
  }
};

/**
 * Search amenities by name or code
 */
export const searchAmenities = async (searchTerm) => {
  try {
    const token = getAuthToken();
    
    const response = await api.get(`${AMENITY_API}/search`, {
      params: { q: searchTerm },
      headers: {
        Authorization: token ? `Bearer ${token}` : ""
      }
    });
    
    return Array.isArray(response.data) 
      ? response.data 
      : response.data?.data || [];
    
  } catch (error) {
    console.error("❌ Error searching amenities:", error);
    return [];
  }
};

/**
 * ==========================================================
 * UTILITY FUNCTIONS
 * ==========================================================
 */

/**
 * Helper to normalize amenities data for UI consumption - MATCHES BACKEND STRUCTURE
 */
export const normalizeAmenitiesForUI = (amenities) => {

  if (!amenities) {
    return [];
  }

  // Ensure we have an array
  let amenitiesArray = [];

  if (Array.isArray(amenities)) {
    amenitiesArray = amenities;
  } else if (amenities && typeof amenities === 'object') {
    // Check for common array properties
    if (Array.isArray(amenities.data)) {
      amenitiesArray = amenities.data;
    } else {
      // Try to wrap single object
      amenitiesArray = [amenities];
    }
  } else {
    return [];
  }

  if (amenitiesArray.length === 0) {
    return [];
  }

  // Normalize each item to match your backend structure
  const normalized = amenitiesArray.map((item, index) => {
    try {      
      const amenityType = item.amenityType || {};
      const subAmenities = item.subAmenities || [];
      
      return {
        // Direct properties from backend
        id: item.id || `amenity-${index}`,
        quantity: item.quantity || 1,
        selected: item.selected || false,
        notes: item.notes || '',
        amenityName: item.amenityName || 'Facility',
        amenityCode: item.amenityCode || 'N/A',
        description: item.description || 'No description available',
        valueType: item.valueType || 'QUANTITY',
        
        // Nested properties
        subAmenities: subAmenities,
        
        // Type information
        amenityTypeName: amenityType.typeName || 'Other Facilities',
        amenityTypeColor: amenityType.colorCode || '#95a5a6',
        amenityTypeId: amenityType.id || 0,
        
        // For debugging
        _originalType: amenityType,
        _hasSubAmenities: subAmenities.length > 0
      };
      
    } catch (error) {
      return {
        id: `error-${index}`,
        amenityName: 'Error Loading Facility',
        amenityCode: 'ERR',
        description: 'Could not load facility information',
        quantity: 0,
        selected: false,
        notes: 'Data loading error',
        valueType: 'QUANTITY',
        subAmenities: [],
        amenityTypeName: 'Error',
        amenityTypeColor: '#e74c3c',
        amenityTypeId: 0
      };
    }
  });
  return normalized;
};

/**
 * SIMPLIFIED NORMALIZATION - Try this if the above doesn't work
 */
export const normalizeAmenitiesSimple = (amenities) => {
  if (!amenities || !Array.isArray(amenities)) {
    return [];
  }

  // Direct mapping - assuming backend returns exactly what we need
 const normalized = amenities.map((item, index) => {
  return {
    id: item.id || `item-${index}`,

    // ✅ CRITICAL FIX
    quantity:
      item.quantity !== null && item.quantity !== undefined
        ? item.quantity
        : null,

    // ✅ CRITICAL FIX
    selected:
      item.selected === true || item.selected === false
        ? item.selected
        : undefined,

    notes: item.notes || '',
    subAmenities: item.subAmenities || [],
    amenityName: item.amenityName || 'Facility',
    amenityCode: item.amenityCode || 'N/A',
    description: item.description || 'No description',
    amenityTypeId: item.amenityTypeId || 0,
    valueType: item.valueType,

    amenityTypeName: item.amenityType?.typeName || 'Other Facilities',
    amenityTypeColor: item.amenityType?.colorCode || '#95a5a6',

    _original: item
  };
});

return normalized;

};

/**
 * Get center details with amenities (combined API call)
 */
export const getCenterDetailsWithAmenities = async (centerId) => {
  try {
    // ✅ Add validation
    if (!centerId || centerId === "null" || centerId === "undefined") {
      throw new Error(`Invalid center ID: ${centerId}`);
    }

    const id = String(centerId).trim();
    const [centerDetails, amenities] = await Promise.all([
      getCenterDetails(id),
      getCenterAmenities(id)
    ]);

    return {
      ...centerDetails.data,
      amenities: Array.isArray(amenities) ? amenities : []
    };
  } catch (error) {
    throw error;
  }
};

/**
 * ==========================================================
 * HELPER FUNCTIONS
 * ==========================================================
 */

/**
 * Validate if an ID is valid for API calls
 */
export const isValidId = (id) => {
  return id &&
    id !== "null" &&
    id !== "undefined" &&
    id !== null &&
    id !== undefined &&
    String(id).trim().length > 0 &&
    !isNaN(Number(id));
};

/**
 * Safely convert ID to string for API calls
 */
export const safeId = (id) => {
  if (!isValidId(id)) {
    return null;
  }
  return String(id).trim();
};


/**
 * Create amenity payload based on valueType
 */
export const createAmenityPayload = (amenityData, valueType) => {
  const basePayload = {
    amenityId: Number(amenityData.amenityId),
    centerId: Number(amenityData.centerId),
    notes: amenityData.notes || "",
  };
  
  if (valueType === "QUANTITY") {
    return {
      ...basePayload,
      quantity: Number(amenityData.quantity) || 0,
      selected: null
    };
  } else if (valueType === "BOOLEAN") {
    return {
      ...basePayload,
      quantity: null,
      selected: Boolean(amenityData.selected)
    };
  }
  
  // Default to QUANTITY
  return {
    ...basePayload,
    quantity: Number(amenityData.quantity) || 0,
    selected: null
  };
};

// ==========================================================
// CMTC GALLERY APIs (Admin)
// ==========================================================
const CMTC_GALLERY_API = `/cmtc/gallery`;

export const getCmtcGallery = (centerId) => {
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }
  const id = String(centerId).trim();
  return api.get(`${CMTC_GALLERY_API}/${id}`);
};

export const uploadCmtcGalleryImageSingle = (centerId, priorityNo, imageNameKey, file) => {
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }
  if (!priorityNo) return Promise.reject(new Error("priorityNo is required"));
  if (!imageNameKey) return Promise.reject(new Error("imageNameKey is required"));
  if (!(file instanceof File)) return Promise.reject(new Error("image file is required"));

  const id = String(centerId).trim();
  const fd = new FormData();
  fd.append("priorityNo", String(priorityNo));
  fd.append("imageNameKey", imageNameKey);
  fd.append("file", file);

  return api.post(`${CMTC_GALLERY_API}/${id}/images/single`, fd);
};

export const uploadCmtcGalleryImagesBulk = (centerId, items, files) => {
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }
  if (!Array.isArray(items) || items.length === 0) {
    return Promise.reject(new Error("items is empty"));
  }
  if (!Array.isArray(files) || files.length === 0) {
    return Promise.reject(new Error("files is empty"));
  }

  const id = String(centerId).trim();
  const fd = new FormData();
  fd.append("itemsJson", JSON.stringify(items));
  files.forEach((f) => fd.append("files", f));

  return api.post(`${CMTC_GALLERY_API}/${id}/images/bulk`, fd);
};

export const uploadCmtcGalleryVideo = (centerId, title, durationSeconds, file) => {
  if (!centerId || centerId === "null" || centerId === "undefined") {
    return Promise.reject(new Error(`Invalid center ID: ${centerId}`));
  }
  // if (!durationSeconds) return Promise.reject(new Error("durationSeconds is required"));
  if (!(file instanceof File)) return Promise.reject(new Error("video file is required"));

  const id = String(centerId).trim();
  const fd = new FormData();
  if (title) fd.append("title", title);
  fd.append("durationSeconds", String(durationSeconds));
  fd.append("file", file);

  return api.post(`${CMTC_GALLERY_API}/${id}/video`, fd);
};

export const getClfCmtcDetails = async (centerId) => {
   const res = await api.get(`/bookings/getClfDetails/${centerId}` );
   return res.data;
};

export default {
  // Public APIs
  getAllDistricts,
  getBlocksByDistrict,
  getCentersByDistrict,
  getCentersByBlock,
  getCenterDetails,
  getCenterAmenities,

  // Booking APIs
  getTrainingCalendar,
  getTrainingSlots,
  getMonthlyCalendar,
  confirmBooking,
  getCurrentUser,

  // Debug APIs
  debugCalendar,
  debugCalendarById,

  // Admin Center APIs
  getAllCenters,
  getCenterById,
  createCenter,
  updateCenter,
  addOrUpdateCenterAmenities,
  activateCenter,
  deactivateCenter,
  deleteCenter,
  
  // NEW: Amenity Management APIs
  getCenterAmenitiesWithTypes,
  addCenterAmenity,
  addBulkCenterAmenities,
  updateCenterAmenity,
  deleteCenterAmenity,
  getAvailableAmenitiesForCenter,
  getAllAmenityTypes,
  getCenterAmenityStats,
  searchAmenities,
  
  // Utility functions
  normalizeAmenitiesForUI,
  normalizeAmenitiesSimple,
  getCenterDetailsWithAmenities,
  createAmenityPayload,
  
  // Helper functions
  isValidId,
  safeId,
  getClfCmtcDetails
};
