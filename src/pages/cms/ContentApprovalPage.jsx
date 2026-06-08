import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { getAllNewsArticles, updateNewsArticle } from '../../services/newsService';
import { getAllCirculars, updateCircular } from '../../services/circularService';
import { getAllStaticPages, updateStaticPage } from '../../services/staticPageService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { CONTENT_STATUS } from '../../utils/constants';

const ContentApprovalPage = () => {
  const [pendingContent, setPendingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmAction, setShowConfirmAction] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

  const { hasRole } = useAuth();

  const fetchPendingContent = async () => {
    setLoading(true);
    setError('');
    try {
      const [news, circulars, staticPages] = await Promise.all([
        getAllNewsArticles(),
        getAllCirculars(),
        getAllStaticPages(),
      ]);

      const pendingNews = news
        .filter(item => item.status === CONTENT_STATUS.PENDING_APPROVAL)
        .map(item => ({ ...item, contentType: 'News Article', displayTitle: item.titleEnglish || item.titleHindi }));

      const pendingCirculars = circulars
        .filter(item => item.status === CONTENT_STATUS.PENDING_APPROVAL)
        .map(item => ({ ...item, contentType: 'Circular', displayTitle: item.titleEnglish || item.titleHindi }));

      const pendingStaticPages = staticPages
        .filter(item => item.status === CONTENT_STATUS.PENDING_APPROVAL)
        .map(item => ({ ...item, contentType: 'Static Page', displayTitle: item.titleEnglish || item.titleHindi }));

      const allPending = [...pendingNews, ...pendingCirculars, ...pendingStaticPages];
      // Sort by creation date or last update date, most recent first
      allPending.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));

      setPendingContent(allPending);
    } catch (err) {
      setError('Failed to fetch pending content: ' + (err.response?.data || err.message));
      console.error('Error fetching pending content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole(['PUBLISHER', 'PORTAL_ADMIN'])) {
      fetchPendingContent();
    } else {
      setLoading(false);
      setError('You do not have permission to access this page.');
    }
  }, [hasRole]);

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleActionClick = (content, action) => {
    setSelectedContent(content);
    setActionType(action);
    setShowConfirmAction(true);
  };

  const handleConfirmAction = async () => {
    setLoading(true);
    setError('');
    try {
      let updatedContent;
      if (selectedContent.contentType === 'News Article') {
        updatedContent = await updateNewsArticle(selectedContent.id, { ...selectedContent, status: actionType === 'approve' ? CONTENT_STATUS.PUBLISHED : CONTENT_STATUS.REJECTED });
      } else if (selectedContent.contentType === 'Circular') {
        updatedContent = await updateCircular(selectedContent.id, { ...selectedContent, status: actionType === 'approve' ? CONTENT_STATUS.PUBLISHED : CONTENT_STATUS.REJECTED });
      } else if (selectedContent.contentType === 'Static Page') {
        updatedContent = await updateStaticPage(selectedContent.id, { ...selectedContent, status: actionType === 'approve' ? CONTENT_STATUS.PUBLISHED : CONTENT_STATUS.REJECTED });
      }

      // Refresh the list after action
      await fetchPendingContent();
      setIsModalOpen(false); // Close modal if open
    } catch (err) {
      setError(`Failed to ${actionType} content: ` + (err.response?.data || err.message));
      console.error(`Error ${actionType}ing content:`, err);
    } finally {
      setLoading(false);
      setShowConfirmAction(false);
      setSelectedContent(null);
      setActionType('');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
  if (!hasRole(['PUBLISHER', 'PORTAL_ADMIN'])) {
    return <div className="text-center text-red-500 py-8">You do not have permission to access this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Content Approval</h1>

      {pendingContent.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No content pending approval.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingContent.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{content.contentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{content.displayTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{content.createdBy || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(content.createdAt || content.updatedAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button variant="secondary" onClick={() => handleViewContent(content)}>View</Button>
                      <Button variant="primary" onClick={() => handleActionClick(content, 'approve')}>Approve</Button>
                      <Button variant="danger" onClick={() => handleActionClick(content, 'reject')}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Content Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Details: ${selectedContent?.displayTitle || ''}`}>
        {selectedContent && (
          <div className="space-y-4 text-gray-700 max-h-96 overflow-y-auto">
            <p><strong>Type:</strong> {selectedContent.contentType}</p>
            <p><strong>Title (EN):</strong> {selectedContent.titleEnglish}</p>
            <p><strong>Title (HI):</strong> {selectedContent.titleHindi}</p>
            {selectedContent.summaryEnglish && <p><strong>Summary (EN):</strong> {selectedContent.summaryEnglish}</p>}
            {selectedContent.summaryHindi && <p><strong>Summary (HI):</strong> {selectedContent.summaryHindi}</p>}
            {selectedContent.description && <p><strong>Description:</strong> {selectedContent.description}</p>}
            {selectedContent.author && <p><strong>Author:</strong> {selectedContent.author}</p>}
            {selectedContent.newsDate && <p><strong>News Date:</strong> {formatDate(selectedContent.newsDate)}</p>}
            {selectedContent.orderDate && <p><strong>Order Date:</strong> {formatDate(selectedContent.orderDate)}</p>}
            {selectedContent.attachmentUrl && (
              <p><strong>Attachment:</strong> <a href={`${import.meta.env.VITE_API_BASE_URL}${selectedContent.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Attachment</a></p>
            )}
            {selectedContent.imageUrl && (
              <p><strong>Image:</strong> <a href={`${import.meta.env.VITE_API_BASE_URL}${selectedContent.imageUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Image</a></p>
            )}
            {selectedContent.mediaUrl && (
              <p><strong>Media:</strong> <a href={`${import.meta.env.VITE_API_BASE_URL}${selectedContent.mediaUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Media</a></p>
            )}
            {selectedContent.thumbnailUrl && (
              <p><strong>Thumbnail:</strong> <a href={`${import.meta.env.VITE_API_BASE_URL}${selectedContent.thumbnailUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Thumbnail</a></p>
            )}
            {selectedContent.contentEnglish && (
              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold mb-2">Content (English):</p>
                <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: selectedContent.contentEnglish }}></div>
              </div>
            )}
            {selectedContent.contentHindi && (
              <div className="border-t border-gray-200 pt-4">
                <p className="font-semibold mb-2">Content (Hindi):</p>
                <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: selectedContent.contentHindi }}></div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog for Approve/Reject */}
      <ConfirmationDialog
        isOpen={showConfirmAction}
        onClose={() => setShowConfirmAction(false)}
        onConfirm={handleConfirmAction}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Content`}
        message={`Are you sure you want to ${actionType} "${selectedContent?.displayTitle}" (${selectedContent?.contentType})?`}
      />
    </div>
  );
};

export default ContentApprovalPage;
