import api from "../../services/apiService";

const PUBLIC_API = "/public";

/**
 * Asset Categories
 */
export const getAllAssetCategories = () => {
  return api.get(`${PUBLIC_API}/asset-categories`);
};

/**
 * Assets By Category
 */
export const getAssetsByCategoryId = (categoryId) => {
  if (!categoryId || categoryId === "null" || categoryId === "undefined") {
    return Promise.reject(new Error(`Invalid category ID: ${categoryId}`));
  }

  return api.get(`${PUBLIC_API}/asset-categories/category/${categoryId}`);
};

/**
 * Save Inventory
 */
export const saveInventory = (formData) => {
  //   return api.post(
  //     `${PUBLIC_API}/cmtc-asset-inventory`,
  //     payload
  //   );
  return api.post(`${PUBLIC_API}/cmtc-asset-inventory`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllInventory = () => {
  return api.get(`${PUBLIC_API}/cmtc-asset-inventory`);
};

export const getInventoryByDistrict = (districtId) => {
  return api.get(`${PUBLIC_API}/cmtc-asset-inventory/district/${districtId}`);
};

export const getInventoryByBlock = (blockId) => {
  return api.get(`${PUBLIC_API}/cmtc-asset-inventory/block/${blockId}`);
};

export const updateInventory = (id, formData) => {
  return api.put(`${PUBLIC_API}/cmtc-asset-inventory/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const getInventoryByCenter = (centerId) =>{
  return api.get(`${PUBLIC_API}/cmtc-asset-inventory/center/${centerId}`);
}
 
