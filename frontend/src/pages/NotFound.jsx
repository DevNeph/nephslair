import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-neutral-900/50 border border-neutral-700 rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Sorry, the page you are looking for could not be found. It's just an accident that was not intentional.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

