// src/services/commonService.js
import api from './apiService';

/**
 * WHY: Keep API endpoints clean, centralized, and reusable.
 */
const USERS_API_URL = '/public/master';

const commonService = {
  getCountries() {
    return api.get(`${USERS_API_URL}/countries`);
  },

  getStatesByCountry(countryId) {
    return api.get(`${USERS_API_URL}/${countryId}/states`);
  },

  getDistrictsByState(stateId) {
    return api.get(`${USERS_API_URL}/${stateId}/districts`);
  },

 getTehsilByDistrict(districtId) {
    return api.get(`${USERS_API_URL}/${districtId}tehsils`);
  },

  getBlocksByDistrict(districtId) {
    return api.get(`${USERS_API_URL}/${districtId}/blocks`);
  },
  getDistricts() {
    return api.get(`${USERS_API_URL}/districts`);
  },
 
  getTehsil() {
    return api.get(`${USERS_API_URL}/tehsils`);
  },

   getBlock() {
    return api.get(`${USERS_API_URL}/Blocks`);
  }
};

export default commonService;
