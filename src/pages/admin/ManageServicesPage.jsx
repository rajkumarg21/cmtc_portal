
// // NEW FILE: src/pages/admin/ManageServicesPage.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAllServiceItems, createServiceItem, updateServiceItem, deleteServiceItem } from '../../services/serviceItemService';
// import { getAllSubscriptionPlans } from '../../services/subscriptionService';
// import { toast } from 'react-toastify';
// import LoadingSpinner from '../../components/ui/LoadingSpinner';
// import Button from '../../components/ui/Button';
// import Modal from '../../components/ui/Modal';
// import ConfirmationDialog from '../../components/common/ConfirmationDialog';
// import { useAuth } from '../../context/AuthContext';

// const ManageServicesPage = () => {
//     const [services, setServices] = useState([]);
//     const [plans, setPlans] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [currentService, setCurrentService] = useState({ name: '', description: '', contentUrl: '', requiredPlanId: '' });
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//     const [serviceToDelete, setServiceToDelete] = useState(null);
//     const { hasRole } = useAuth();
//     const navigate = useNavigate();

//     const fetchServicesAndPlans = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const [servicesData, plansData] = await Promise.all([
//                 getAllServiceItems(),
//                 getAllSubscriptionPlans()
//             ]);
//             setServices(servicesData);
//             setPlans(plansData);
//         } catch (err) {
//             setError('Failed to fetch data.');
//             toast.error('Failed to fetch data.');
//             console.error('Fetch data error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (hasRole(['PORTAL_ADMIN', 'ADMIN', 'EDITOR', 'PUBLISHER'])) {
//             fetchServicesAndPlans();
//         } else {
//             setLoading(false);
//             setError('You do not have permission to access this page.');
//         }
//     }, [hasRole]);

//     const handleAddClick = () => {
//         setIsEditing(false);
//         setCurrentService({ name: '', description: '', contentUrl: '', requiredPlanId: plans.length > 0 ? plans[0].id : '' });
//         setIsModalOpen(true);
//     };

//     const handleEditClick = (service) => {
//         setIsEditing(true);
//         setCurrentService(service);
//         setIsModalOpen(true);
//     };

//     const handleDeleteClick = (service) => {
//         setServiceToDelete(service);
//         setShowDeleteConfirm(true);
//     };

//     const handleConfirmDelete = async () => {
//         setShowDeleteConfirm(false);
//         setLoading(true);
//         try {
//             await deleteServiceItem(serviceToDelete.id);
//             toast.success('Service deleted successfully!');
//             fetchServicesAndPlans();
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Failed to delete service.');
//             console.error('Delete service error:', err);
//             setLoading(false);
//         }
//     };

//     const handleModalClose = () => {
//         setIsModalOpen(false);
//         setCurrentService({ name: '', description: '', contentUrl: '', requiredPlanId: '' });
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setCurrentService(prev => ({
//             ...prev,
//             [name]: name === 'requiredPlanId' ? parseInt(value, 10) : value
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             if (isEditing) {
//                 await updateServiceItem(currentService.id, currentService);
//                 toast.success('Service updated successfully!');
//             } else {
//                 await createServiceItem(currentService);
//                 toast.success('Service added successfully!');
//             }
//             handleModalClose();
//             fetchServicesAndPlans();
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to save service.');
//             toast.error(err.response?.data?.message || 'Failed to save service.');
//             console.error('Save service error:', err);
//             setLoading(false);
//         }
//     };

//     if (loading) return <LoadingSpinner />;
//     if (error) return <p className="text-red-500 text-center">{error}</p>;

//     return (
//         <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-3xl font-bold text-gray-800">Manage Services</h2>
//                 {hasRole(['PORTAL_ADMIN', 'ADMIN', 'EDITOR', 'PUBLISHER']) && (
//                     <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white">
//                         Add New Service
//                     </Button>
//                 )}
//             </div>

//             {services.length === 0 ? (
//                 <p className="text-center text-gray-600">No services found.</p>
//             ) : (
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full bg-white border border-gray-300 rounded-lg">
//                         <thead>
//                             <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
//                                 <th className="py-3 px-4 border-b">ID</th>
//                                 <th className="py-3 px-4 border-b">Name</th>
//                                 <th className="py-3 px-4 border-b">Description</th>
//                                 <th className="py-3 px-4 border-b">Required Plan</th>
//                                 <th className="py-3 px-4 border-b">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {services.map(service => (
//                                 <tr key={service.id} className="hover:bg-gray-50 border-b">
//                                     <td className="py-3 px-4">{service.id}</td>
//                                     <td className="py-3 px-4">{service.name}</td>
//                                     <td className="py-3 px-4">{service.description}</td>
//                                     <td className="py-3 px-4">{service.requiredPlanName}</td>
//                                     <td className="py-3 px-4 space-x-2">
//                                         <Button variant="secondary" onClick={() => handleEditClick(service)}>Edit</Button>
//                                         {hasRole(['PORTAL_ADMIN', 'ADMIN']) && (
//                                             <Button variant="danger" onClick={() => handleDeleteClick(service)}>Delete</Button>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             <Modal isOpen={isModalOpen} onClose={handleModalClose} title={isEditing ? "Edit Service" : "Add Service"}>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <div className="flex flex-col">
//                         <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
//                         <input type="text" id="name" name="name" value={currentService.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
//                     </div>
//                     <div className="flex flex-col">
//                         <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
//                         <textarea id="description" name="description" value={currentService.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
//                     </div>
//                     <div className="flex flex-col">
//                         <label htmlFor="contentUrl" className="text-sm font-medium text-gray-700">Content URL</label>
//                         <input type="text" id="contentUrl" name="contentUrl" value={currentService.contentUrl} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
//                     </div>
//                     <div className="flex flex-col">
//                         <label htmlFor="requiredPlanId" className="text-sm font-medium text-gray-700">Required Plan</label>
//                         <select id="requiredPlanId" name="requiredPlanId" value={currentService.requiredPlanId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
//                             {plans.map(plan => (
//                                 <option key={plan.id} value={plan.id}>{plan.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                         <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
//                         <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
//                             {isEditing ? 'Save Changes' : 'Add Service'}
//                         </Button>
//                     </div>
//                 </form>
//             </Modal>

//             <ConfirmationDialog
//                 isOpen={showDeleteConfirm}
//                 onClose={() => setShowDeleteConfirm(false)}
//                 onConfirm={handleConfirmDelete}
//                 title="Confirm Deletion"
//                 message={`Are you sure you want to delete the service "${serviceToDelete?.name}"? This action cannot be undone.`}
//             />
//         </div>
//     );
// };

// export default ManageServicesPage;