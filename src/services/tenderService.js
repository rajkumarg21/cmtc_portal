import api from './apiService';

const TENDERS_API_URL = '/tenders';


/* ---------------------------
   CREATE TENDER
---------------------------- */
export const createTender = async (tenderData, attachmentFile) => {
  const formData = new FormData();

  // MUST match @RequestPart("tender")
  formData.append(
    'tender',
    new Blob([JSON.stringify(tenderData)], { type: 'application/json' })
  );

  // MUST match @RequestPart("attachment")
  if (attachmentFile) {
    formData.append('attachment', attachmentFile);
  }

  const response = await api.post(`${TENDERS_API_URL}/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};


/* ---------------------------
   UPDATE TENDER
---------------------------- */
export const updateTender = async (id, tenderData, attachmentFile) => {
  const formData = new FormData();

  // MUST match @RequestPart("tender")
  formData.append(
    'tender',
    new Blob([JSON.stringify(tenderData)], { type: 'application/json' })
  );

  // MUST match @RequestPart("attachment")
  if (attachmentFile) {
    formData.append('attachment', attachmentFile);
  }

  const response = await api.put(`${TENDERS_API_URL}/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};


/* ---------------------------
   FETCH BY ID
---------------------------- */
export const getTenderById = async (id) => {
  const response = await api.get(`${TENDERS_API_URL}/admin/${id}`);
  return response.data;
};


/* ---------------------------
   FETCH ALL (ADMIN)
---------------------------- */
export const getAllTenders = async () => {
  const response = await api.get(`${TENDERS_API_URL}/admin`);
  return response.data;
};


/* ---------------------------
   FETCH ALL (PUBLISHED)
---------------------------- */
export const getPublishedTenders = async () => {
  const response = await api.get(`${TENDERS_API_URL}/public`);
  return response.data;
};


/* ---------------------------
   APPROVE
---------------------------- */
export const approveTender = async (id) => {
  const response = await api.put(`${TENDERS_API_URL}/admin/${id}/approve`);
  return response.data;
};


/* ---------------------------
   REJECT
---------------------------- */
export const rejectTender = async (id) => {
  const response = await api.put(`${TENDERS_API_URL}/admin/${id}/reject`);
  return response.data;
};


/* ---------------------------
   DELETE
---------------------------- */
export const deleteTender = async (id) => {
  const response = await api.delete(`${TENDERS_API_URL}/admin/${id}`);
  return response.data;
};


/* ---------------------------
   LATEST TENDERS (PUBLIC)
---------------------------- */
export const getLatestTenders = async () => {
  const response = await api.get(`${TENDERS_API_URL}/public/latest`);
  return response.data;
};
