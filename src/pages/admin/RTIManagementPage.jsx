import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import {
  getAllRTIRequests,
  getRTIRequestById,
  updateRTIRequestStatusAndResponse,
  deleteRTIRequest,
} from "../../services/rtiService";
import { useAuth } from "../../context/AuthContext";
import { RTI_STATUS } from "../../utils/constants";

const RTIManagementPage = () => {
  const [rtiRequests, setRtiRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [responseFormData, setResponseFormData] = useState({
    status: "",
    responseDetails: "",
  });
  const [responseFile, setResponseFile] = useState(null);

  const { hasRole } = useAuth();

  // ✅ Consistent date format: dd/mm/yyyy hh:mm AM/PM
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchRTIRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllRTIRequests();
      const sortedData = data.sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );
      setRtiRequests(sortedData);
    } catch (err) {
      setError(
        "Failed to fetch RTI requests: " +
          (err.response?.data || err.message)
      );
      console.error("Error fetching RTI requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole(["PORTAL_ADMIN"])) {
      fetchRTIRequests();
    } else {
      setLoading(false);
      setError("You do not have permission to access this page.");
    }
  }, [hasRole]);

  const handleViewRequest = async (requestId) => {
    setLoading(true);
    setError("");
    try {
      const requestDetails = await getRTIRequestById(requestId);
      setSelectedRequest(requestDetails);
      setResponseFormData({
        status: requestDetails.status,
        responseDetails: requestDetails.responseDetails || "",
      });
      setResponseFile(null);
      setIsModalOpen(true);
    } catch (err) {
      setError(
        "Failed to load RTI request details: " +
          (err.response?.data || err.message)
      );
      console.error("Error viewing RTI request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseFormChange = (e) => {
    const { name, value } = e.target;
    setResponseFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResponseFileChange = (e) => {
    setResponseFile(e.target.files[0]);
  };

  const handleUpdateResponse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await updateRTIRequestStatusAndResponse(
        selectedRequest.id,
        responseFormData,
        responseFile
      );
      setIsModalOpen(false);
      await fetchRTIRequests();
    } catch (err) {
      setError(
        "Failed to update RTI request: " +
          (err.response?.data || err.message)
      );
      console.error("Error updating RTI request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (request) => {
    setRequestToDelete(request);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError("");
    try {
      await deleteRTIRequest(requestToDelete.id);
      setRtiRequests(
        rtiRequests.filter((req) => req.id !== requestToDelete.id)
      );
    } catch (err) {
      setError(
        "Failed to delete RTI request: " +
          (err.response?.data || err.message)
      );
      console.error("Error deleting RTI request:", err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setRequestToDelete(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
  if (!hasRole(["PORTAL_ADMIN"])) {
    return (
      <div className="text-center text-red-500 py-8">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        RTI Request Management
      </h1>

      {rtiRequests.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No RTI requests found.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  App. No.
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Applicant Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rtiRequests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-gray-900">
                    {request.applicationNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {request.applicantName}
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {request.requestSubject}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDateTime(request.submittedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === RTI_STATUS.COMPLETED
                          ? "bg-green-100 text-green-800"
                          : request.status === RTI_STATUS.IN_PROGRESS
                          ? "bg-blue-100 text-blue-800"
                          : request.status === RTI_STATUS.PENDING
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleViewRequest(request.id)}
                      >
                        View / Respond
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(request)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for details & response */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="RTI Request Details & Response"
      >
        {selectedRequest && (
          <div className="space-y-4 text-gray-700 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-1">
              Request Details
            </h3>
            <p>
              <strong>Application No:</strong> {selectedRequest.applicationNumber}
            </p>
            <p>
              <strong>Applicant Name:</strong> {selectedRequest.applicantName}
            </p>
            <p>
              <strong>Email:</strong> {selectedRequest.applicantEmail}
            </p>
            <p>
              <strong>Phone:</strong> {selectedRequest.applicantPhone}
            </p>
            <p>
              <strong>Address:</strong> {selectedRequest.applicantAddress}
            </p>
            <p>
              <strong>Subject:</strong> {selectedRequest.requestSubject}
            </p>
            <p>
              <strong>Details:</strong> {selectedRequest.requestDetails}
            </p>
            <p>
              <strong>Submitted:</strong> {formatDateTime(selectedRequest.submittedAt)}
            </p>
            <p>
              <strong>Current Status:</strong>{" "}
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedRequest.status === RTI_STATUS.COMPLETED
                    ? "bg-green-100 text-green-800"
                    : selectedRequest.status === RTI_STATUS.IN_PROGRESS
                    ? "bg-blue-100 text-blue-800"
                    : selectedRequest.status === RTI_STATUS.PENDING
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {selectedRequest.status.replace("_", " ")}
              </span>
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 border-t pt-4">
              Update Response
            </h3>
            <form onSubmit={handleUpdateResponse} className="space-y-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Update Status:
                </label>
                <select
                  id="status"
                  name="status"
                  value={responseFormData.status}
                  onChange={handleResponseFormChange}
                  required
                  className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
                >
                  {Object.values(RTI_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="responseDetails"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Response Details:
                </label>
                <textarea
                  id="responseDetails"
                  name="responseDetails"
                  value={responseFormData.responseDetails}
                  onChange={handleResponseFormChange}
                  rows="5"
                  className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="responseFile"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Attach Response File (PDF/Doc):
                </label>
                <input
                  type="file"
                  id="responseFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResponseFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedRequest.responseFileUrl && !responseFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Current file:{" "}
                    <a
                      href={`${import.meta.env.VITE_BASE_URL}${selectedRequest.responseFileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </p>
                )}
                {responseFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    New file selected: {responseFile.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                Update RTI Request
              </Button>
            </form>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete RTI request "${requestToDelete?.applicationNumber}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default RTIManagementPage;
