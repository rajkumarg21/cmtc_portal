import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {
  getAllFeedback,
  markFeedbackAsReviewed,
  deleteFeedback,
  getFeedbackById,
} from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { sanitizeText } from '../../utils/security';
const FeedbackManagementPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const { hasRole } = useAuth();

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllFeedback();
      const sortedData = data.sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );
      setFeedbackList(sortedData);
    } catch (err) {
      setError('Failed to fetch feedback messages: ' + (err.response?.data || err.message));
      console.error('Error fetching feedback messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole(['PORTAL_ADMIN'])) {
      fetchFeedback();
    } else {
      setLoading(false);
      setError('You do not have permission to access this page.');
    }
  }, [hasRole]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // show AM/PM
    });
  };

  const handleViewFeedback = async (feedbackId) => {
    setLoading(true);
    setError('');
    try {
      const feedbackDetails = await getFeedbackById(feedbackId);
      setSelectedFeedback(feedbackDetails);
      setIsModalOpen(true);
      if (!feedbackDetails.reviewed) {
        await markFeedbackAsReviewed(feedbackId);
        setFeedbackList((prevList) =>
          prevList.map((fb) => (fb.id === feedbackId ? { ...fb, reviewed: true } : fb))
        );
      }
    } catch (err) {
      setError('Failed to load feedback details: ' + (err.response?.data || err.message));
      console.error('Error viewing feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async (feedbackId) => {
    setLoading(true);
    setError('');
    try {
      await markFeedbackAsReviewed(feedbackId);
      setFeedbackList((prevList) =>
        prevList.map((fb) => (fb.id === feedbackId ? { ...fb, reviewed: true } : fb))
      );
    } catch (err) {
      setError('Failed to mark feedback as reviewed: ' + (err.response?.data || err.message));
      console.error('Error marking feedback as reviewed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteFeedback(feedbackToDelete.id);
      setFeedbackList(feedbackList.filter((fb) => fb.id !== feedbackToDelete.id));
    } catch (err) {
      setError('Failed to delete feedback: ' + (err.response?.data || err.message));
      console.error('Error deleting feedback:', err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
  if (!hasRole(['PORTAL_ADMIN'])) {
    return (
      <div className="text-center text-red-500 py-8">
        You do not have permission to access this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        {sanitizeText("Feedback Management")}
      </h1>

      {feedbackList.length === 0 ? (
        <p className="text-gray-600 text-center py-8">{sanitizeText("No feedback messages found.")}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  {sanitizeText("Name")}
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  {sanitizeText("Email")}
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  {sanitizeText("Rating")}
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  {sanitizeText("Submitted")}
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  {sanitizeText("Status")}
                </th>
                <th className="px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">
                  {sanitizeText("Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbackList.map((feedback) => (
                <tr
                  key={feedback.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-gray-900">
                    {feedback.name || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {feedback.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {feedback.rating || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDateTime(feedback.submittedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        feedback.reviewed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {feedback.reviewed ? 'Reviewed' : 'Unreviewed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleViewFeedback(feedback.id)}
                      >
                        {sanitizeText("View")}
                      </Button>
                      {!feedback.reviewed && (
                        <Button
                          variant="primary"
                          onClick={() => handleMarkAsReviewed(feedback.id)}
                        >
                          {sanitizeText("Mark Reviewed")}
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(feedback)}
                      >
                        {sanitizeText("Delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Feedback Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Feedback Details"
      >
        {selectedFeedback && (
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>From:</strong> {selectedFeedback.name || 'Anonymous'} (
              {selectedFeedback.email || 'N/A'})
            </p>
            <p>
              <strong>{sanitizeText("Submitted:")}</strong> {formatDateTime(selectedFeedback.submittedAt)}
            </p>
            <p>
              <strong>{sanitizeText("Rating:")}</strong> {selectedFeedback.rating || 'N/A'}
            </p>
            <p>
              <strong>{sanitizeText("Status:")}</strong>{' '}
              {selectedFeedback.reviewed ? 'Reviewed' : 'Unreviewed'}
            </p>
            <div className="border-t border-gray-200 pt-4">
              <p className="font-semibold mb-2 text-gray-800">{sanitizeText("Comments:")}</p>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {selectedFeedback.comments}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete feedback from "${
          feedbackToDelete?.name || 'Anonymous'
        }"? This action cannot be undone.`}
      />
    </div>
  );
};

export default FeedbackManagementPage;
