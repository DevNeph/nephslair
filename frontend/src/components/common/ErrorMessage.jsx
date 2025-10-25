import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 my-4">
      <p className="text-red-500">⚠️ {message}</p>
    </div>
  );
};

export default ErrorMessage;