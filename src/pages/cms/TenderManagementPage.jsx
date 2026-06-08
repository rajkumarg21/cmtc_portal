// src/pages/cms/TenderManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
// IMPORTANT: Ensure approveTender and rejectTender are imported from your service
import {
  createTender,
  getTenderById,
  updateTender,
  getAllTenders,
  deleteTender,
  approveTender, 
  rejectTender 
} from '../../services/tenderService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify'; 

const TenderManagementPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { hasRole } = useAuth(); 

  const [tenders, setTenders] = useState([]); 
  const [formData, setFormData] = useState({
    titleHindi: '',
    titleEnglish: '',
    description: '',
    attachmentFileName: '', // To display current file name when editing
    tenderDate: '',
    archiveDate: '',
    isAlert: 'NO',
    status: 'PENDING_APPROVAL', // Default status for new content
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Kept for consistency, but toast is preferred
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tenderToDelete, setTenderToDelete] = useState(null);

  const isEditing = !!id;

  // Helper function to refresh the list of tenders
  const refreshTenders = async () => {
    try {
      const allTenders = await getAllTenders();
      setTenders(allTenders);
    } catch (err) {
      console.error("Failed to refresh tenders:", err);
      // Use toast for errors that don't need to block UI
      toast.error('Failed to load tenders list.');
      setError('Failed to load tenders: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        if (isEditing) {
          const tenderData = await getTenderById(id);
          setFormData({
            titleHindi: tenderData.titleHindi || '',
            titleEnglish: tenderData.titleEnglish || '',
            description: tenderData.description || '',
            attachmentFileName: tenderData.attachmentFileName || '',
            attachmentUrl: tenderData.attachmentUrl || '',
              tenderDate:
                tenderData.tenderDate != null
                  ? new Date(tenderData.tenderDate).toISOString().split("T")[0]
                  : '',

              archiveDate:
                tenderData.archiveDate != null
                  ? new Date(tenderData.archiveDate).toISOString().split("T")[0]
                  : '',
            isAlert: tenderData.isAlert || 'NO',
            status: tenderData.status || 'PENDING_APPROVAL',
          });
        }
        await refreshTenders(); // Initial fetch of all tenders

      } catch (err) {
        setError('Failed to load initial data: ' + (err.response?.data?.message || err.message));
        toast.error('Failed to load initial data!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]); // Dependencies for useEffect

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setAttachmentFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

// 🔥 FRONTEND VALIDATION BLOCK — ADD THIS
  if (!isEditing && !attachmentFile) {
    toast.error("Attachment (PDF) is mandatory for Tender section. Please attach tender document.");
    return; 
  }
  if (isEditing && !attachmentFile && !formData.attachmentFileName) {
    toast.error("Please attach the Tender PDF document before updating.");
    return;
  }
  // 🔥 END VALIDATION BLOCK

    setLoading(true);

    try {
      const payload = {
        ...formData,
        tenderDate: formData.tenderDate || null,
        archiveDate: formData.archiveDate || null,
      };

      if (isEditing) {
        await updateTender(id, payload, attachmentFile);
        toast.success('Tender updated successfully and sent for approval!');
      } else {
        await createTender(payload, attachmentFile);
        toast.success('Tender added successfully and sent for approval!');
        // Reset form after successful creation
        setFormData({
          titleHindi: '',
          titleEnglish: '',
          description: '',
          attachmentFileName: '',
          tenderDate: '',
          archiveDate: '',
          isAlert: 'NO',
          status: 'PENDING_APPROVAL',
        });
        setAttachmentFile(null);
      }
      await refreshTenders(); // Refresh list after create/update
      setLoading(false);
      // Removed navigate as refreshTenders handles state, and user might want to stay on page
      // navigate('/cms/tenders');
    } catch (err) {
      console.error('Operation failed:', err); // Log full error for debugging
      setError('Operation failed: ' + (err.response?.data?.message || err.message));
      toast.error('Operation failed: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleDeleteClick = (tender) => {
    setTenderToDelete(tender);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await deleteTender(tenderToDelete.id);
      toast.success('Tender deleted successfully!');
      await refreshTenders(); // Refresh list after delete
    } catch (err) {
      setError('Failed to delete tender: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to delete tender!');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setTenderToDelete(null);
    }
  };

  // NEW: Handlers for Approve/Reject actions
  const handleApprove = async (tenderId) => {
    setLoading(true);
    setError('');
    // setMessage(''); // Using toast instead
    try {
      await approveTender(tenderId);
      toast.success('Tender approved successfully!');
      await refreshTenders(); // Refresh list to show updated status
    } catch (err) {
      setError('Failed to approve tender: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to approve tender!');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (tenderId) => {
    setLoading(true);
    setError('');
    // setMessage(''); // Using toast instead
    try {
      await rejectTender(tenderId);
      toast.info('Tender rejected!'); // Use toast.info for rejection
      await refreshTenders(); // Refresh list to show updated status
    } catch (err) {
      setError('Failed to reject tender: ' + (err.response?.data?.message || err.message));
      toast.error('Failed to reject tender!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // Ensure the roles here match exactly what your JWT provides (e.g., "PORTAL_ADMIN" not "ROLE_PORTAL_ADMIN")
  // Your console logs confirm userRole is "PORTAL_ADMIN"
  if (!hasRole(['EDITOR', 'PUBLISHER', 'PORTAL_ADMIN'])) {
    return <div className="text-center text-red-500 py-8">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center" style={{ color: '#4A000E' }}>Tender Management</h1>

      <div className="bg-white rounded-lg shadow-xl p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#4A000E' }}>
          {isEditing ? 'Edit Tender' : 'Add New Tender'}
        </h2>

        {/* Display error and message using Tailwind CSS for better visibility */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <InputField
            label="Title (Hindi)"
            id="titleHindi"
            name="titleHindi"
            value={formData.titleHindi}
            onChange={handleChange}
            required
            className="shadow-none"
          />
          </div>
          <div className="col-md-6">
            <InputField
            label="Title (English)"
            id="titleEnglish"
            name="titleEnglish"
            value={formData.titleEnglish}
            onChange={handleChange}
            required
            className="shadow-none"
          />
          </div>
         
          <div className="col-md-12">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            ></textarea>
          </div>

          <div className="col-md-12">
            <label htmlFor="attachment" className="block text-gray-700 text-sm font-bold mb-2">Attachment (PDF):</label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 shadow-none"
            />
            {isEditing && formData.attachmentFileName && !attachmentFile && (
              <p className="text-sm text-gray-600 mt-2">Current file: {formData.attachmentFileName} (<a href={`${import.meta.env.VITE_BASE_URL}${formData.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>)</p>
            )}
            {attachmentFile && (
              <p className="text-sm text-gray-600 mt-2">New file selected: {attachmentFile.name}</p>
            )}
          </div>
              <div class="col-md-4">
                <InputField
                label="Tender Date"
                id="tenderDate"
                name="tenderDate"
                type="date"
                value={formData.tenderDate}
                onChange={handleChange}
                required
                className="shadow-none"
              />
              </div>
              <div class="col-md-4">
                 <InputField
                label="Archive Date"
                id="archiveDate"
                name="archiveDate"
                type="date"
                value={formData.archiveDate || new Date().toISOString().split("T")[0]} // default today
                onChange={handleChange}
                className="shadow-none"
              />  
            </div>

          <div className="col-md-4">
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status:</label>
            <input
              type="text"
              id="status"
              name="status"
              value={formData.status}
              disabled
              className="shadow-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-200 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">New content is submitted as 'PENDING_APPROVAL'.</p>
          </div>

          <div className="col-md-12">
            <Button type="submit" disabled={loading} className="float-right">
              {isEditing ? 'Update Tender' : 'Submit Tender'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#4A000E' }}>All Tenders</h2>
        {tenders.length === 0 ? (
          <p className="text-gray-600 text-center">No tenders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Title (EN)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Tender Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenders.map((tender) => (
                  <tr key={tender.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{tender.titleEnglish}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{new Date(tender.tenderDate).toLocaleDateString("en-GB")}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tender.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        tender.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/cms/tenders/${tender.id}`)}>Edit</Button>
                        {hasRole(['PORTAL_ADMIN']) && (
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(tender)}>Delete</Button>
                        )}
                        {/* APPROVE/REJECT BUTTONS - NEWLY ADDED LOGIC */}
                        {(hasRole(['PUBLISHER', 'PORTAL_ADMIN']) && tender.status === 'PENDING_APPROVAL') && (
                          <>
                            <Button variant="success" size="sm" onClick={() => handleApprove(tender.id)}>Approve</Button>
                            <Button variant="warning" size="sm" onClick={() => handleReject(tender.id)}>Reject</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete tender "${tenderToDelete?.titleEnglish}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default TenderManagementPage;
