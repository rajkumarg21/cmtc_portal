
// // NEW FILE: src/components/SubscriptionRequiredModal.jsx
// import React from 'react';
// import Modal from './ui/Modal';
// import Button from './ui/Button';

// const SubscriptionRequiredModal = ({ isOpen, onClose, requiredPlanName, onRedirectToPlans }) => {
//     const title = "Subscription Required";
//     const message = requiredPlanName
//         ? `This content requires an active subscription to the "${requiredPlanName}" plan.`
//         : "This content requires an active subscription.";

//     return (
//         <Modal isOpen={isOpen} onClose={onClose} title={title}>
//             <div className="p-4 text-center">
//                 <p className="text-lg text-gray-700 mb-4">{message}</p>
//                 <p className="text-sm text-gray-500 mb-6">
//                     Please subscribe to continue viewing this content.
//                 </p>
//                 <div className="flex flex-col space-y-3">
//                     <Button onClick={onRedirectToPlans} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
//                         View Subscription Plans
//                     </Button>
//                     <Button variant="secondary" onClick={onClose} className="w-full">
//                         Cancel
//                     </Button>
//                 </div>
//             </div>
//         </Modal>
//     );
// };

// export default SubscriptionRequiredModal;