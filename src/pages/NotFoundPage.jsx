import React from 'react';
import { Link } from 'react-router-dom';
import {sanitizeText} from '../utils/security'
const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gray-50 p-8 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">{sanitizeText("404")}</h1>
      <p className="text-2xl text-gray-600 mb-8">{sanitizeText("Page Not Found")}</p>
      <p className="text-lg text-gray-700 mb-8">
        {sanitizeText("The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.")}
      </p>
      <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
        {sanitizeText("Go to Homepage")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
