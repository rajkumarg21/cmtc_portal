// // src/components/ui/ConfirmationModal.jsx
// import React from 'react';
// import { createPortal } from 'react-dom'; // For better accessibility and z-index control

// const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
//   if (!isOpen) return null;

//   // Use createPortal to render the modal outside the main app div, usually into 'body'
//   return createPortal(
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
//         <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
//         <p className="text-gray-700 mb-6">{message}</p>
//         <div className="flex justify-end space-x-4">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//           >
//             Confirm
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body // Append to the body
//   );
// };

// export default ConfirmationModal;