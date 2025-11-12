import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full min-h-[200px] py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;